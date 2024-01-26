"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { trpc } from "./_trpc/client";

export default function Home () {
  const x = trpc.example.example.useMutation()
  async function test () {
    // console.log(x)
    let res = await x.mutateAsync()
    console.log(res)
  }

  return (
    <div>
      <Button onClick={() => void test()} className="font-semibold">Shush</Button>
    </div>
  );
}
