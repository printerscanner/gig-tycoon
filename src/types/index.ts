// MVP Gig Tycoon Types
export interface Worker {
  id: string;
  name: string;
  stamina: number; // 0-100, affects speed
  happiness: number; // 0-100, affects quality
  position: { row: number; col: number };
  isWorking: boolean;
  assignedJobId?: string;
  targetPosition?: { row: number; col: number };
  totalEarned: number;
  jobsCompleted: number;
  traits: WorkerTrait[];
  lastPosition?: { row: number; col: number }; // Track previous position to prevent oscillation
  hasPickedUpOrder?: boolean; // Track if worker has picked up the order and is carrying it
  workingHours: { start: number; end: number }; // Working hours in minutes (e.g., 480 = 8:00 AM, 1320 = 10:00 PM)
  isOnline: boolean; // Whether worker is currently available to work
  isSick: boolean; // Whether worker called in sick today
  sickUntil?: number; // Game time when worker recovers from sickness
  mood: number; // 0-100, affects tips and likelihood to quit/get sick
  lastMoodCheck: number; // Last time mood was evaluated
  totalHoursWorked: number; // Track total hours worked for this worker
}

export interface WorkerTrait {
  name: string;
  description: string;
  effect: "positive" | "negative" | "neutral";
}

export interface OfficeWorker {
  id: string;
  name: string;
  efficiency: number; // 0-100, affects admin capacity
  adminCapacity: number; // How many couriers this worker can support (10 each)
  monthlySalary: number; // $10,000/month salary
  hiredAt: number; // Game time when hired
  totalCost: number; // Running total of wages paid
}

export interface SupportWorker {
  id: string;
  name: string;
  supportCapacity: number; // How many couriers this worker can support (20 each)
  monthlySalary: number; // $2,500/month salary (closer to courier level)
  hiredAt: number; // Game time when hired
  totalCost: number; // Running total of wages paid
}

export interface Job {
  id: string;
  type: "delivery" | "rideshare" | "labor";
  pickup: { row: number; col: number };
  dropoff: { row: number; col: number };
  payment: number;
  timeCreated: number;
  assignedWorkerId?: string;
  status: "pending" | "assigned" | "completed" | "failed";
  description: string;
  urgency: number; // 1-3, affects customer patience
  customerRating?: number; // 1-5 stars
}

export interface Customer {
  id: string;
  patience: number; // decreases over time
  satisfaction: number;
  location: { row: number; col: number };
}

export interface GameState {
  cash: number;
  reputation: number; // 0-100, customer satisfaction average
  workerMorale: number; // 0-100, average happiness
  completedJobs: number;
  platformCommission: number; // 10-30% commission (default 20%)
  courierPayout: number; // €2-4 per delivery (what couriers get paid)
  workers: Worker[];
  officeWorkers: OfficeWorker[];
  supportStaff: SupportWorker[];
  jobs: Job[];
  customers: Customer[];
  selectedWorkerId?: string;
  
  // Simplified time system - single source of truth
  gameHours: number; // Total game hours since start (e.g., 25.5 = day 2, 1:30 AM)
  realStartTime: number; // Real timestamp when game started
  lastExpenseCheck: number; // Last game hour when expenses were checked
  lastWageCheck: number; // Last game hour when wages were checked
  
  // Business metrics
  investorFunding: number;
  weeklyTarget: number;
  notifications: Notification[];
  weeklyRevenue: number; // Track weekly revenue
  weeklyExpenses: number; // Track weekly expenses
  lastJobGeneration: number; // Track when last job was generated (real timestamp)
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "investor" | "worker" | "customer";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface CityTile {
  id: string;
  type: "restaurant" | "home" | "office" | "store" | "park";
  hasJob: boolean;
  row: number;
  col: number;
  emoji: string;
  isStreet?: boolean;
  displayName?: string;
  bgColor?: string;
}
