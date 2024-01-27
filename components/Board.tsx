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
    const [blackCards, setBlackCards] = useState<Card[]>([{ id: '1', text: 'Detta är ett svart kort där det kan stå _' }]);

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
  const addBlackCard = () => {
    const newCard = { id: `${blackCards.length + 1}`, text: 'New Black Card' };
    setBlackCards([newCard, ...blackCards]);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className='w-screen flex flex-col items-center'>
        <button onClick={addBlackCard}>Add Black Card</button>
        <Droppable id="droppable">
          <div className='relative flex mt-5 px-10 space-x-16 mb-16'>
            <div className='relative'>
              {blackCards.map((card, index) => (
                <BlackCard key={card.id} id={card.id} text={card.text} zIndex={blackCards.length - index}/>
              ))}
            <div className='w-[245px] h-[300px]'></div>
            </div>
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