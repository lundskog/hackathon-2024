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
import { GameWithUsers } from "@/db/schema";
import ChatPage from "@/components/chat/page";
import { Button } from "@/components/ui/button";

export default function GamePage() {
  const pathnameList = usePathname()?.split("/");
  const gameCode = pathnameList?.at(-1);

  const [socket, setSocket] = useState<Socket>();
  const [connectedUsers, setConnectedUsers] = useState<User[]>();
  const [gameId, setGameId] = useState<string>("");
  const [player, setPlayer] = useState();
  const { data: session } = useSession();
  const router = useRouter();
  const [nickname, setNickname] = useState<string>("");
  const [game, setGame] = useState<GameWithUsers>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(true);

  const nicknameInputRef = useRef<HTMLInputElement>(null);

  const createPlayerMutation = trpc.games.createPlayer.useMutation();
  const playerId = localStorage.getItem("playerId");

  const { data: gameData, refetch: gameRefetch } = trpc.games.get.useQuery(
    {
      gameCode: gameCode ?? "",
    },
    {
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (gameData) {
      setGame(gameData);
    }
  }, [gameData]);

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
      socket.on("connected_users", (data: User[]) => {
        setConnectedUsers((pre) => data);
        console.log(connectedUsers);
      });
    }
  }, [socket, game]);

  if (!game) return;

  const handleStartGame = (socket: Socket) => {
    var cardArray: string[] = [];
    const l = [
      game.decks.map((deck) =>
        deck.deck.cards
          ?.filter((e) => e.type == "white")
          .map((card) => cardArray.push(card.id))
      ),
    ];
    console.log(cardArray);
    socket.emit("start_game", gameCode, cardArray);
  };

  const handleJoin = async (nickname: string) => {
    if (!socket) return;
    await createPlayerMutation
      .mutateAsync({ gameId: game.id, nickname })
      .then((id) => {
        localStorage.setItem("playerId", id);
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

  if (game && socket && socket.connected && gameCode) {
    const player = game.users.filter(
      (user) => user.id === playerId || user.userId === session?.user.id
    )[0];
    return (
      <div className="flex flex-col justify-between">
        <div>
          {player || game.creatorId === session?.user.id ? null : (
            <NicknamePrompt />
          )}
          {JSON.stringify(player)}
          <div>
            <h1 className="font-semibold text-4xl">{game.name}</h1>
            <p className="font-semibold text-muted-foreground">{game.phase}</p>
            {/* {player && player.nickname} */}

            {connectedUsers &&
              connectedUsers.map((user: User, key) => (
                <div key={key}>{user.nickname}</div>
              ))}

            <p></p>
          </div>
        </div>
        <div className="flex items-end">
          {player && (
            <ChatPage
              socket={socket}
              roomId={gameCode}
              username={player.nickname}
            />
          )}
          {game.creatorId === session?.user.id && (
            <Button onClick={() => handleStartGame(socket)} className="m-4">
              Start game
            </Button>
          )}
        </div>
      </div>
    );
  }
}
