"use client";
import { trpc } from "@/app/_trpc/client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export default function GamePage() {
  const pathnameList = usePathname()?.split("/");
  const gameCode = pathnameList?.at(-1);

  const [socket, setSocket] = useState<Socket>();
  const [gameId, setGameId] = useState<string>("");
  const { data: session } = useSession();

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

  const NicknamePrompt = () => {
    return <></>;
  };

  if (game && socket) {
    const GuestInLocal = game.users.filter(
      (user) => user.id === localStorage.getItem("playerId")
    )[0];

    if (GuestInLocal || session) {
      return (
        <div>
          <div>
            {socket.connected ? "Connected" : "?"}
            <h1 className="font-semibold text-4xl">{game.name}</h1>
            <p className="font-semibold text-muted-foreground">{game.phase}</p>
          </div>
        </div>
      );
    }
  }
}
