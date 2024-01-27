"use client"
import React from 'react'
import OponnentCard from './OponnentCard'

export default function OponnentDeck({player_id_and_color}: {player_id_and_color: string}) {
  return (
    <div className='ml-8 flex flex-row'>
        <OponnentCard id={0} player_id={player_id_and_color}/>
        <OponnentCard id={1} player_id={player_id_and_color}/>
        <OponnentCard id={2} player_id={player_id_and_color}/>
        <OponnentCard id={3} player_id={player_id_and_color}/>
        <OponnentCard id={4} player_id={player_id_and_color}/>
        <OponnentCard id={5} player_id={player_id_and_color}/>
        <OponnentCard id={6} player_id={player_id_and_color}/>
        <OponnentCard id={7} player_id={player_id_and_color}/>
    </div>
  )
}
