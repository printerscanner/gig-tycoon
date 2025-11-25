import { create } from "zustand";
import type { GameState, Job, Notification } from "@/types";

// Import modular components
import { createInitialState } from "./gameState/initialState";
import { createWorkerActions } from "./actions/workerActions";
import { createJobActions } from "./actions/jobActions";
import { createGameStateActions } from "./actions/gameStateActions";

interface GameStore extends GameState {
  // Actions
  hireWorker: () => void;
  hireOfficeWorker: () => void;
  hireSupportWorker: () => void;
  generateJob: () => void;
  assignJob: (jobId: string, workerId: string) => void;
  selectWorker: (workerId: string) => void;
  moveWorker: (workerId: string, targetRow: number, targetCol: number) => void;
  handleTileClick: (row: number, col: number) => void;
  updateGameState: () => void;
  resetGame: () => void;
  adjustPlatformCommission: (newCommission: number) => void;
  adjustCourierPayout: (newPayout: number) => void;
  dismissNotification: (notificationId: string) => void;
  addNotification: (
    notification: Omit<Notification, "id"> & { id?: string }
  ) => void;
  acceptInvestorDeal: () => void;
  autoAssignJobs: () => void;
  instantAssignJobs: () => void;
  buyMarketingBoost: () => void;
  getJobUrgencyStatus: (job: Job) => {
    timeElapsed: number;
    isOverdue: boolean;
    severity: "normal" | "warning" | "critical";
  };
  lastJobGeneration: number;
}

export const useGameStore = create<GameStore>((set, get) => {
  const initialState = createInitialState();
  const workerActions = createWorkerActions(set, get);
  const jobActions = createJobActions(set, get);
  const gameStateActions = createGameStateActions(set, get);

  return {
    ...initialState,

    // Worker actions
    ...workerActions,

    // Job actions
    ...jobActions,

    // Game state actions
    ...gameStateActions,
  };
});
