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
    state: string;
};

type Info = {
    round: number;
    activeBlackCard: string;
    readerIndex: number;
    playedWhiteCards: string[];
    hands: any;
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
        // if no game with roomId exists, create it
        if (!games[roomId]) {
            console.log("--- Created room with id:", roomId);
            games[roomId] = {
                users: [{
                    nickname,
                    playerId,
                    socketUserId: socket.id,
                    points: 0,
                    connected: true,
                    whiteCardIds: [],
                    playingWhiteCardId: "",
                    state: "card queen",
                }],
                msgs: [],
                info: {
                    round: 0,
                    activeBlackCard: "",
                    playedWhiteCards: [],
                    readerIndex: 0,
                    hands: {},
                },
            };
        }

        // if no user with playerId exists in game, add it
        if (games[roomId].users.filter(x => x.playerId == playerId).length == 0) {
            games[roomId].users.push({
                nickname,
                playerId,
                socketUserId: socket.id,
                points: 0,
                connected: true,
                whiteCardIds: [],
                playingWhiteCardId: "",
                state: "picking",
            })
        }
        else {
            // user re-connected, replace it's socket.id
            let userObject: User = games[roomId].users.filter(x => x.playerId == playerId)[0]
            userObject.socketUserId = socket.id
        }

        // Send chat history to the user who joined the room
        if (games[roomId]) {
            const msgs = games[roomId].msgs;
            socket.emit("chat_history", msgs);

            const info = games[roomId].info;
            socket.emit("game_info_state", info);

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

    socket.on("start_game", (roomId: string, startingWhiteCards: string[]) => {
        console.log("roomId:", roomId)
        console.log("whiteCards:", startingWhiteCards)
        // shuffle deck
        let whiteCards = shuffle(startingWhiteCards)

        // let whiteCards = shuffle(["a", "b", "c", "d", "e", "f", "g", "h", "i"])


        let nPlayers = games[roomId].users.length


        const chunkSize = Math.floor(whiteCards.length / nPlayers);
        console.log(whiteCards.length, nPlayers)
        console.log(chunkSize)

        const chunkedArray = chunkArray(whiteCards, chunkSize);
        console.log(chunkedArray);

        console.log(games[roomId].users)
        let resCards: any = {}
        for (let i = 0; i < chunkedArray.length; i++) {
            if (i < nPlayers) {
                resCards[games[roomId].users[i].playerId] = chunkedArray[i]
            }
            else {
                console.log("rest:", chunkedArray[i])
                games[roomId].info.playedWhiteCards.push(...chunkedArray[i])
            }
        }
        console.log(resCards)
        games[roomId].info.hands = resCards


        io.to(roomId).emit("round_start", resCards);

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
