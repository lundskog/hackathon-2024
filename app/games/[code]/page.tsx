"use client";
import { trpc } from "@/app/_trpc/client";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function GamePage() {
  const pathnameList = usePathname()?.split("/");
  const gameCode = pathnameList?.at(-1);

  const { data: game } = trpc.games.get.useQuery({
    gameCode: gameCode ?? "",
  });

  if (game) {
    const GuestInLocal = game.users.filter(
      (user) => user.id === localStorage.getItem("playerId")
    );
    if (GuestInLocal) {
      return (
        <div>
          <div>
            <h1 className="font-semibold text-4xl">{game.name}</h1>
            <p className="font-semibold text-muted-foreground">{game.phase}</p>
          </div>
        </div>
      );
    }
  }
}
