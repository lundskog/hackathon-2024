"use client";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { v4 } from "uuid";

export default function DeckPage() {
  const pathnameList = usePathname()?.split("/");
  const deckId = pathnameList?.at(-1);

  const whiteCardInput = useRef<HTMLInputElement>(null);
  const blackCardInput = useRef<HTMLInputElement>(null);

  const addCardMutation = trpc.decks.createCard.useMutation();
  const { data: deck, refetch: deckRefetch } = trpc.decks.getOne.useQuery(
    {
      deckId: deckId ?? "",
    },
    { enabled: deckId ? deckId.length > 0 : false }
  );

  async function handleAddCard(
    deckId: string,
    cardText: string,
    type: "white" | "black"
  ) {
    await addCardMutation
      .mutateAsync({ deckId, cardText, type, id: v4() })
      .then(() => {
        deckRefetch();
      });
  }

  if (deck) {
    return (
      <div className="w-full">
        <div>
          <h1 className="font-semibold text-4xl">{deck.name}</h1>
          <p className="font-semibold text-muted-foreground">
            {deck.description}
          </p>
        </div>
        <div className="flex gap-1 max-w-2xl">
          <form className="flex gap-1 w-full">
            <Input
              ref={whiteCardInput}
              placeholder="Write white card here..."
            />
            <Button
              onClick={() => {
                const c = whiteCardInput.current;
                if (c && c.value.trim().length > 0) {
                  void handleAddCard(
                    deck.id,
                    whiteCardInput.current.value,
                    "white"
                  );
                }
              }}
            >
              Add
            </Button>
          </form>
        </div>
        <div>
          White cards:
          <div className="flex flex-wrap gap-1">
            {deck.cards.map((card) => {
              if (card.type === "white") {
                return (
                  <Card
                    className="p-2 w-fit bg-white text-black text-sm font-medium"
                    key={card.id}
                  >
                    {card.cardText}
                  </Card>
                );
              }
            })}
          </div>
        </div>
        <div className="flex gap-1 max-w-2xl">
          <form className="flex gap-1 w-full">
            <Input
              ref={blackCardInput}
              placeholder="Write black card here..."
            />
            <Button
              onClick={() => {
                const c = blackCardInput.current;
                if (c && c.value.trim().length > 0) {
                  void handleAddCard(
                    deck.id,
                    blackCardInput.current.value,
                    "black"
                  );
                }
              }}
            >
              Add
            </Button>
          </form>
        </div>
        <div>
          Black cards:
          {deck.cards.map((card) => {
            if (card.type === "black") {
              return <div key={card.id}>{card.cardText}</div>;
            }
          })}
        </div>
      </div>
    );
  }
}
