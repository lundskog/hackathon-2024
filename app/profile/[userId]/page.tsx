"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Ban, UserPlus2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { redirect, usePathname } from "next/navigation";
import { useRouter } from "next/router";
// import { redirect } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const firstName = session?.user.name?.split(" ")[0];
  const lastName = session?.user.name?.split(" ")[1];
  return (
    <div className="flex justify-center w-full">
      <div className="flex items-center flex-col gap-2">
        <Avatar className="w-32 h-32">
          <AvatarImage
            // src={undefined}
            src={session?.user.image ?? undefined}
            alt="User Avatar"
          />
          <AvatarFallback>
            {firstName?.charAt(0)}
            {lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-semibold">{session?.user.name}</h1>
          <p className="text-muted-foreground">{session?.user.email}</p>
        </div>
        <div className="flex gap-1">
          <Button className="flex gap-1">
            <UserPlus2 size={16} /> Invite
          </Button>
          <Button
            onClick={() => signOut()}
            variant="destructive"
            className="flex gap-1"
          >
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
