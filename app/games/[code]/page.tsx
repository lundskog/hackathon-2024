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

export default function GamePage() {
  const pathnameList = usePathname()?.split("/");
  const gameCode = pathnameList?.at(-1);

  const [socket, setSocket] = useState<Socket>();
  const [gameId, setGameId] = useState<string>("");
  const [player, setPlayer] = useState();
  const { data: session } = useSession();
  const router = useRouter();

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

  function handleJoin() {}

  const NicknamePrompt = () => {
    const [routerOpen, setRouterOpen] = useState<boolean>(true);
    return (
      <AlertDialog open={routerOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose nickname</AlertDialogTitle>
            <Input placeholder={"Niels Houben"} />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push("/")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction>Join</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  if (game && socket && socket.connected) {
    const GuestInLocal = game.users.filter(
      (user) => user.id === localStorage.getItem("playerId")
    )[0];

    return (
      <div>
        {GuestInLocal || game.creatorId === session?.user.id ? null : (
          <NicknamePrompt />
        )}
        <div>
          <h1 className="font-semibold text-4xl">{game.name}</h1>
          <p className="font-semibold text-muted-foreground">{game.phase}</p>
        </div>
      </div>
    );
  }
}
