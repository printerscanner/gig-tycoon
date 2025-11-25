import { toast } from "sonner";
import type { Job, GameState, Worker } from "@/types";
import { JOB_CONFIG } from "../constants/gameConstants";
import { JOB_DESCRIPTIONS } from "../constants/gameData";
import {
  generateId,
  generateRandomBuildingPosition,
  getPriceMultiplier,
  calculateDistance,
} from "../utils/gameUtils";

type SetState = (
  partial: Partial<GameState> | ((state: GameState) => Partial<GameState>)
) => void;
type GetState = () => GameState & {
  assignJob: (jobId: string, workerId: string) => void;
  generateJob: () => void;
};

export const createJobActions = (set: SetState, get: GetState) => ({
  generateJob: () => {
    const type = "delivery"; // All jobs are food delivery
    const urgency = Math.floor(Math.random() * 3) + 1;

    const pickup = generateRandomBuildingPosition();
    const dropoff = generateRandomBuildingPosition();

    // Calculate crow flies distance (Euclidean distance)
    const distance = Math.sqrt(
      Math.pow(dropoff.row - pickup.row, 2) +
        Math.pow(dropoff.col - pickup.col, 2)
    );

    const currentState = get();

    // Generate total order value (what customer pays) €20-60
    const [minOrder, maxOrder] = JOB_CONFIG.BASE_ORDER_VALUE_RANGE;
    const baseOrderValue = Math.random() * (maxOrder - minOrder) + minOrder;

    // Add distance bonus (longer distance = higher order value)
    const maxDistance = Math.sqrt(12 * 12 + 12 * 12); // ~17 units
    const normalizedDistance = Math.min(distance / maxDistance, 1); // 0-1 range
    const distanceBonus = normalizedDistance * JOB_CONFIG.MAX_DISTANCE_BONUS;

    // Add urgency multiplier and time-based surge pricing
    const priceMultiplier = getPriceMultiplier(currentState.gameHours);
    const urgencyMultiplier = 1 + (urgency - 1) * JOB_CONFIG.URGENCY_MULTIPLIER;

    // Final total order value (what shows up in the game)
    const totalOrderValue = Math.round(
      (baseOrderValue + distanceBonus) * urgencyMultiplier * priceMultiplier
    );

    // This will be split later: platform commission vs courier payment
    const payment = totalOrderValue;

    const newJob: Job = {
      id: generateId(),
      type,
      pickup,
      dropoff,
      payment,
      // Use real time for creation so all SLA/assignment checks compare in milliseconds consistently
      timeCreated: Date.now(),
      status: "pending",
      description:
        JOB_DESCRIPTIONS[type][
          Math.floor(Math.random() * JOB_DESCRIPTIONS[type].length)
        ],
      urgency,
    };

    set({
      jobs: [...currentState.jobs, newJob],
    });
  },

  assignJob: (jobId: string, workerId: string) => {
    const state = get();
    const worker = state.workers.find((w: Worker) => w.id === workerId);
    const job = state.jobs.find((j: Job) => j.id === jobId);

    if (!worker || !job || worker.isWorking) {
      return;
    }

    set({
      ...state,
      jobs: state.jobs.map((j: Job) =>
        j.id === jobId
          ? { ...j, status: "assigned" as const, assignedWorkerId: workerId }
          : j
      ),
      workers: state.workers.map((w: Worker) =>
        w.id === workerId
          ? {
              ...w,
              isWorking: true,
              assignedJobId: jobId,
              targetPosition: job.pickup,
            }
          : w
      ),
    });
  },

  autoAssignJobs: () => {
    const state = get();
    const availableWorkers = state.workers.filter(
      (w: Worker) => !w.isWorking && w.isOnline && !w.isSick
    );
    // Assign any visible pending jobs immediately
    const pendingJobs = state.jobs.filter((j: Job) => j.status === "pending");

    if (availableWorkers.length === 0 || pendingJobs.length === 0) return;

    // Sort jobs by urgency (highest first) and payment (highest first)
    const sortedJobs = pendingJobs.sort((a: Job, b: Job) => {
      if (a.urgency !== b.urgency) return b.urgency - a.urgency;
      return b.payment - a.payment;
    });

    // Auto-assign jobs to closest available workers
    const assignments: Array<{ jobId: string; workerId: string }> = [];
    const usedWorkers = new Set<string>();

    for (const job of sortedJobs) {
      if (usedWorkers.size >= availableWorkers.length) break;

      // Find closest available worker to this job's pickup location
      const availableWorkersForJob = availableWorkers.filter(
        (w: Worker) => !usedWorkers.has(w.id)
      );

      if (availableWorkersForJob.length === 0) break;

      const closestWorker = availableWorkersForJob.reduce(
        (closest: Worker, worker: Worker) => {
          const workerDistance = calculateDistance(worker.position, job.pickup);
          const closestDistance = calculateDistance(
            closest.position,
            job.pickup
          );

          // If distances are equal, prefer happier worker for better service
          if (workerDistance === closestDistance) {
            return worker.happiness > closest.happiness ? worker : closest;
          }

          return workerDistance < closestDistance ? worker : closest;
        }
      );

      assignments.push({
        jobId: job.id,
        workerId: closestWorker.id,
      });

      usedWorkers.add(closestWorker.id);
    }

    if (assignments.length > 0) {
      assignments.forEach(({ jobId, workerId }) => {
        get().assignJob(jobId, workerId);
      });
    }
  },

  instantAssignJobs: () => {
    const state = get();

    // Simple check: find workers that are not working and are online/healthy
    const availableWorkers = state.workers.filter(
      (w: Worker) => !w.isWorking && !w.assignedJobId && w.isOnline && !w.isSick
    );

    // Find jobs that need assignment
    const pendingJobs = state.jobs.filter((j: Job) => j.status === "pending");

    if (state.workers.length > availableWorkers.length) {
      state.workers.filter((w: Worker) => w.isWorking || w.assignedJobId);
    }

    // Sort jobs by urgency (highest first) and payment (highest first)
    const sortedJobs = pendingJobs.sort((a: Job, b: Job) => {
      if (a.urgency !== b.urgency) return b.urgency - a.urgency;
      return b.payment - a.payment;
    });

    // Auto-assign jobs to closest available workers
    const assignments: Array<{ jobId: string; workerId: string }> = [];
    const usedWorkers = new Set<string>();

    for (const job of sortedJobs) {
      const eligibleWorkers = availableWorkers.filter(
        (w: Worker) => !usedWorkers.has(w.id)
      );
      if (eligibleWorkers.length === 0) break;

      // Find closest worker to pickup location
      let closestWorker = eligibleWorkers[0];
      let minDistance = calculateDistance(closestWorker.position, job.pickup);

      for (const worker of eligibleWorkers.slice(1)) {
        const distance = calculateDistance(worker.position, job.pickup);
        if (distance < minDistance) {
          minDistance = distance;
          closestWorker = worker;
        }
      }

      assignments.push({ jobId: job.id, workerId: closestWorker.id });
      usedWorkers.add(closestWorker.id);
    }

    if (assignments.length > 0) {
      assignments.forEach(({ jobId, workerId }) => {
        get().assignJob(jobId, workerId);
      });
    }
  },

  getJobUrgencyStatus: (job: Job) => {
    // Compute urgency off real time since job.timeCreated is a timestamp (ms)
    const now = Date.now();
    const jobAgeMs = Math.max(0, now - job.timeCreated);
    const jobAgeMinutes = jobAgeMs / 60000; // minutes elapsed in real time
    const maxWaitMinutes = 10; // overdue after 10 minutes real time

    const isOverdue = jobAgeMinutes > maxWaitMinutes;
    let severity: "normal" | "warning" | "critical" = "normal";
    if (isOverdue) severity = "critical";
    else if (jobAgeMinutes > maxWaitMinutes * 0.7) severity = "warning";

    // Return minutes so UI can display integer minutes easily
    return { timeElapsed: jobAgeMinutes, isOverdue, severity };
  },

  buyMarketingBoost: () => {
    const state = get();
    const totalStaff =
      state.workers.length +
      state.officeWorkers.length +
      state.supportStaff.length;

    // Cost scales aggressively with team size: €5k base + €2k per staff member
    const baseCost = 5000;
    const perStaffCost = 2000;
    const totalCost = baseCost + totalStaff * perStaffCost;

    if (state.cash < totalCost) {
      toast.error(`💸 Not enough cash! Need €${totalCost.toLocaleString()}`, {
        description: `You have €${state.cash.toLocaleString()}`,
      });
      return;
    }

    // Deduct cost and generate 3-5 immediate jobs
    const jobsToGenerate = Math.floor(Math.random() * 3) + 3; // 3-5 jobs

    set((state: GameState) => ({
      ...state,
      cash: state.cash - totalCost,
    }));

    // Generate the marketing boost jobs
    for (let i = 0; i < jobsToGenerate; i++) {
      get().generateJob();
    }

    toast.success(
      `📢 Marketing boost purchased! Generated ${jobsToGenerate} orders`,
      {
        description: `Cost: €${totalCost.toLocaleString()} | Team size: ${totalStaff}`,
      }
    );
  },
});
