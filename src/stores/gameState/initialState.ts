import type { GameState } from "@/types";
import { GAME_CONFIG } from "../constants/gameConstants";
import { generateNotification } from "../utils/notificationUtils";
import { TIME_CONFIG } from "../utils/timeUtils";

export const createInitialState = (): GameState => ({
  cash: GAME_CONFIG.STARTING_CASH, // Now starts with €10,000 instead of €400,000
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
      workingHours: { start: 480, end: 1200 }, // 8:00 AM to 8:00 PM
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
      workingHours: { start: 600, end: 1320 }, // 10:00 AM to 10:00 PM
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
      adminCapacity: 0, // CEO doesn't add capacity - is operational founder
      monthlySalary: 10000,
      hiredAt: 0,
      totalCost: 0,
    },
    {
      id: "office-2",
      name: "Taylor",
      efficiency: 98,
      adminCapacity: 0, // CTO doesn't add capacity - is operational founder
      monthlySalary: 10000,
      hiredAt: 0,
      totalCost: 0,
    },
  ],
  supportStaff: [],
  jobs: [],
  customers: [],

  // Simplified time system
  gameHours: TIME_CONFIG.STARTING_HOUR, // Start at noon on day 1
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
