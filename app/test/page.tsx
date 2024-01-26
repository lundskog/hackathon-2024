import Hand from '@/components/Hand'
import PlayerView from '@/components/PlayerView'

export default function Page() {
  return (
      <div className='bg-white'>
          <PlayerView />
          <div className='my-72'></div>
          <Hand/>
    </div>
  )
}
