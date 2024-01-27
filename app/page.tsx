"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { trpc } from "./_trpc/client";

export default function Home() {
  const x = trpc.example.example.useMutation();
  async function test() {
    // console.log(x)
    let res = await x.mutateAsync();
    console.log(res);
  }

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
