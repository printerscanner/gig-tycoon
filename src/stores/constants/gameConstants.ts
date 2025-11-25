// Game configuration constants
export const GAME_CONFIG = {
  GRID_SIZE: 12,
  STARTING_CASH: 10000,
  STARTING_REPUTATION: 50,
  STARTING_WORKER_MORALE: 75,
  PLATFORM_COMMISSION_DEFAULT: 20,
  COURIER_PAYOUT_DEFAULT: 3,
  GAME_TIME_MULTIPLIER: 10,
  STARTING_TIME: 12, // Start mid-day
} as const;

// Worker configuration
export const WORKER_CONFIG = {
  HIRING_COST: 500,
  BASE_CAPACITY: 5, // Base courier capacity
  STAMINA_RECOVERY_RANGE: [1, 4], // Recovery when idle
  STAMINA_LOSS_RANGE: [5, 15], // Loss per job completion
  MOVEMENT_SPEED: 0.3,
  TRAIT_SPEED_MULTIPLIER: {
    HUSTLER: 1.5,
    LAZY: 0.5,
  },
} as const;

// Office worker configuration
export const OFFICE_WORKER_CONFIG = {
  HIRING_COST: 25000,
  MONTHLY_SALARY: 10000,
  CAPACITY_PER_WORKER: 5, // Each office worker adds 5 courier capacity
} as const;

// Support staff configuration
export const SUPPORT_STAFF_CONFIG = {
  HIRING_COST: 5000,
  MONTHLY_SALARY: 2500,
  CAPACITY_PER_WORKER: 20, // Each support worker supports 20 couriers
} as const;

// Job generation and pricing
export const JOB_CONFIG = {
  BASE_ORDER_VALUE_RANGE: [20, 60], // €20-60 base order
  MAX_DISTANCE_BONUS: 10, // €0-10 distance bonus
  URGENCY_MULTIPLIER: 0.1, // 10% per urgency level
  BASE_JOB_INTERVAL: 15000, // Base time between job generation (ms)
  MIN_JOB_INTERVAL: 5000, // Minimum time between jobs
  JOBS_PER_GENERATION: [1, 2], // Range of jobs generated at once
  MAX_WAIT_TIMES: {
    URGENCY_1: 600000, // 10 minutes
    URGENCY_2: 540000, // 9 minutes
    URGENCY_3: 480000, // 8 minutes
  },
} as const;

// Expense configuration
export const EXPENSE_CONFIG = {
  BASE_RENT_LEGAL: 20000, // Monthly base costs
  RENT_PER_COURIER: 1000, // Additional monthly cost per courier
  RENT_PER_OFFICE_WORKER: 2000, // Additional monthly cost per office worker
  BASE_CLOUD_COST: 5000, // Monthly cloud infrastructure
  HOURS_PER_MONTH: 160, // For salary calculations
  BANKRUPTCY_THRESHOLD: -20000, // Game over at -€20k debt
} as const;

// Tip and rating configuration
export const TIP_CONFIG = {
  BASE_TIP_CHANCE: 0.4, // 40% base chance
  TIP_CHANCE_RANGE: [0.2, 0.6], // 20%-60% range based on performance
  MAX_TIP_AMOUNT: 5.0, // Maximum tip in euros
  TIP_RANGES: {
    EXCELLENT: [3.5, 5.0], // Performance >= 85
    GOOD: [2.0, 3.5], // Performance >= 70
    AVERAGE: [1.0, 2.0], // Performance >= 50
    POOR: [0.5, 1.5], // Performance < 50
  },
} as const;

// Reputation and mood configuration
export const REPUTATION_CONFIG = {
  REPUTATION_RECOVERY_RATE: 0.1, // 10% toward target each cycle
  MAX_POSITIVE_CHANGE: 0.5, // Cap positive changes
  LATE_ORDER_PENALTY: 2.0, // Reputation penalty per late order
  PENALTY_INTERVAL: 30000, // Apply penalty every 30 seconds
} as const;

// Investor milestones
export const INVESTOR_CONFIG = {
  FIRST_MILESTONE: 10, // Jobs completed to trigger first investor
  FIRST_FUNDING: 20000, // Amount of first funding
  MONTHLY_TARGET: 50, // Target deliveries per day after funding
} as const;

// Time system configuration
export const TIME_CONFIG = {
  DAYS_PER_REAL_SECOND: 365 / 7200, // 365 game days = 1 real hour (exact calculation)
  STARTING_DAY: 1, // Start at day 1
} as const;
