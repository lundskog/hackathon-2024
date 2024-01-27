import Deck from '@/components/Deck'
import WhiteCard from '@/components/WhiteCard'
import BlackCard_tmp from '@/components/BlackCard_tmp'
import React, { useEffect , useState} from 'react'

export default function page() {
  return (
    <div>
      <BlackCard_tmp/>
      <Deck/>
    </div>
  )
}
