"use client";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

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
import ChatPage from "@/components/chat/page";

export default function GamePage () {
  const pathnameList = usePathname()?.split("/");
  const gameCode = pathnameList?.at(-2);

  const [socket, setSocket] = useState<Socket>();
  const [gameId, setGameId] = useState<string>("");
  const [player, setPlayer] = useState();
  const { data: session } = useSession();
  const router = useRouter();

  const createPlayerMutation = trpc.games.createPlayer.useMutation();

  useEffect(() => {
    if (!socket) {
      const newSocket = io("http://localhost:3001");
      setSocket(newSocket);
    } else {
      socket.emit("join_room", gameCode);
    }
  }, [socket]);

  const { data: game } = trpc.games.get.useQuery({
    gameCode: gameCode ?? "",
  });

  if (!game) return;

  const handleJoin = async (nickname: string) => {
    await createPlayerMutation
      .mutateAsync({ gameId: game.id, nickname })
      .then((id) => {
        localStorage.setItem("playerId", id);
      });
  };

  const NicknamePrompt = () => {
    const [routerOpen, setRouterOpen] = useState<boolean>(true);
    const [nickname, setNickname] = useState<string>("");
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
    const playerId = localStorage.getItem("playerId");
    const player = game.users.filter(
      (user) => user.id === playerId || user.userId === session?.user.id
    )[0];
    return (
      <div className="flex flex-col justify-between">
        <div>
          {player || game.creatorId === session?.user.id ? null : (
            <NicknamePrompt />
          )}
          <div>
            <h1 className="font-semibold text-4xl">{game.name}</h1>
            <p className="font-semibold text-muted-foreground">{game.phase}</p>
            {player && player.nickname}
          </div>
        </div>
        <div>
          {player && <ChatPage
            socket={socket}
            username={player.nickname}
            roomId={game.code}
          />}
        </div>
      </div>
    );
  }
}
