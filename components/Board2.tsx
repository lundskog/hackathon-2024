"use client"
import React, { useEffect, useState } from 'react'
import Card from './Card';
import {DndContext, DragEndEvent} from '@dnd-kit/core';
import { Droppable } from './Droppable';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import Draggable from './Draggable';
import BlackCard2 from './BlackCard2'
import OponnentDeck from './OponnentDeck';



interface Card {
  id: string;
  text: string;
}
export default function Board() {
  const [cards, setCards] = useState<Card[]>([]);
  const [BlackCard2s, setBlackCard2s] = useState<Card[]>([{ id: '1', text: 'Detta är ett svart kort där det kan stå _' }]);

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

    console.log(droppedCardId);
    console.log(active.id)

    const oldIndex = cards.indexOf(cards.find(card => card.id == active.id)!);
    const newIndex = cards.indexOf(cards.find(card => card.id == droppedCardId)!);
    

    if (droppedCardId != null){
      setCards((cards) => {
        return arrayMove(cards, newIndex, oldIndex);
      })
    }

    // Check if the card is dropped over the droppable area
    if (over && over.id === 'droppable') {
      // Explicitly convert active.id to a string
      setDroppedCardId(String(active.id));
    }

  };
  const addBlackCard2 = () => {
    const newCard = { id: `${BlackCard2s.length + 1}`, text: 'New Black Card' };BlackCard
    setBlackCard2s([newCard, ...BlackCard2s]);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className='w-screen flex flex-col items-center'>
        <button onClick={addBlackCard2}>Add Black Card</button>
        <OponnentDeck player_id_and_color='#ff0000'/>
        <Droppable id="droppable">
          <div className='relative flex mt-5 px-10 space-x-16 mb-16'>
            <div className='relative'>
              {BlackCard2s.map((card, index) => (
                <BlackCard2 key={card.id} id={card.id} text={card.text} zIndex={BlackCard2s.length - index}/>
              ))}
            <div className='w-[245px] h-[300px]'></div>
            </div>
              {droppedCardId && (
                <Draggable key={droppedCardId} id={droppedCardId}>
                  <Card id={droppedCardId} text={cards.find(card => card.id == droppedCardId)?.text || ''} />
                </Draggable>
              )}
          </div>
        </Droppable>
        <div className='flex relative justify-center -space-x-28 mb-20'>
          {cards.filter(card => card.id != droppedCardId).map((card) => (
            <Draggable key={card.id} id={card.id}>
              <Card id={card.id} text={card.text} />
            </Draggable>
          ))}
        </div>
      </div>
    </DndContext>
  );
}