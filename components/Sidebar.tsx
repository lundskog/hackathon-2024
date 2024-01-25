"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { Card } from "./ui/card";
import { redirect, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Flag, LogOut, Settings, User2 } from "lucide-react";

interface NavLink {
  title: string;
  path: string;
}

const navLinks: NavLink[] = [
  {
    title: "View",
    path: "/",
  },
  {
    title: "Routines",
    path: "/routines",
  },
];

function MappedNavLinks() {
  return (
    <ul className="flex flex-col gap-2">
      {navLinks.map((navLink) => {
        return <SidebarItem key={navLink.path} {...navLink} />;
      })}
    </ul>
  );
}

export default function Sidebar() {
  return (
    <div className="w-[240px] p-4 flex flex-col gap-4 z-50">
      <UserCard />
      <MappedNavLinks />
    </div>
  );
}

function UserCard() {
  const { data: session } = useSession();

  const firstName = session?.user.name?.split(" ")[0];
  const lastName = session?.user.name?.split(" ")[1];

  return (
    <>
      <div className="flex gap-2">
        <div className="relative flex justify-center items-center">
          <Link href={`/profile/${session?.user.username}`}>
            <Avatar>
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
          </Link>
        </div>
        {/* <div className="flex flex-col overflow-hidden">
          <h1 className="font-semibold whitespace-nowrap text-sm text-ellipsis overflow-hidden">
            {session?.user.name}
          </h1>
          <p className="font-medium whitespace-nowrap text-foreground/50 text-xs overflow-hidden text-ellipsis">
            {session?.user.email}
          </p>
        </div> */}
      </div>
      {/* <div className="flex gap-1">
        <Link href={`/profile/${session?.user.username}`}>
          <Button variant="default">
            <User2 size={16} />
          </Button>
        </Link>
        <Button variant="secondary" size={"icon"}>
          <Settings className="text-muted-foreground" size={16} />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => signOut()}>
          T-
          <LogOut size={16} />
        </Button>
      </div> */}
    </>
  );
}

function SidebarItem(props: NavLink) {
  const pathname = usePathname();
  const isCurrentPath = props.path === pathname;
  return (
    <Link href={props.path}>
      <li>
        <Button
          className={cn([
            "transition-all font-semibold w-fit justify-start",
            isCurrentPath ? "w-fit" : "hover:w-fit",
          ])}
        >
          {props.title}
        </Button>
      </li>
    </Link>
  );
}
