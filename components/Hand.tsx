"use client"
import React, { useEffect, useState } from 'react'


interface Card {
  id: string;
  text: string;
}
export default function Hand() {
    const [cards, setCards] = useState<Card[]>([]);

    useEffect(() => {
        setCards([
        { id: '1', text: 'Card 1' },
        { id: '2', text: 'Card 2' },
        { id: '3', text: 'Card 3' },
        { id: '4', text: 'Card 4' },
        { id: '5', text: 'Card 5' },
        { id: '6', text: 'Card 6' },
        { id: '7', text: 'Card 7' },
        { id: '8', text: 'Card 8' },
        ]);
  }, []);

return (
    <div className='w-screen flex justify-center'>
        <div className='flex relative justify-center -space-x-28 mb-20'>
        {cards.map((card, index) => (
            <div key={card.id} className='w-[200px] rounded-sm px-2 py-5 h-[300px] hover:z-50 hover:bottom-5 transition-all ease-in-out duration-150 relative border-black border-2 bg-white'>
            <p className='text-black'>{card.text}</p>
            </div>
        ))}
        </div>
    </div>
)
}
