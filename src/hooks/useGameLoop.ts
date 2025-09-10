import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function useGameLoop() {
  const updateGameState = useGameStore(state => state.updateGameState);

  useEffect(() => {
    const interval = setInterval(() => {
      updateGameState();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateGameState]);
}
