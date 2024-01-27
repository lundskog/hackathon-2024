"use client"
import React, { useEffect, useState } from 'react'
import Card from './Card';
import {DndContext, DragEndEvent} from '@dnd-kit/core';
import { Droppable } from './Droppable';
import Draggable from './Draggable';
import BlackCard from './BlackCard';



interface Card {
  id: string;
  text: string;
}
export default function Board() {
    const [cards, setCards] = useState<Card[]>([]);
      const [droppedCardId, setDroppedCardId] = useState<string | null>(null);
    useEffect(() => {
        setCards([
        { id: '1', text: 'Detta är ett vitt kort, här står det något roligt förhoppningsvis' },
        { id: '2', text: 'Card 2' },
        { id: '3', text: 'Card 3' },
        { id: '4', text: 'Card 4' },
        { id: '5', text: 'Card 5' },
        { id: '6', text: 'Card 6' },
        { id: '7', text: 'Card 7' },
        { id: '8', text: 'Card 8' },
        ]);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
  const { over, active } = event;

  // Check if the card is dropped over the droppable area
  if (over && over.id === 'droppable') {
    // Explicitly convert active.id to a string
    setDroppedCardId(String(active.id));
  } else if (!over && String(active.id) === droppedCardId) {
    // If the card is dragged away from the droppable area, set droppedCardId to null
    setDroppedCardId(null);
  }
};

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className='w-screen flex flex-col items-center'>
        <Droppable id="droppable">
          <div className='flex mt-5 px-10 space-x-3 mb-16'>
            <BlackCard id='1' text='Detta är ett svart kort där det kan stå _' />
              {droppedCardId && (
                <Draggable key={droppedCardId} id={droppedCardId}>
                  <Card id={droppedCardId} text={cards.find(card => card.id === droppedCardId)?.text || ''} />
                </Draggable>
              )}
          </div>
        </Droppable>
        <div className='flex relative justify-center -space-x-28 mb-20'>
          {cards.filter(card => card.id !== droppedCardId).map((card) => (
            <Draggable key={card.id} id={card.id}>
              <Card id={card.id} text={card.text} />
            </Draggable>
          ))}
        </div>
      </div>
    </DndContext>
  );
}