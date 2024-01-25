"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function ErrorPage() {
  const [imgVisible, setImgVisible] = useState(false);
  const router = useRouter();

  return (
    <main className="fixed w-screen top-0 left-0 min-h-screen flex flex-col justify-center items-center grow">
      <div className="flex justify-center items-center">
        <div className="flex justify-center flex-col items-center gap-4">
          <div className="flex justify-center items-center flex-col">
            <h1 className="text-primary font-black text-9xl">404</h1>
            <p className="font-semibold text-xl text-foreground">
              Sorry, this page doesn&apos;t exist.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
