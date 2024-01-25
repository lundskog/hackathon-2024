"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { type Session } from "next-auth";

interface Props {
  children?: React.ReactNode;
}

export default function NextAuthSessionProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
