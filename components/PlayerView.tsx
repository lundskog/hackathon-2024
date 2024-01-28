"use client";
import React, { useState, useEffect } from 'react';
import PlayerState from './PlayerState';

interface Player {
  id: string;
  name: string;
  state: string;
  color_hex: string;
}

export default function PlayerView ({ players }: { players: Player[] }) {
  // const [players, setPlayers] = useState<Player[]>([]);

  // useEffect(() => {
  //   setPlayers([
  //     { id: '1', name: 'Danne', state: 'picking', color_hex: '#DD5555'},
  //     { id: '2', name: 'Arvid', state: 'card queen', color_hex: '#FFA775'},
  //     { id: '3', name: 'Niels', state: 'picked' , color_hex: '#603FE7'},
  //   ]);
  // }, []);

  return (
    <div className='absolute w-screen flex justify-center'>
      <div className='flex justify-center'>
        {players.map((player) => (
          <div className='p-8 flex flex-col items-center' key={player.id}>
            <p className='font-bold text-2xl' style={{ color: player.color_hex }}>{player.name}</p>
            <div className='m-2'>
              <PlayerState state={player.state} color_hex={player.color_hex} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}