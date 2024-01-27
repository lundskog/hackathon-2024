"use client";
import React, { useEffect } from "react";
import { trpc } from "../_trpc/client";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Star, Trash2 } from "lucide-react";
import Link from "next/link";

export default function DecksPage() {
  const { data: session } = useSession();
  const { data: myDecks, refetch: myDecksRefetch } = trpc.decks.get.useQuery();
  const deleteDeckMutation = trpc.decks.delete.useMutation();

  async function handleDeleteDeck(deckId: string) {
    await deleteDeckMutation.mutateAsync({ deckId }).then(() => {
      myDecksRefetch();
    });
  }

  function Decks() {
    return myDecks?.map((deck, index) => {
      const whiteCards = deck.cards.filter((card) => card.type === "white");
      const blackCards = deck.cards.filter((card) => card.type === "black");
      return (
        <Card
          style={{
            animationDelay: index * 50 + "ms",
          }}
          className="p-4 space-y-2 animate-fadeIn-up opacity-0 relative"
          key={deck.id}
        >
          <div className="flex rounded-md overflow-hidden">
            <div className="flex flex-col bg-white text-black text-xs p-2 w-[120px] whitespace-nowrap overflow-hidden">
              {whiteCards.map((card, index) => {
                if (index < 3) {
                  return (
                    <span
                      key={card.id}
                      className="text-ellipsis overflow-hidden"
                    >
                      {card.cardText}
                    </span>
                  );
                }
              })}
            </div>
            <div className="flex flex-col bg-black text-white text-xs p-2 w-[120px] whitespace-nowrap overflow-hidden">
              {blackCards.map((card, index) => {
                if (index < 3) {
                  return (
                    <span
                      key={card.id}
                      className="text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {card.cardText}
                    </span>
                  );
                }
              })}
            </div>
          </div>
          <div>
            <h1 className="font-semibold text-xl">{deck.name}</h1>
            <p className="text-sm text-muted-foreground">
              W: {whiteCards.length}, B: {blackCards.length}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant={"secondary"}
              className="flex items-center gap-2"
              size={"sm"}
            >
              <Star size={16} /> Star
            </Button>
            <Link href={`/decks/${deck.id}`}>
              <Button
                variant={"secondary"}
                className="flex items-center gap-2"
                size={"sm"}
              >
                <Edit2 size={16} /> Edit
              </Button>
            </Link>
            <Button
              onClick={() => handleDeleteDeck(deck.id)}
              variant={"destructive"}
              className="flex items-center gap-2"
              size={"sm"}
            >
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </Card>
      );
    });
  }

  useEffect(() => {
    console.log(myDecks);
  }, [myDecks]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div>
        <h1 className="text-4xl font-bold">Decks</h1>
      </div>
      <div className="flex flex-wrap gap-4">
        <Decks />
      </div>
    </div>
  );
}
