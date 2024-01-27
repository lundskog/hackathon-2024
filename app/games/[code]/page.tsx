"use client";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

type Users = {
  [nickname: string]: string;
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

export default function GamePage() {
  const pathnameList = usePathname()?.split("/");
  const gameCode = pathnameList?.at(-1);

  const [socket, setSocket] = useState<Socket>();
  const [connectedUsers, setConnectedUsers] = useState<Users>();
  const [gameId, setGameId] = useState<string>("");
  const [player, setPlayer] = useState();
  const { data: session } = useSession();
  const router = useRouter();
  const [nickname, setNickname] = useState<string>("");
  const [game, setGame] = useState<GameWithUsers>();

  const createPlayerMutation = trpc.games.createPlayer.useMutation();
  const playerId = localStorage.getItem("playerId");

  const { data: gameData } = trpc.games.get.useQuery({
    gameCode: gameCode ?? "",
  });

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
      if (session) {
        const creator = game?.users.filter(
          (user) => user.userId === session.user.id
        )[0];
        if (creator) {
          socket.emit("join_room", gameCode, creator.nickname);
        }
      }
      socket.on("connected_users", (data: Users) => {
        setConnectedUsers((pre) => data);
        console.log(connectedUsers);
      });
    }
  }, [socket, session]);

  if (!game) return;

  const handleJoin = async (nickname: string) => {
    if (!socket) return;
    await createPlayerMutation
      .mutateAsync({ gameId: game.id, nickname })
      .then((id) => {
        localStorage.setItem("playerId", id);
      });
    socket.emit("join_room", gameCode, nickname ?? nickname);
  };

  const NicknamePrompt = () => {
    const [routerOpen, setRouterOpen] = useState<boolean>(true);
    return (
      <AlertDialog open={routerOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose nickname</AlertDialogTitle>
            <Input
              onChange={(e) => setNickname(e.currentTarget.value)}
              value={nickname}
              placeholder={"Niels Houben"}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push("/")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleJoin(nickname)}>
              Join
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  if (game && socket && socket.connected) {
    const player = game.users.filter(
      (user) => user.id === playerId || user.userId === session?.user.id
    )[0];
    return (
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
            Object.keys(connectedUsers).map((name, key) => (
              <div key={key}>{name}</div>
            ))}

          <p></p>
        </div>
      </div>
    );
  }
}
