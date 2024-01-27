import http, { Server as HTTPServer } from "http";
import { Server as SocketIoServer, Socket } from "socket.io";

type ChatMessage = {
  user: string;
  msg: string;
  time: string;
};
// In-memory storage for chat msgs
const chatHistory: { [roomId: string]: { msgs: Array<ChatMessage> } } = {};

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

    console.log(chatHistory);
    // Send chat history to the user who joined the room
    if (chatHistory[roomId]) {
      const msgs = chatHistory[roomId].msgs;
      setTimeout(() => {
        socket.emit("chat_history", msgs);
        console.log("log:", msgs);
      }, 1000);
    }
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
      if (!chatHistory[data.roomId]) {
        chatHistory[data.roomId] = { msgs: [] };
      }
      chatHistory[data.roomId].msgs.push(msg);

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
