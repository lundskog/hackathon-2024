import React, { useEffect, useState } from 'react';
import { Card } from './Board';

export default function BlackCard2({ id, text, zIndex}: { id: string, text: string, zIndex: number}) {
  // Initialize rotation immediately with a function
  const [rotation] = useState(() => {
    const min = -10; // Minimum degree
    const max = 10; // Maximum degree
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });
  const [spin, setSpin] = useState(false);
  const [slide, setSlide] = useState(false);

  // Use the `id` prop to trigger the animations for a new card
  useEffect(() => {
    // Reset animations for the new card
    setSpin(false);
    setSlide(false);

    // Delay to allow for initial render
    setTimeout(() => {
      setSpin(true);
      setSlide(true);
    }, 10); // Small timeout to ensure the reset is rendered before the animation starts
  }, [id]); // Depend on `id` to trigger this effect


  const style = {
    transform: `translateY(${slide ? 0 : '-200%'}) rotate(${spin ? rotation + 360 : rotation}deg)`,
    transition: 'transform 2s',
    zIndex: zIndex,
  };

  return (
    <div style={style} className='w-[245px] flex items-start font-medium rounded px-3 absolute py-10 h-[300px] text-2xl bg-black shadow-lg'>
      <p className='text-white text-left'>{text}</p>
    </div>
  
  );
}
