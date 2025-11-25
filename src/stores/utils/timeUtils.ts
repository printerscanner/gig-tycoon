// Simplified time system for the game
// All time is based on gameHours - a single source of truth

export interface GameTime {
  gameHours: number; // Total game hours since start (e.g., 25.5 = 1 day, 1.5 hours)
  realStartTime: number; // Real timestamp when game started
}

// Convert game hours to day number (1-based)
export const getDayFromHours = (gameHours: number): number => {
  return Math.floor(gameHours / 24) + 1;
};

// Convert game hours to hour of day (0-23)
export const getHourOfDay = (gameHours: number): number => {
  return Math.floor(gameHours % 24);
};

// Convert game hours to minutes within the hour (0-59)
export const getMinutesOfHour = (gameHours: number): number => {
  return Math.floor((gameHours % 1) * 60);
};

// Format game time as "2:30 PM"
export const formatGameTime = (gameHours: number): string => {
  const hours = getHourOfDay(gameHours);
  const minutes = getMinutesOfHour(gameHours);
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

// Format day and time as "Day 3, 2:30 PM"
export const formatDayAndTime = (gameHours: number): string => {
  const day = getDayFromHours(gameHours);
  const time = formatGameTime(gameHours);
  return `Day ${day}, ${time}`;
};

// Check if it's a new day since last check
export const isNewDay = (currentHours: number, previousHours: number): boolean => {
  return getDayFromHours(currentHours) > getDayFromHours(previousHours);
};

// Check if it's a new hour since last check
export const isNewHour = (currentHours: number, previousHours: number): boolean => {
  return Math.floor(currentHours) > Math.floor(previousHours);
};

// Game time progression constants
export const TIME_CONFIG = {
  HOURS_PER_REAL_SECOND: 0.05, // 0.05 game hours per real second = 3 game minutes per real second
  HOURS_PER_DAY: 24,
  STARTING_HOUR: 12, // Start at noon
} as const;
