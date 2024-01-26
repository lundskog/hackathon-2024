import React from 'react'
import {Crown} from "lucide-react"

export default function PlayerState({ state, color_hex }: { state: string, color_hex: string }) {
    switch (state) {
    case 'picking':
        return <div>pick</div>
    case 'card queen':
        return <Crown size={48} color="#FFA800" />
    case 'picked':
        return <div>piked</div>
    default:
      return <></>
  }
}
