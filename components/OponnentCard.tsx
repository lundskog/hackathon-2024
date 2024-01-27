import React from 'react'

export default function OponnentCard({id, player_id}: {id: number, player_id: string}) {
  return (
    <div key={id} className='z-0 w-8 h-12 -ml-4 border-2 rounded-md border-black text-black bg-slate-100 flex items-center justify-evenly'></div>
  )
}
