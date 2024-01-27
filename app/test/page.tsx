import Board from '@/components/Board'
import Board2 from '@/components/Board2'
import PlayerView from '@/components/PlayerView'

export default function Page() {
  return (
      <div className='bg-white'>
          <PlayerView />
          <Board2/>
    </div>
  )
}
