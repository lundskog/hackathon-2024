import http, { Server as HTTPServer } from "http";
import { Server as SocketIoServer, Socket } from "socket.io";

type ChatMessage = {
    user: string;
    msg: string;
    time: string;
};

type User = {
    nickname: string;
    playerId: string;
    socketUserId: string;
    points: number;
    connected: boolean;
};

type Game = {
    users: Array<User>;
    msgs: Array<ChatMessage>;
};

// In-memory storage for chat msgs
const games: { [roomId: string]: Game } = {};

const httpServer: HTTPServer = http.createServer();

const io: SocketIoServer = new SocketIoServer(httpServer, {
    cors: {
        origin: "http://localhost:3000", // Replace with your frontend URL
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
});

io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_room", (roomId: string, nickname: string, playerId: string) => {
        socket.join(roomId);
        console.log(`user with id-${socket.id} joined room - ${roomId}`);
        if (!games[roomId]) {
            console.log("--- Created room with id:", roomId);
            games[roomId] = { users: [], msgs: [] };
        }
        if (games[roomId].users.filter(x => x.playerId == playerId).length == 0) {
            games[roomId].users.push({
                nickname,
                playerId,
                socketUserId: socket.id,
                points: 0,
                connected: false,
            })

        }

        // Send chat history to the user who joined the room
        if (games[roomId]) {
            const msgs = games[roomId].msgs;
            socket.emit("chat_history", msgs);

            console.log("--- Sent out chat history:");
            console.log(msgs);
        }

        io.to(roomId).emit("connected_users", games[roomId].users);
        console.log("--- Sent out connected users:");
        console.log(games[roomId].users);
    });

    socket.on(
        "send_msg",
        (data: { roomId: string; user: string; msg: string; time: string }) => {
            console.log(data, "DATA");
            let msg: ChatMessage = {
                user: data.user,
                msg: data.msg,
                time: data.time,
            };

            // Save the msg in the chat history
            games[data.roomId].msgs.push(msg);

            // Broadcast the msg to all users in the room
            io.to(data.roomId).emit("receive_msg", msg);
        }
    );

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server is running on port ${PORT}`);
});
