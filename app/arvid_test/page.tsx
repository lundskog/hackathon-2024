import BlackCard from '@/components/BlackCard'
import Deck from '@/components/Deck'
import WhiteCard from '@/components/WhiteCard'
import React, { useEffect , useState} from 'react'

export default function page() {
  return (
    <div>
      <BlackCard/>
      <Deck/>
    </div>
  )
}
