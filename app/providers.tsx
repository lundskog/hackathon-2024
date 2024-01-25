"use client";

import TRPCProvider from "./_trpc/Provider";
import { ThemeProvider } from "next-themes";
import NextAuthSessionProvider from "./providers/sessionProvider";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  return (
    <ThemeProvider attribute="class">
      <TRPCProvider>
        {status === "loading" ? "Loading session..." : children}
      </TRPCProvider>
    </ThemeProvider>
  );
}
