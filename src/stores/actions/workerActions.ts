import { toast } from "sonner";
import type { Worker, OfficeWorker, GameState } from "@/types";
import {
  WORKER_CONFIG,
  OFFICE_WORKER_CONFIG,
  SUPPORT_STAFF_CONFIG,
} from "../constants/gameConstants";
import {
  WORKER_NAMES,
  OFFICE_WORKER_NAMES,
  SUPPORT_STAFF_NAMES,
  WORKER_TRAITS,
} from "../constants/gameData";
import {
  generateId,
  generateRandomRoadPosition,
  calculateMaxCourierCapacity,
} from "../utils/gameUtils";
import { generateNotification } from "../utils/notificationUtils";

type SetState = (
  partial: Partial<GameState> | ((state: GameState) => Partial<GameState>)
) => void;
type GetState = () => GameState;

export const createWorkerActions = (set: SetState, get: GetState) => ({
  hireWorker: () => {
    const state = get();

    // First office worker required after 5 couriers
    if (state.workers.length >= 5 && state.officeWorkers.length === 0) {
      toast.error(
        "🏢 Need office worker! Hire an office worker to manage more than 5 couriers.",
        {
          description: "Office workers support 10 couriers each (€10k/month)",
        }
      );
      return;
    }

    const maxCapacity = calculateMaxCourierCapacity(state.officeWorkers);

    if (state.workers.length >= maxCapacity) {
      toast.error("🏢 Capacity reached! Hire more office workers to expand.", {
        description: `Current capacity: ${maxCapacity} couriers`,
      });
      return;
    }

    const { HIRING_COST } = WORKER_CONFIG;

    if (state.cash < HIRING_COST) {
      toast.error("💸 Not enough cash to hire a courier!");
      return;
    }

    const traits = [
      WORKER_TRAITS[Math.floor(Math.random() * WORKER_TRAITS.length)],
    ];

    // Generate random working hours (8-14 hour shifts)
    const shiftLength = Math.floor(Math.random() * 7) + 8; // 8-14 hours
    const startHour = Math.floor(Math.random() * 8) + 6; // Start between 6 AM and 2 PM
    const startTime = startHour * 60;
    const endTime = startTime + shiftLength * 60;

    const newWorker: Worker = {
      id: generateId(),
      name: WORKER_NAMES[state.workers.length % WORKER_NAMES.length],
      stamina: Math.floor(Math.random() * 30) + 60, // 60-90
      happiness: Math.floor(Math.random() * 20) + 70, // 70-90
      position: generateRandomRoadPosition(), // Start workers on roads
      isWorking: false,
      totalEarned: 0,
      jobsCompleted: 0,
      traits,
      workingHours: { start: startTime, end: endTime },
      isOnline: true,
      isSick: false,
      mood: Math.floor(Math.random() * 20) + 70, // 70-90 mood
      lastMoodCheck: state.gameHours,
      totalHoursWorked: 0,
    };

    const costMessage = `(-€${HIRING_COST})`;

    toast.success(`🎉 ${newWorker.name} joined your team! ${costMessage}`, {
      description: `Traits: ${traits
        .map((t) => t.name)
        .join(", ")} | Capacity: ${state.workers.length + 1}/${maxCapacity}`,
    });

    set({
      ...state,
      cash: state.cash - HIRING_COST,
      workers: [...state.workers, newWorker],
      notifications: [
        ...state.notifications,
        generateNotification(
          "success",
          "New Worker Hired!",
          `${newWorker.name} joined your team. Traits: ${traits
            .map((t) => t.name)
            .join(", ")}`
        ),
      ],
    });
  },

  hireOfficeWorker: () => {
    const state = get();
    const { HIRING_COST, MONTHLY_SALARY, CAPACITY_PER_WORKER } =
      OFFICE_WORKER_CONFIG;

    if (state.cash < HIRING_COST) {
      toast.error("💸 Not enough cash to hire an office worker!");
      return;
    }

    const newOfficeWorker: OfficeWorker = {
      id: generateId(),
      name: OFFICE_WORKER_NAMES[
        state.officeWorkers.length % OFFICE_WORKER_NAMES.length
      ],
      efficiency: Math.floor(Math.random() * 20) + 80, // 80-100 efficiency
      adminCapacity: CAPACITY_PER_WORKER, // New office workers add 5 courier capacity each
      monthlySalary: MONTHLY_SALARY,
      hiredAt: state.gameHours,
      totalCost: 0,
    };

    const newMaxCapacity = calculateMaxCourierCapacity([
      ...state.officeWorkers,
      newOfficeWorker,
    ]);

    toast.success(
      `🏢 ${newOfficeWorker.name} joined your office! (-€${HIRING_COST})`,
      {
        description: `Adds ${CAPACITY_PER_WORKER} courier capacity | €${MONTHLY_SALARY}/month salary | New capacity: ${newMaxCapacity}`,
      }
    );

    set({
      ...state,
      cash: state.cash - HIRING_COST,
      officeWorkers: [...state.officeWorkers, newOfficeWorker],
      notifications: [
        ...state.notifications,
        generateNotification(
          "success",
          "Office Worker Hired!",
          `${newOfficeWorker.name} can manage ${
            CAPACITY_PER_WORKER * 2
          } couriers. Monthly cost: €${MONTHLY_SALARY}. New capacity: ${newMaxCapacity}`
        ),
      ],
    });
  },

  hireSupportWorker: () => {
    const state = get();
    const { HIRING_COST, MONTHLY_SALARY, CAPACITY_PER_WORKER } =
      SUPPORT_STAFF_CONFIG;

    if (state.cash < HIRING_COST) {
      toast.error("💸 Not enough cash to hire customer support!");
      return;
    }

    const newSupportWorker = {
      id: generateId(),
      name: SUPPORT_STAFF_NAMES[
        state.supportStaff.length % SUPPORT_STAFF_NAMES.length
      ],
      supportCapacity: CAPACITY_PER_WORKER, // Supports 20 couriers each
      monthlySalary: MONTHLY_SALARY,
      hiredAt: state.gameHours,
      totalCost: 0,
    };

    set((state: GameState) => ({
      ...state,
      cash: state.cash - HIRING_COST,
      supportStaff: [...state.supportStaff, newSupportWorker],
    }));

    toast.success(
      `📞 ${newSupportWorker.name} joined customer support! (-€${HIRING_COST})`,
      {
        description: `Supports ${CAPACITY_PER_WORKER} couriers | €${MONTHLY_SALARY}/month salary | Helps maintain reputation`,
      }
    );
  },

  selectWorker: (workerId: string) => {
    set((state: GameState) => ({
      ...state,
      selectedWorkerId:
        state.selectedWorkerId === workerId ? undefined : workerId,
    }));
  },

  moveWorker: (workerId: string, targetRow: number, targetCol: number) => {
    set((state: GameState) => ({
      ...state,
      workers: state.workers.map((worker: Worker) =>
        worker.id === workerId
          ? { ...worker, targetPosition: { row: targetRow, col: targetCol } }
          : worker
      ),
    }));
  },
});
