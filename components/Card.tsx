import React from 'react'

export default function Card({id, text}: {id: string, text: string}) {
  return (
    <div key={id} className='w-[245px] flex items-start bottom-0 rounded font-medium px-3 transition-all py-10 h-[300px] hover:z-50 hover:bottom-5 text-2xl relative border-black border bg-white shadow-lg'>
        <p className='text-black text-left'>{text}</p>
    </div>
  )
}
