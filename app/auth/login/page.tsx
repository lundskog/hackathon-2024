"use client";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
// import { redirect } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function LoginPage() {
  const { data: session } = useSession();
  if (session) {
    redirect("/");
  }
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={() => signIn("github")}>GitHub</Button>
      <Button onClick={() => signIn("google")}>Google</Button>
      {/* <Suspense fallback={<div>loading...</div>}>{<Shush />}</Suspense> */}
    </div>
  );
}
