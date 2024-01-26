"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center">
        <h1 className="font-bold text-7xl">Allgood.cards</h1>
        <div className="flex gap-2">
          <Link href={"/games/create"}>
            <Button className="font-semibold w-fit">Create game</Button>
          </Link>
          <Button variant={"secondary"} className="font-semibold w-fit">
            Read more
          </Button>
        </div>
      </div>
    </div>
  );
}
