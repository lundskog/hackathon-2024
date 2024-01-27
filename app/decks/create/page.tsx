"use client";

import { CreateDeckForm } from "@/components/CreateDeckForm";
import React from "react";

export default function CreateDeckPage() {
  return (
    <div className="flex flex-col gap-2 items-center w-full h-full justify-center">
      <div className="flex flex-col items-center">
        <h1 className="font-bold text-3xl">Create deck</h1>
        <p className="font-semibold text-muted-foreground">
          Create a brand new deck of cards.
        </p>
      </div>
      <CreateDeckForm />
    </div>
  );
}
