"use client";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeckWithCards } from "@/db/schema";
import { usePathname } from "next/navigation";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";

export default function DeckPage() {
  const pathnameList = usePathname()?.split("/");
  const deckId = pathnameList?.at(-1);

  const [deck, setDeck] = useState<DeckWithCards>();

  const whiteCardInput = useRef<HTMLInputElement>(null);
  const blackCardInput = useRef<HTMLInputElement>(null);

  const addCardMutation = trpc.decks.createCard.useMutation();
  const { data: deckData, refetch: deckRefetch } = trpc.decks.getOne.useQuery(
    {
      deckId: deckId ?? "",
    },
    { enabled: deckId ? deckId.length > 0 : false }
  );

  useEffect(() => {
    if (deckData) {
      setDeck(deckData);
    }
  }, [deckData]);

  async function handleAddCard(
    e: FormEvent,
    deckId: string,
    cardText: string,
    type: "white" | "black"
  ) {
    e.preventDefault();
    if (whiteCardInput.current && type === "white") {
      whiteCardInput.current.value = "";
    }
    if (blackCardInput.current && type === "black") {
      blackCardInput.current.value = "";
    }
    const id = v4();
    await addCardMutation
      .mutateAsync({ deckId, cardText, type, id })
      .then(() => {
        setDeck((old) => {
          if (old) {
            const cards = old.cards;
            const x: DeckWithCards = {
              ...old,
              cards: [
                ...(cards ?? []),
                {
                  deckId,
                  cardText,
                  type,
                  id,
                },
              ],
            };
            return x;
          }
        });
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
          <form
            onSubmit={(e) => {
              const c = whiteCardInput.current;
              if (c && c.value.trim().length > 0) {
                void handleAddCard(
                  e,
                  deck.id,
                  whiteCardInput.current.value,
                  "white"
                );
              }
            }}
            className="flex gap-1 w-full"
          >
            <Input
              ref={whiteCardInput}
              placeholder="Write white card here..."
            />
            <Button type="submit">Add</Button>
          </form>
        </div>
        <div>
          White cards:
          <div className="flex flex-wrap gap-1 max-w-2xl max-h-80 overflow-scroll w-fit">
            {deck.cards?.map((card) => {
              if (card.type === "white") {
                return (
                  <Card
                    className="p-2 w-fit bg-white text-black text-sm font-medium max-w-sm"
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
          <form
            onSubmit={(e) => {
              const c = blackCardInput.current;
              if (c && c.value.trim().length > 0) {
                void handleAddCard(
                  e,
                  deck.id,
                  blackCardInput.current.value,
                  "black"
                );
              }
            }}
            className="flex gap-1 w-full"
          >
            <Input
              ref={blackCardInput}
              placeholder="Write black card here..."
            />
            <Button type="submit">Add</Button>
          </form>
        </div>
        <div className="">
          Black cards:
          <div className="flex flex-wrap gap-1 max-w-2xl max-h-80 overflow-scroll w-fit">
            {deck.cards?.map((card) => {
              if (card.type === "black") {
                return (
                  <Card
                    className="p-2 w-fit bg-black text-white text-sm font-medium"
                    key={card.id}
                  >
                    {card.cardText}
                  </Card>
                );
              }
            })}
          </div>
        </div>
      </div>
    );
  }
}
