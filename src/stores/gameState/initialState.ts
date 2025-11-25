import type { GameState } from "@/types";
import { GAME_CONFIG } from "../constants/gameConstants";
import { generateNotification } from "../utils/notificationUtils";
import { TIME_CONFIG } from "../constants/gameConstants";

export const createInitialState = (): GameState => ({
  cash: GAME_CONFIG.STARTING_CASH,
  reputation: GAME_CONFIG.STARTING_REPUTATION,
  workerMorale: GAME_CONFIG.STARTING_WORKER_MORALE,
  completedJobs: 0,
  platformCommission: GAME_CONFIG.PLATFORM_COMMISSION_DEFAULT,
  courierPayout: GAME_CONFIG.COURIER_PAYOUT_DEFAULT,
  workers: [
    {
      id: "worker-1",
      name: "Alex",
      stamina: 80,
      happiness: 75,
      position: { row: 0, col: 0 },
      isWorking: false,
      totalEarned: 0,
      jobsCompleted: 0,
      traits: [
        { name: "Reliable", description: "Always on time", effect: "positive" },
      ],
      workingHours: { start: 480, end: 1200 },
      isOnline: true,
      isSick: false,
      mood: 75,
      lastMoodCheck: 0,
      totalHoursWorked: 0,
    },
    {
      id: "worker-2",
      name: "Sam",
      stamina: 70,
      happiness: 80,
      position: { row: 6, col: 6 },
      isWorking: false,
      totalEarned: 0,
      jobsCompleted: 0,
      traits: [
        {
          name: "Hustler",
          description: "Works extra fast",
          effect: "positive",
        },
      ],
      workingHours: { start: 600, end: 1320 },
      isOnline: true,
      isSick: false,
      mood: 80,
      lastMoodCheck: 0,
      totalHoursWorked: 0,
    },
  ],
  officeWorkers: [
    {
      id: "office-1",
      name: "Morgan",
      efficiency: 95,
      adminCapacity: 0,
      monthlySalary: 10000,
      hiredAt: 0,
      totalCost: 0,
    },
    {
      id: "office-2",
      name: "Taylor",
      efficiency: 98,
      adminCapacity: 0,
      monthlySalary: 10000,
      hiredAt: 0,
      totalCost: 0,
    },
  ],
  supportStaff: [],
  jobs: [],
  customers: [],

  // Simplified day-based time system
  gameDays: TIME_CONFIG.STARTING_DAY,
  realStartTime: Date.now(),
  lastExpenseCheck: 0,
  lastWageCheck: 0,

  // Business metrics
  investorFunding: 0,
  weeklyTarget: 100,
  notifications: [
    generateNotification(
      "info",
      "🍕 Welcome to FoodDash!",
      "€10,000 bootstrap funding! You and your co-founders are delivering orders while building the platform. Prove the concept to unlock investor funding!"
    ),
  ],
  weeklyRevenue: 0,
  weeklyExpenses: 0,
  lastJobGeneration: Date.now() - 6000, // Start 6 seconds ago to trigger immediate job generation
});
