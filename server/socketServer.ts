import http, { Server as HTTPServer } from "http";
import { Server as SocketIoServer, Socket } from "socket.io";
import { shuffle, chunkArray } from "../lib/utils";

type ChatMessage = {
    user: string;
    msg: string;
    time: string;
};

export type Hands = {[playerId: string]: string[]}

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

export type Info = {
    round: number;
    activeBlackCard: string;
    readerIndex: number;
    playedWhiteCards: string[];
    currentPlayingWhiteCards: PlayerWhiteCards,
    hands: Hands;
}

type Game = {
    users: Array<User>;
    info: Info;
    msgs: Array<ChatMessage>;
};

// In-memory storage for chat msgs
const games: { [roomId: string]: Game } = {};

let playedBlackCards: string[] = [];

let blackCards: string[] = [];

let whiteCards: string[] = [];

let restCards = [];

const httpServer: HTTPServer = http.createServer();

const io: SocketIoServer = new SocketIoServer(httpServer, {
    cors: {
        origin: "http://localhost:3000", // Replace with your frontend URL
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
});

export type PlayerWhiteCards = {
    [playerId: string]: string;
  }

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
                    state: "reader",
                }],
                msgs: [],
                info: {
                    round: 0,
                    activeBlackCard: "",
                    playedWhiteCards: [],
                    currentPlayingWhiteCards: {},
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
                state: "picker",
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

  socket.on("winner_picked", (roomId: string, userId: string) => {
    games[roomId].users.find(user => user.playerId === userId)!.points += 1

    // New blackcard
    const chosenBlackCard = blackCards[Math.floor(Math.random() * blackCards.length)]
    games[roomId].info.activeBlackCard = chosenBlackCard;
    blackCards = blackCards.filter(c => c !== chosenBlackCard)??playedBlackCards

    games[roomId].info.currentPlayingWhiteCards = {}
    const currentReaderIndex = games[roomId].info.readerIndex
    currentReaderIndex < Object.keys(games[roomId].users).length-1?games[roomId].info.readerIndex += 1:games[roomId].info.readerIndex=0
    games[roomId].info.round += 1
    games[roomId].users = games[roomId].users.map((user, index) => {
      user.playingWhiteCardId = ""
      index===games[roomId].info.readerIndex?user.state = "reader":user.state = "picker"
      return user
    })

    io.to(roomId).emit("game_info_state", games[roomId].info)
    io.to(roomId).emit("connected_users", games[roomId].users);
  })

  socket.on("display_card", (roomId: string, cardId: string) => {
    io.to(roomId).emit("show_card", cardId)
  })

  socket.on("leave", (roomId: string, playerId: string) => {
    games[roomId].users = games[roomId].users.filter((user, index) => {
      if (user.playerId !== playerId) {
        return user        
      }
    })
    io.to(roomId).emit("connected_users", games[roomId].users);
  })

  socket.on("submit_card", (roomId: string, playerId: string, usersPlayingWhiteCard: string) => {
    games[roomId].users.find(user => user.playerId === playerId)!.playingWhiteCardId = usersPlayingWhiteCard;
    const removeWhiteCardIndex = games[roomId].info.hands[playerId].indexOf(usersPlayingWhiteCard)
    games[roomId].info.hands[playerId].splice(removeWhiteCardIndex, 1)
    const randomWhiteCard = games[roomId].info.playedWhiteCards
    const randomCardIndex = Math.floor(Math.random()*randomWhiteCard.length)
    games[roomId].info.hands[playerId].push(randomWhiteCard[randomCardIndex])
    games[roomId].info.playedWhiteCards.splice(randomCardIndex, 1)
    games[roomId].info.playedWhiteCards.push(usersPlayingWhiteCard);
    games[roomId].info.currentPlayingWhiteCards[playerId] = usersPlayingWhiteCard;
    if (Object.keys(games[roomId].info.currentPlayingWhiteCards).length === games[roomId].users.length - 1) {
      io.to(roomId).emit("game_info_state", games[roomId].info)
    }
    io.to(roomId).emit("connected_users", games[roomId].users);
    })
  
    socket.on("start_game", (roomId: string, startingWhiteCards: string[], blackCardsAtStart: string[]) => {
        console.log("roomId:", roomId)
      console.log("whiteCards:", startingWhiteCards)
      console.log("BLACK CARDS:", blackCardsAtStart);
        // shuffle deck
        whiteCards = shuffle(startingWhiteCards)

        // let whiteCards = shuffle(["a", "b", "c", "d", "e", "f", "g", "h", "i"])


        let nPlayers = games[roomId].users.length


        const lowerThanEight = Math.floor(whiteCards.length / nPlayers) < 8;
        const chunkSize = lowerThanEight?Math.floor(whiteCards.length / nPlayers):8;
        console.log(whiteCards.length, nPlayers)
        console.log(chunkSize)

        const chunkedArray = chunkArray(whiteCards, chunkSize);
        console.log(chunkedArray);

        console.log(games[roomId].users)
        let resCards: Hands = {}
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
        
      const chosenBlackCard = blackCardsAtStart[Math.floor(Math.random() * blackCardsAtStart.length)]
      
      playedBlackCards.push(chosenBlackCard);
      
      games[roomId].info.activeBlackCard = chosenBlackCard;
        
      blackCards = blackCardsAtStart.filter(c => c !== chosenBlackCard);
      
        const gameInfo = games[roomId].info
      
        io.to(roomId).emit("round_start", resCards, gameInfo);

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
