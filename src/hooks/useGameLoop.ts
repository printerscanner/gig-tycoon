import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";

export function useGameLoop() {
  const updateGameState = useGameStore((state) => state.updateGameState);

  useEffect(() => {
    const interval = setInterval(() => {
      updateGameState();
    }, 500); // Reduced from 1000ms to 500ms for faster movement

    return () => clearInterval(interval);
  }, [updateGameState]);
}
