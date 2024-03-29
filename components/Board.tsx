"use client";
import React, { useEffect, useState } from "react";
import Card from "./Card";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Droppable } from "./Droppable";
import Draggable from "./Draggable";
import BlackCard from "./BlackCard";

export interface Card {
  id: string;
  text: string;
}

export default function Board({ hand }: { hand: Card[] }) {
  const [blackCards, setBlackCards] = useState<Card[]>([
    { id: "1", text: "Detta är ett svart kort där det kan stå _" },
  ]);
  const [readingTime, setReadingTime] = useState<boolean>(false);
  const [isCardQueen, setIsCardQueen] = useState<boolean>(false);
  const [currentShowCard, setCurrentShowCard] = useState<number>(0);
  const [showCards, setShowCards] = useState<Card[]>([
    {
      id: "1",
      text: "Detta är ett vitt kort, här står det något roligt förhoppningsvis",
    },
    { id: "2", text: "Card 2" },
    { id: "3", text: "Card 3" },
  ]);

  useEffect(() => {}, []);

  const [droppedCards, setDroppedCards] = useState<string[]>([]);
  const [maxCards, setMaxCards] = useState<number>(1);

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;

    // Droppable logic
    if (over && over.id === "droppable") {
      if (
        droppedCards.length < maxCards &&
        !droppedCards.includes(String(active.id))
      ) {
        setDroppedCards((prev) => [...prev, String(active.id)]);
      } else {
        console.log("Max cards reached");
      }
    } else if (!over || over.id === "droppable") {
      setDroppedCards((prev) => prev.filter((id) => id !== String(active.id)));
    }
  };

  // Adding black card
  const addBlackCard = () => {
    const newCard = { id: `${blackCards.length + 1}`, text: "New Black Card" };
    setBlackCards([newCard, ...blackCards]);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex grow flex-col items-center overflow-y-hidden left-0">
        <button onClick={addBlackCard}>Add Black Card</button>
        <button
          onClick={() => setReadingTime(!readingTime)}
          className="text-black"
        >
          Reading Time
        </button>
        <Droppable id="droppable">
          <div className="relative flex mt-5 px-10 space-x-4 mb-16">
            <div className="relative px-10">
              {blackCards.map((card, index) => (
                <BlackCard
                  showCards={showCards}
                  currentShowCard={currentShowCard}
                  key={card.id}
                  id={card.id}
                  text={card.text}
                  zIndex={blackCards.length - index}
                />
              ))}
              <div className="w-[245px] h-[300px]"></div>
            </div>
            {droppedCards.map((cardId) => (
              <Draggable key={cardId} id={cardId}>
                <Card
                  id={cardId}
                  text={hand.find((card) => card.id === cardId)?.text || ""}
                />
              </Draggable>
            ))}
          </div>
        </Droppable>
        {isCardQueen && readingTime && (
          <div className="w-screen flex justify-center">
            {currentShowCard < showCards.length && (
              <button
                onClick={() => setCurrentShowCard(currentShowCard + 1)}
                className="text-white text-xl font-bold bg-black rounded-2xl px-8 py-2 "
              >
                Show card {currentShowCard + 1}
              </button>
            )}
          </div>
        )}
        <div
          style={{
            opacity: readingTime || isCardQueen ? 0 : 1,
            bottom: readingTime || isCardQueen ? 0 : 100,
            pointerEvents: readingTime || isCardQueen ? "none" : "all",
          }}
          className="flex transition-all mt-24 relative justify-center -space-x-28 mb-20"
        >
          {hand
            .filter((card) => !droppedCards.includes(card.id))
            .map((card, index) => (
              <Draggable key={card.id} id={card.id}>
                <Card id={card.id} text={card.text} />
              </Draggable>
            ))}
        </div>
      </div>
    </DndContext>
  );
}
