// Simplified day-based time system for the game
// All time is based on gameDays - a single source of truth

export interface GameTime {
  gameDays: number; // Total game days since start (e.g., 2.5 = day 2, halfway through)
  realStartTime: number; // Real timestamp when game started
}

// Get the current day number (1-based)
export const getCurrentDay = (gameDays: number): number => {
  return Math.floor(gameDays) + 1;
};

// Check if it's a new day since last check
export const isNewDay = (
  currentDays: number,
  previousDays: number
): boolean => {
  return getCurrentDay(currentDays) > getCurrentDay(previousDays);
};

// Get the current month number (1-based, assuming 30 days per month)
export const getCurrentMonth = (gameDays: number): number => {
  return Math.floor(gameDays / 30) + 1;
};

// Check if it's a new month since last check (every 30 days)
export const isNewMonth = (
  currentDays: number,
  previousDays: number
): boolean => {
  return getCurrentMonth(currentDays) > getCurrentMonth(previousDays);
};
