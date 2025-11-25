import { getRoute, gridToLatLng, latLngToGrid, interpolateRoute } from "./routing";
import type { Worker } from "@/types";

// Move worker along their current route
export const moveWorkerAlongRoute = async (worker: Worker): Promise<Partial<Worker>> => {
  // If worker has no target, don't move
  if (!worker.targetPosition) {
    return worker;
  }

  const currentLatLng = gridToLatLng(worker.position.row, worker.position.col);
  const targetLatLng = gridToLatLng(worker.targetPosition.row, worker.targetPosition.col);

  // If worker doesn't have a route or route is outdated, get a new one
  if (!worker.currentRoute || !worker.routeProgress) {
    try {
      const route = await getRoute(currentLatLng, targetLatLng);
      if (route) {
        return {
          ...worker,
          currentRoute: route.coordinates,
          routeProgress: 0,
        };
      }
    } catch (error) {
      console.warn("Failed to get route, using direct movement:", error);
    }
    
    // Fallback to direct movement
    return moveWorkerDirect(worker);
  }

  // Move along the current route
  const speed = getWorkerSpeed(worker);
  const newProgress = Math.min(1, worker.routeProgress + speed);
  
  if (newProgress >= 1) {
    // Reached destination
    const targetGrid = latLngToGrid(targetLatLng.lat, targetLatLng.lng);
    return {
      ...worker,
      position: { row: targetGrid.row, col: targetGrid.col },
      currentRoute: undefined,
      routeProgress: undefined,
      targetPosition: undefined,
    };
  }

  // Interpolate position along route
  const currentPosition = interpolateRoute(worker.currentRoute, newProgress);
  const gridPosition = latLngToGrid(currentPosition.lat, currentPosition.lng);

  return {
    ...worker,
    position: { row: gridPosition.row, col: gridPosition.col },
    routeProgress: newProgress,
  };
};

// Fallback direct movement (like the old system)
const moveWorkerDirect = (worker: Worker): Partial<Worker> => {
  if (!worker.targetPosition) return worker;

  const { row, col } = worker.position;
  const { row: targetRow, col: targetCol } = worker.targetPosition;

  // Calculate direction to target
  const deltaRow = targetRow - row;
  const deltaCol = targetCol - col;

  // Normalize movement (move one step at a time)
  const newRow = deltaRow === 0 ? row : row + Math.sign(deltaRow);
  const newCol = deltaCol === 0 ? col : col + Math.sign(deltaCol);

  // Check if reached target
  const reachedTarget = newRow === targetRow && newCol === targetCol;

  return {
    ...worker,
    position: { row: newRow, col: newCol },
    targetPosition: reachedTarget ? undefined : worker.targetPosition,
  };
};

// Calculate worker movement speed based on traits and stamina
const getWorkerSpeed = (worker: Worker): number => {
  let baseSpeed = 0.05; // Base progress per update (5% of route per update)
  
  // Adjust speed based on traits
  if (worker.traits.some(t => t.name === "Hustler")) {
    baseSpeed *= 1.5;
  }
  if (worker.traits.some(t => t.name === "Lazy")) {
    baseSpeed *= 0.7;
  }
  if (worker.traits.some(t => t.name === "Stressed")) {
    baseSpeed *= 0.8;
  }
  
  // Adjust speed based on stamina (tired workers move slower)
  const staminaMultiplier = 0.5 + (worker.stamina / 100) * 0.5; // 0.5x to 1.0x based on stamina
  baseSpeed *= staminaMultiplier;
  
  return baseSpeed;
};

// Set a new target for a worker (this will trigger route calculation)
export const setWorkerTarget = (worker: Worker, targetRow: number, targetCol: number): Partial<Worker> => {
  return {
    ...worker,
    targetPosition: { row: targetRow, col: targetCol },
    currentRoute: undefined, // Clear current route to force recalculation
    routeProgress: undefined,
  };
};
