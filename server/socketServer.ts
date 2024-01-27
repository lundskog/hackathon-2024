import http, { Server as HTTPServer } from "http";
import { Server as SocketIoServer, Socket } from "socket.io";

// In-memory storage for chat msgs
const chatHistory: { [roomId: string]: { msg: Array<{ user: string; msg: string }> } } = {};

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

    socket.on("join_room", (roomId: string) => {
        socket.join(roomId);
        console.log(`user with id-${socket.id} joined room - ${roomId}`);

        console.log(chatHistory)
        // Send chat history to the user who joined the room
        if (chatHistory[roomId]) {
            const msgs = chatHistory[roomId].msg;
            socket.emit("chat_history", msgs);
            console.log(msgs)
        }
    });

    socket.on("send_msg", (data: { roomId: string; user: string; msg: string }) => {
        console.log(data, "DATA");

        // Save the msg in the chat history
        if (!chatHistory[data.roomId]) {
            chatHistory[data.roomId] = { msg: [] };
        }
        chatHistory[data.roomId].msg.push({ ...data });

        // Broadcast the msg to all users in the room
        io.to(data.roomId).emit("receive_msg", data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server is running on port ${PORT}`);
});
