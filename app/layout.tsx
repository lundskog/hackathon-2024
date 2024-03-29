import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";

import TRPCProvider from "./_trpc/Provider";
import { Providers } from "./providers";
import NextAuthSessionProvider from "./providers/sessionProvider";
import dynamic from "next/dynamic";
import NextTopLoader from "nextjs-toploader";
import ThemeSwitchButton from "@/components/ThemeSwitchButton";
import { Toaster } from "@/components/ui/toaster";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <Providers>
            <main className="flex min-h-screen overflow-hidden">
              {/* <div className="relative max-w-[1080px] w-full flex grow py-4"> */}
              <div className="relative w-full flex grow p-4 overflow-hidden">
                {children}
              </div>
              <ThemeSwitchButton />
              <Toaster />
            </main>
            {/* <Footer /> */}
          </Providers>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
