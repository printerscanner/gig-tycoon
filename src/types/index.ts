// MVP Gig Tycoon Types
export interface Worker {
  id: string;
  name: string;
  stamina: number; // 0-100, affects speed
  happiness: number; // 0-100, affects quality
  wage: number; // per job rate
  position: { row: number; col: number };
  isWorking: boolean;
  assignedJobId?: string;
  targetPosition?: { row: number; col: number };
  totalEarned: number;
  jobsCompleted: number;
  traits: WorkerTrait[];
}

export interface WorkerTrait {
  name: string;
  description: string;
  effect: 'positive' | 'negative' | 'neutral';
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
  workers: Worker[];
  jobs: Job[];
  customers: Customer[];
  selectedWorkerId?: string;
  gameStartTime: number;
  currentDay: number;
  gameSpeed: number;
  investorFunding: number;
  monthlyTarget: number;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'investor' | 'worker' | 'customer';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface CityTile {
  id: string;
  type: 'restaurant' | 'home' | 'office' | 'store' | 'park';
  hasJob: boolean;
  row: number;
  col: number;
  emoji: string;
}
