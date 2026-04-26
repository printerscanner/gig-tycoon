import { useEffect } from 'react'
import { useGameStore } from '../store'
import { TICK_MS } from '../constants'

export function useGameLoop() {
  const advance = useGameStore(s => s.advance)
  const phase = useGameStore(s => s.phase)

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(advance, TICK_MS)
    return () => clearInterval(id)
  }, [advance, phase])
}
