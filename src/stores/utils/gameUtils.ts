import { GAME_CONFIG, EXPENSE_CONFIG } from "../constants/gameConstants";
import type { OfficeWorker, Worker, SupportWorker } from "@/types";

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

// Generate a random road position for worker spawning (constrained to visible map area)
export const generateRandomRoadPosition = () => {
  const roads = [];
  // Constrain to central area of grid that corresponds to visible Berlin map
  const minRow = 2; // Skip edges to stay within visible bounds
  const maxRow = 9;
  const minCol = 2;
  const maxCol = 9;
  
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      if (isRoadPosition(row, col)) {
        roads.push({ row, col });
      }
    }
  }
  return roads[Math.floor(Math.random() * roads.length)];
};

// Generate a random building position for job pickup/dropoff (constrained to visible map area)
export const generateRandomBuildingPosition = () => {
  const buildings = [];
  // Constrain to central area of grid that corresponds to visible Berlin map
  const minRow = 2; // Skip edges to stay within visible bounds
  const maxRow = 9;
  const minCol = 2;
  const maxCol = 9;
  
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      if (!isRoadPosition(row, col)) {
        buildings.push({ row, col });
      }
    }
  }
  return buildings[Math.floor(Math.random() * buildings.length)];
};

// Get demand multiplier based on time of day (simplified for day-based system)
export const getDemandMultiplier = (gameDays: number) => {
  // Since we're using days now, we'll use a simplified approach
  // Peak demand varies throughout the day cycle within each day
  const dayProgress = gameDays % 1; // Get fractional part (0-1 within the day)
  const hours = dayProgress * 24; // Convert to approximate hour of day

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

// Get price multiplier for surge pricing (simplified for day-based system)
export const getPriceMultiplier = (gameDays: number) => {
  // Since we're using days now, we'll use a simplified approach
  const dayProgress = gameDays % 1; // Get fractional part (0-1 within the day)
  const hours = dayProgress * 24; // Convert to approximate hour of day

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
export const calculateMaxCourierCapacity = (officeWorkers: OfficeWorker[]) => {
  // Base capacity is 5 couriers (2 CEO/CTO already hired + 3 more slots)
  const baseCapacity = 5;

  // Add capacity from office workers (CEO/CTO have 0 capacity, new hires add 5 each)
  const additionalCapacity = officeWorkers.reduce(
    (total, worker) => total + worker.adminCapacity,
    0
  );

  return baseCapacity + additionalCapacity;
};

// Calculate daily costs for office workers based on monthly salary (~30 days/month)
export const calculateDailyOfficeWages = (officeWorkers: OfficeWorker[]) => {
  const daysPerMonth = 30;
  return officeWorkers.reduce(
    (total, worker) => total + worker.monthlySalary / daysPerMonth,
    0
  );
};

// Calculate total monthly expenses (rent, salaries, infrastructure)
export const calculateMonthlyExpenses = (
  workers: Worker[],
  officeWorkers: OfficeWorker[],
  supportStaff: SupportWorker[]
) => {
  const {
    BASE_RENT_LEGAL,
    RENT_PER_COURIER,
    RENT_PER_OFFICE_WORKER,
    BASE_CLOUD_COST,
  } = EXPENSE_CONFIG;

  // Base costs
  const rentAndLegal =
    BASE_RENT_LEGAL +
    workers.length * RENT_PER_COURIER +
    officeWorkers.length * RENT_PER_OFFICE_WORKER;

  const cloudCosts = BASE_CLOUD_COST;

  // Salaries
  const officeWorkerSalaries = officeWorkers.reduce(
    (total, worker) => total + worker.monthlySalary,
    0
  );

  const supportStaffSalaries = supportStaff.reduce(
    (total, staff) => total + (staff.monthlySalary || 2500),
    0
  );

  return {
    rentAndLegal,
    cloudCosts,
    officeWorkerSalaries,
    supportStaffSalaries,
    total:
      rentAndLegal + cloudCosts + officeWorkerSalaries + supportStaffSalaries,
  };
};

// Calculate distance between two points (Manhattan distance for grid-based movement)
export const calculateDistance = (
  pos1: { row: number; col: number },
  pos2: { row: number; col: number }
) => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};
