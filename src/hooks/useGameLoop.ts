import { useEffect } from 'react'
import { useGameStore } from '../store'
import { MS_PER_HOUR } from '../constants'

export function useGameLoop() {
  const advance = useGameStore(s => s.advance)
  const phase = useGameStore(s => s.phase)

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(advance, MS_PER_HOUR)
    return () => clearInterval(id)
  }, [advance, phase])
}
