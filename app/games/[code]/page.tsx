"use client";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { v4 } from "uuid";
import { Card, GameWithUsers } from "@/db/schema";
import ChatPage from "@/components/chat/page";
import { Button } from "@/components/ui/button";
import DecksPage from "@/app/decks/page";
import PlayerView from "@/components/PlayerView";
import PlayerState from "@/components/PlayerState";
import Board from "@/components/Board";
import { Hands, Info, PlayerWhiteCards } from "@/server/socketServer";
import { capitalize, shufflePlayerData } from "@/lib/utils";
import { Card as UICard } from "@/components/ui/card";
import { CircleDashed, ThumbsUp } from "lucide-react";

export default function GamePage() {
  const pathnameList = usePathname()?.split("/");
  const gameCode = pathnameList?.at(-1);

  const [socket, setSocket] = useState<Socket>();
  const [connectedUsers, setConnectedUsers] = useState<User[]>();
  const { data: session } = useSession();
  const router = useRouter();
  const [game, setGame] = useState<GameWithUsers>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(true);
  const [gameInfo, setGameInfo] = useState<Info>();
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>();
  const [displayedCard, setDisplayedCard] = useState<string>();
  const [playerWhiteCards, setPlayerWhiteCards] = useState<PlayerWhiteCards>();
  const [playerWhiteCardsPerm, setPlayerWhiteCardsPerm] =
    useState<PlayerWhiteCards>();
  const [showAllCards, setShowAllCards] = useState<boolean>(false);
  type WhiteCards = {
    [whiteCardId: string]: Card;
  };

  type BlackCards = {
    [blackCardId: string]: Card;
  };

  const [whiteCards, setWhiteCards] = useState<WhiteCards>();
  const [blackCards, setBlackCards] = useState<BlackCards>();

  const [activeBlackCard, setActiveBlackCard] = useState<string | undefined>(
    undefined
  );

  const [myPickedWhiteCard, setMyPickedWhiteCard] = useState<string>();

  useEffect(() => {
    if (gameInfo) {
      setActiveBlackCard(gameInfo.activeBlackCard);
    }
  }, [gameInfo]);

  const [hand, setHand] = useState<{ text: string; id: string }[]>([]);

  const nicknameInputRef = useRef<HTMLInputElement>(null);

  const createPlayerMutation = trpc.games.createPlayer.useMutation();

  useEffect(() => {
    const pId = localStorage.getItem("playerId");
    if (pId && !playerId) {
      setPlayerId(pId);
    }
  }, [playerId]);

  const { data: gameData, refetch: gameRefetch } = trpc.games.get.useQuery(
    {
      gameCode: gameCode ?? "",
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  const pickWinner = (socket: Socket, userId: string) => {
    socket.emit("winner_picked", gameCode, userId);
    setShowAllCards(false);
    setPlayerWhiteCardsPerm(undefined);
    setPlayerWhiteCards(undefined);
  };

  const CardNextButton = ({ socket }: { socket: Socket }) => {
    if (!playerWhiteCards) return;

    const handleSelectRandomCard = () => {
      const playerIds = Object.keys(playerWhiteCards);
      if (playerIds.length === 0) {
        console.warn("No more cards to select");
        return;
      }

      const randomIndex = Math.floor(Math.random() * playerIds.length);
      const selectedPlayerId = playerIds[randomIndex];
      const newSelectedCard = playerWhiteCards[selectedPlayerId];

      // Update selected card state
      setDisplayedCard(newSelectedCard);
      socket.emit("display_card", gameCode, newSelectedCard);

      // Remove selected item from playerWhiteCards
      const updatedPlayerWhiteCards = { ...playerWhiteCards };
      delete updatedPlayerWhiteCards[selectedPlayerId];
      setPlayerWhiteCards(updatedPlayerWhiteCards);
    };

    return (
      <div>
        {Object.keys(playerWhiteCards).length > 0 ? (
          <Button onClick={() => handleSelectRandomCard()}>
            Show Next Card
          </Button>
        ) : (
          !showAllCards && (
            <Button onClick={() => setShowAllCards(true)}>Vote</Button>
          )
        )}
      </div>
    );
  };

  const handlePickCard = (cardId: string) => {
    setMyPickedWhiteCard(cardId);
  };

  const handleSubmitCard = (socket: Socket, gameId: string, cardId: string) => {
    socket.emit("submit_card", gameId, playerId, cardId);
  };

  useEffect(() => {
    if (gameData) {
      setGame(gameData);
      let gameDataWhiteCards: WhiteCards = {};
      let gameDataBlackCards: BlackCards = {};
      gameData.decks.forEach((deck) =>
        deck.deck.cards
          ?.filter((e) => e.type == "white")
          .forEach((card) => {
            gameDataWhiteCards[card.id] = {
              ...card,
            };
          })
      );
      gameData.decks.forEach((deck) =>
        deck.deck.cards
          ?.filter((e) => e.type == "black")
          .forEach((card) => {
            gameDataBlackCards[card.id] = {
              ...card,
            };
          })
      );
      setWhiteCards(gameDataWhiteCards);
      setBlackCards(gameDataBlackCards);
      const pIdUser = gameData.users.filter(
        (user) => user.userId === session?.user.id
      );
      if (pIdUser[0]) {
        setPlayerId(pIdUser[0].id);
      }
    }
  }, [gameData]);

  useEffect(() => {
    const connectedPlayer =
      connectedUsers &&
      connectedUsers.filter((user) => user.playerId === playerId)[0];
    setMyPickedWhiteCard(connectedPlayer?.playingWhiteCardId);
  }, [connectedUsers]);

  useEffect(() => {
    if (!socket) {
      const newSocket = io("http://localhost:3001");
      setSocket(newSocket);
    } else {
      if (game) {
        const creator = game.users.filter(
          (user) =>
            user.userId === session?.user.id &&
            game.creatorId === session.user.id
        )[0];
        if (creator) {
          setPlayerId(creator.id);
          socket.emit("join_room", gameCode, creator.nickname, creator.id);
        } else {
          const guestNickname = game.users.filter(
            (user) => user.id === playerId
          )[0]?.nickname;
          if (guestNickname) {
            socket.emit("join_room", gameCode, guestNickname, playerId);
          }
        }
      }
      socket.on("connected_users", (userData: User[]) => {
        setConnectedUsers(userData);
      });
      socket.on("game_info_state", (info: Info) => {
        setGameInfo(info);
        setPlayerWhiteCards(info.currentPlayingWhiteCards);
        setPlayerWhiteCardsPerm(info.currentPlayingWhiteCards);
        setDisplayedCard(undefined);
        if (whiteCards) {
          if (playerId) {
            const myHand: string[] | undefined = info.hands[playerId];
            if (myHand) {
              setGameStarted(true);
              const x = myHand.map((whiteCardId) => {
                try {
                  if (!whiteCards[whiteCardId].cardText) {
                    console.log(
                      "WAIDIAWHDIAWHIDA:,",
                      whiteCards,
                      whiteCards[whiteCardId]
                    );
                  }
                } catch (e) {
                  console.log(whiteCards);
                  console.log(whiteCardId);
                  console.log(myHand);
                }
                return {
                  text: whiteCards[whiteCardId].cardText,
                  id: whiteCards[whiteCardId].id,
                };
              });

              setHand(x);
            }
          }
        }
      });
      socket.on(
        "round_start",
        (hands: Hands, info: Info) => {
          setGameInfo(info);
          if (whiteCards) {
            if (playerId) {
              const myHand: string[] = hands[playerId];
              const x = myHand.map((whiteCardId) => {
                return {
                  text: whiteCards[whiteCardId].cardText,
                  id: whiteCards[whiteCardId].id,
                };
              });

              setHand(x);
            }
          }
        }
        // console.log(hands[])
      );
      socket.on("show_card", (cardId: string) => {
        setDisplayedCard(cardId);
      });
    }
  }, [socket, game]);

  if (!game) return;

  const handleStartGame = (socket: Socket) => {
    var whiteCardArray: string[] = [];
    game.decks.map((deck) =>
      deck.deck.cards
        ?.filter((e) => e.type == "white")
        .map((card) => whiteCardArray.push(card.id))
    );
    var blackCardArray: string[] = [];
    game.decks.map((deck) =>
      deck.deck.cards
        ?.filter((e) => e.type == "black")
        .map((card) => blackCardArray.push(card.id))
    );
    socket.emit("start_game", gameCode, whiteCardArray, blackCardArray);
    setGameStarted(true);
  };

  const handleJoin = async (nickname: string) => {
    if (!socket) return;
    await createPlayerMutation
      .mutateAsync({ gameId: game.id, nickname })
      .then((id) => {
        setGame((prev) => {
          if (prev) {
            prev.users.push({
              gameId: game.id,
              id,
              joinedAt: new Date(),
              nickname,
              userId: session?.user.name ?? null,
            });
            return prev;
          }
        });
        localStorage.setItem("playerId", id);
        setPlayerId(id);
        socket.emit("join_room", gameCode, nickname, id);
        setDialogOpen(false);
        gameRefetch();
      });
  };

  const NicknamePrompt = () => {
    return (
      <AlertDialog open={dialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose nickname</AlertDialogTitle>
            <Input ref={nicknameInputRef} placeholder={"Niels Houben"} />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push("/")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                nicknameInputRef.current &&
                handleJoin(nicknameInputRef.current.value)
              }
            >
              Join
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  if (
    game &&
    socket &&
    socket.connected &&
    gameCode &&
    blackCards &&
    whiteCards
  ) {
    const player = game.users.filter(
      (user) => user.id === playerId || user.userId === session?.user.id
    )[0];
    const connectedPlayer =
      connectedUsers &&
      connectedUsers.filter((user) => user.playerId === player.id)[0];
    return (
      <div className="flex w-full justify-center">
        <div className="fixed top-0 right-0 m-4">
          {player && (
            <ChatPage
              socket={socket}
              roomId={gameCode}
              username={player.nickname}
            />
          )}
        </div>
        {/* {connectedUsers && (
          <PlayerView
            players={connectedUsers.map((user: User) => {
              return {
                id: user.playerId,
                name: user.nickname,
                color_hex: "#603FE7",
                state: user.state,
              };
            })}
          />
        )} */}
        <div className="flex flex-col justify-between absolute h-full left-0 p-4">
          <div>
            {player || game.creatorId === session?.user.id ? null : (
              <NicknamePrompt />
            )}
            {/* {JSON.stringify(player)} */}
            <div>
              <h1 className="font-semibold text-4xl">{game.name}</h1>
              <p className="font-semibold text-muted-foreground">
                Kort Mot Man
              </p>
              {/* {player && player.nickname} */}

              <div className="flex flex-col gap-2">
                {connectedUsers &&
                  connectedUsers.map((user: User, key) => {
                    return (
                      <UICard
                        className={` px-4 py-2 flex items-center justify-between gap-1`}
                        key={key}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex gap-2 items-center">
                            <span
                              className={`${
                                user.playerId === player.id
                                  ? "text-primary"
                                  : ""
                              } font-semibold`}
                            >
                              {user.nickname}
                            </span>{" "}
                            <span
                              className={`${
                                user.state === "picker"
                                  ? "bg-white text-black"
                                  : "bg-black text-white"
                              } font-semibold text-xs px-1 py-0.5 rounded-sm shadow-md`}
                            >
                              {capitalize(user.state)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">
                            {user.points}
                          </span>
                          {user.state === "picker" ? (
                            user.playingWhiteCardId ? (
                              <ThumbsUp size={16} className="text-primary" />
                            ) : (
                              <>
                                <CircleDashed
                                  size={16}
                                  strokeWidth={2.5}
                                  style={{ animationDuration: "2000ms" }}
                                  className="animate-spin text-amber-600"
                                />
                              </>
                            )
                          ) : (
                            ""
                          )}
                        </div>
                      </UICard>
                    );
                  })}
                {game.creatorId !== session?.user.id &&
                  connectedPlayer &&
                  connectedPlayer.state !== "reader" && (
                    <Button
                      variant={"destructive"}
                      onClick={() => {
                        socket.emit("leave", gameCode, playerId);
                        router.push("/");
                      }}
                    >
                      Leave
                    </Button>
                  )}
              </div>
            </div>
          </div>
          <div className="flex items-end">
            {game.creatorId === session?.user.id &&
              connectedUsers &&
              connectedUsers?.length > 2 &&
              !gameStarted && (
                <Button onClick={() => handleStartGame(socket)} className="m-4">
                  Start game
                </Button>
              )}
          </div>
        </div>
        <div className="flex flex-col justify-between items-center">
          <div className="flex gap-4">
            {activeBlackCard && (
              <div
                className="
            shadow-md
            border-2 border-black/10
            font-semibold hover:pointer-events-auto p-4
            cursor-pointer bg-black text-white w-48 h-80 relative hover:z-50 top-0 hover:-top-2 transition-all
            rounded-xl"
              >
                {blackCards[activeBlackCard].cardText}
              </div>
            )}
            {displayedCard && !showAllCards && (
              <div
                className="
              shadow-md
              border-2 border-black/10
              font-semibold hover:pointer-events-auto p-4
              cursor-pointer bg-gray-100 hover:bg-white/100 text-black w-48 h-80 relative hover:z-50 top-0 hover:-top-2 transition-all
              rounded-xl"
              >
                {whiteCards[displayedCard].cardText}
              </div>
            )}
            {connectedPlayer?.state === "reader" &&
              Object.keys(gameInfo!.currentPlayingWhiteCards).length > 0 && (
                <CardNextButton socket={socket} />
              )}
            {myPickedWhiteCard &&
              Object.keys(gameInfo!.currentPlayingWhiteCards).length < 1 && (
                <div
                  className="
                shadow-md
                border-2 border-black/10
                font-semibold hover:pointer-events-auto p-4
                cursor-pointer bg-gray-100 hover:bg-white/100 text-black w-48 h-80 relative hover:z-50 top-0 hover:-top-2 transition-all
                rounded-xl"
                >
                  {whiteCards[myPickedWhiteCard].cardText}
                </div>
              )}
          </div>
          <div className="flex gap-2">
            {showAllCards && playerWhiteCardsPerm && (
              <>
                {Object.keys(playerWhiteCardsPerm).map((userId) => {
                  const thisWhiteCard =
                    whiteCards[playerWhiteCardsPerm[userId]];
                  return (
                    <div
                      onClick={() => pickWinner(socket, userId)}
                      key={thisWhiteCard.id}
                      className="
                  shadow-md
                  border-2 border-black/10
                  font-semibold hover:pointer-events-auto p-4
                  cursor-pointer bg-gray-100 hover:bg-white/100 text-black w-48 h-80 relative hover:z-50 top-0 hover:-top-2 transition-all
                rounded-xl"
                    >
                      {thisWhiteCard.cardText}
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <div className="flex gap-2">
            {myPickedWhiteCard &&
              connectedPlayer &&
              !connectedPlayer.playingWhiteCardId && (
                <Button
                  onClick={() =>
                    handleSubmitCard(socket, game.code, myPickedWhiteCard)
                  }
                >
                  Submit
                </Button>
              )}
          </div>
          <div>
            {connectedPlayer &&
              connectedPlayer.state === "picker" &&
              !connectedPlayer.playingWhiteCardId && (
                <div className="flex gap-2 -space-x-24">
                  {hand.map((card) => {
                    if (card.id !== myPickedWhiteCard) {
                      return (
                        <div
                          onClick={() => handlePickCard(card.id)}
                          className="
                      shadow-md
                      border-2 border-black/10
                      font-semibold hover:pointer-events-auto p-4
                      cursor-pointer bg-gray-100 hover:bg-white/100 text-black w-48 h-80 relative hover:z-50 top-0 hover:-top-2 transition-all
                      rounded-xl"
                          key={card.id}
                        >
                          {card.text}
                        </div>
                      );
                    }
                  })}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
}
