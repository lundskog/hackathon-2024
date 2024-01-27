import Board from '@/components/Board'
import PlayerView from '@/components/PlayerView'

export default function Page() {
  return (
      <div className='bg-white'>
          <PlayerView />
          <Board/>
    </div>
  )
}
