import React from 'react'
import WhiteCard from './WhiteCard'

export default function Deck() {
  return (
    <div>
        <div className='ml-20 flex flex-row'>
            <WhiteCard/>
            <WhiteCard/>
            <WhiteCard/>
            <WhiteCard/>
        </div>
    </div>
  )
}
