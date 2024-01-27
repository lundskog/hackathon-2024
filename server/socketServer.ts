import http, { Server as HTTPServer } from "http";
import { Server as SocketIoServer, Socket } from "socket.io";
import cors from "cors";

let gameinfo = []

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
        gameinfo.push({ roomId })
        console.log(`user with id-${socket.id} joined room - ${roomId}`);
    });

    socket.on("send_msg", (data: { roomId: string; message: string }) => {
        console.log(data, "DATA");
        // This will send a message to a specific room ID
        socket.to(data.roomId).emit("receive_msg", data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
httpServer.listen(PORT, () => {
    console.log(`Socket.io server is running on port ${PORT}`);
});
