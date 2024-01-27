import React from 'react'

export default function BlackCard({id, text}: {id: string, text: string}) {
  return (
    <div key={id} className='w-[245px] flex items-start font-medium rounded px-3 transition-all py-10 h-[300px] text-2xl relative bg-black shadow-lg'>
        <p className='text-white text-left'>{text}</p>
    </div>
  )
}
