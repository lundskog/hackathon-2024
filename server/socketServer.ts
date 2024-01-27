import http, { Server as HTTPServer } from "http";
import { Server as SocketIoServer, Socket } from "socket.io";
import { shuffle, chunkArray } from "../lib/utils";

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
    whiteCardIds: string[];
    playingWhiteCardId: string;
};

type Info = {
    round: number;
    activeBlackCard: string;
    readerIndex: number;
    playedWhiteCards: string[];
}

type Game = {
    users: Array<User>;
    info: Info;
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
            games[roomId] = {
                users: [],
                msgs: [],
                info: {
                    round: 0,
                    activeBlackCard: "",
                    playedWhiteCards: [],
                    readerIndex: 0
                },
            };
        }

        if (games[roomId].users.filter(x => x.playerId == playerId).length == 0) {
            games[roomId].users.push({
                nickname,
                playerId,
                socketUserId: socket.id,
                points: 0,
                connected: true,
                whiteCardIds: [],
                playingWhiteCardId: ""
            })
        }
        else {
            let userObject: User = games[roomId].users.filter(x => x.playerId == playerId)[0]
            userObject.socketUserId = socket.id
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

    socket.on("start_game", (data: { roomId: string, whiteCards: string[] }) => {
        // shuffle deck
        let whiteCards = shuffle(data.whiteCards)
        let numberOfUsers = games[data.roomId].users.length

        // split up deck according to players
        const chunkedArray = chunkArray(whiteCards, numberOfUsers);
        console.log(chunkArray)


        io.to(data.roomId).emit("round_start", {});
        // { 
        //     playerId: whiteCardIds: string[]; 
        // }
        // add  remaining cards to unplayed

        // console.log("A user disconnected:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server is running on port ${PORT}`);
});
