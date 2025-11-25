import { GAME_CONFIG, JOB_CONFIG } from "../constants/gameConstants";

// Generate a unique ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Check if a position is a road (matches CityGrid road logic)
export const isRoadPosition = (row: number, col: number) => {
  const { GRID_SIZE } = GAME_CONFIG;
  return (
    row % 3 === 0 ||
    col % 3 === 0 ||
    row === GRID_SIZE - 1 ||
    col === GRID_SIZE - 1
  );
};

// Generate a random road position for worker spawning
export const generateRandomRoadPosition = () => {
  const { GRID_SIZE } = GAME_CONFIG;
  const roads = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (isRoadPosition(row, col)) {
        roads.push({ row, col });
      }
    }
  }
  return roads[Math.floor(Math.random() * roads.length)];
};

// Generate a random building position for job pickup/dropoff (no roads)
export const generateRandomBuildingPosition = () => {
  const { GRID_SIZE } = GAME_CONFIG;
  const buildings = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!isRoadPosition(row, col)) {
        buildings.push({ row, col });
      }
    }
  }
  return buildings[Math.floor(Math.random() * buildings.length)];
};

// Get demand multiplier based on time of day
export const getDemandMultiplier = (gameHours: number) => {
  const hours = gameHours % 24; // Convert to 24-hour cycle

  // Peak hours: lunch (11-14) and dinner (17-21) - higher demand
  if ((hours >= 11 && hours < 14) || (hours >= 17 && hours < 21)) {
    return 1.5; // 50% more jobs
  }

  // Late night (22-6) - very low demand
  if (hours >= 22 || hours < 6) {
    return 0.3; // 70% fewer jobs
  }

  // Regular hours
  return 1.0;
};

// Get price multiplier for surge pricing
export const getPriceMultiplier = (gameHours: number) => {
  const hours = gameHours % 24; // Convert to 24-hour cycle

  // Peak hours get modest surge pricing
  if ((hours >= 11 && hours < 14) || (hours >= 17 && hours < 21)) {
    return 1.15; // 15% price increase (reduced from 30%)
  }

  // Late night premium
  if (hours >= 22 || hours < 6) {
    return 1.1; // 10% price increase for night orders (reduced from 20%)
  }

  return 1.0;
};

// Calculate maximum courier capacity based on office workers
export const calculateMaxCourierCapacity = (officeWorkers: any[]) => {
  // Base capacity is 5 couriers (2 CEO/CTO already hired + 3 more slots)
  const baseCapacity = 5;

  // Add capacity from office workers (CEO/CTO have 0 capacity, new hires add 5 each)
  const additionalCapacity = officeWorkers.reduce(
    (total, worker) => total + worker.adminCapacity,
    0
  );

  return baseCapacity + additionalCapacity;
};

// Calculate hourly costs for office workers based on monthly salary (~160 hours/month)
export const calculateHourlyOfficeWages = (officeWorkers: any[]) => {
  const hoursPerMonth = 160;
  return officeWorkers.reduce(
    (total, worker) => total + worker.monthlySalary / hoursPerMonth,
    0
  );
};

// Calculate distance between two points (Manhattan distance for grid-based movement)
export const calculateDistance = (
  pos1: { row: number; col: number },
  pos2: { row: number; col: number }
) => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};
