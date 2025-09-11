import { useState, useCallback, useEffect } from "react";
import type { GameState, Worker, Job } from "@/types";

const INITIAL_GAME_STATE: GameState = {
  cash: 500,
  reputation: 50,
  workerMorale: 50,
  completedJobs: 0,
  workers: [],
  jobs: [],
  customers: [],
  gameStartTime: Date.now(),
  currentDay: 1,
  gameSpeed: 1,
  investorFunding: 0,
  monthlyTarget: 50,
  notifications: [],
  serviceFee: 20,
};

const WORKER_NAMES = [
  "Alex",
  "Jordan",
  "Casey",
  "Taylor",
  "Morgan",
  "Riley",
  "Avery",
  "Quinn",
  "Drew",
  "Sage",
  "Blake",
  "Rowan",
  "Emery",
  "Finley",
  "Hayden",
  "Reese",
];

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  const generateRandomPosition = () => ({
    row: Math.floor(Math.random() * 10),
    col: Math.floor(Math.random() * 10),
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const hireWorker = useCallback(() => {
    if (gameState.cash < 100) return;

    const newWorker: Worker = {
      id: generateId(),
      name: WORKER_NAMES[Math.floor(Math.random() * WORKER_NAMES.length)],
      stamina: Math.floor(Math.random() * 50) + 50,
      happiness: Math.floor(Math.random() * 30) + 70,
      position: generateRandomPosition(),
      isWorking: false,
      totalEarned: 0,
      jobsCompleted: 0,
      traits: [],
    };

    setGameState((prev) => ({
      ...prev,
      cash: prev.cash - 100,
      workers: [...prev.workers, newWorker],
    }));
  }, [gameState.cash]);

  const generateJob = useCallback(() => {
    const jobTypes: Job["type"][] = ["delivery", "rideshare", "labor"];
    const type = jobTypes[Math.floor(Math.random() * jobTypes.length)];

    const newJob: Job = {
      id: generateId(),
      type,
      pickup: generateRandomPosition(),
      dropoff: generateRandomPosition(),
      payment: Math.floor(Math.random() * 50) + 20,
      timeCreated: Date.now(),
      status: "pending",
      description: `${type} job - deliver from pickup to dropoff`,
      urgency: Math.floor(Math.random() * 3) + 1,
    };

    setGameState((prev) => ({
      ...prev,
      jobs: [...prev.jobs, newJob],
    }));
  }, []);

  const assignJob = useCallback((jobId: string, workerId: string) => {
    setGameState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((job) =>
        job.id === jobId
          ? { ...job, status: "assigned" as const, assignedWorkerId: workerId }
          : job
      ),
      workers: prev.workers.map((worker) =>
        worker.id === workerId
          ? { ...worker, isWorking: true, assignedJobId: jobId }
          : worker
      ),
    }));
  }, []);

  const selectWorker = useCallback((workerId: string) => {
    setGameState((prev) => ({
      ...prev,
      selectedWorkerId:
        prev.selectedWorkerId === workerId ? undefined : workerId,
    }));
  }, []);

  const moveWorker = useCallback(
    (workerId: string, targetRow: number, targetCol: number) => {
      setGameState((prev) => ({
        ...prev,
        workers: prev.workers.map((worker) =>
          worker.id === workerId
            ? { ...worker, targetPosition: { row: targetRow, col: targetCol } }
            : worker
        ),
      }));
    },
    []
  );

  const handleTileClick = useCallback(
    (row: number, col: number) => {
      if (gameState.selectedWorkerId) {
        moveWorker(gameState.selectedWorkerId, row, col);
      }
    },
    [gameState.selectedWorkerId, moveWorker]
  );

  // Game simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => {
        const updatedWorkers = prev.workers.map((worker) => {
          // Move workers towards their target
          if (worker.targetPosition) {
            const { row, col } = worker.position;
            const { row: targetRow, col: targetCol } = worker.targetPosition;

            let newRow = row;
            let newCol = col;

            if (row < targetRow) newRow++;
            else if (row > targetRow) newRow--;

            if (col < targetCol) newCol++;
            else if (col > targetCol) newCol--;

            const reachedTarget = newRow === targetRow && newCol === targetCol;

            return {
              ...worker,
              position: { row: newRow, col: newCol },
              targetPosition: reachedTarget ? undefined : worker.targetPosition,
            };
          }
          return worker;
        });

        // Complete jobs when workers reach dropoff
        const updatedJobs = prev.jobs.map((job) => {
          if (job.status === "assigned" && job.assignedWorkerId) {
            const worker = updatedWorkers.find(
              (w) => w.id === job.assignedWorkerId
            );
            if (
              worker &&
              worker.position.row === job.dropoff.row &&
              worker.position.col === job.dropoff.col &&
              !worker.targetPosition
            ) {
              return { ...job, status: "completed" as const };
            }
          }
          return job;
        });

        // Update workers who completed jobs
        const finalWorkers = updatedWorkers.map((worker) => {
          const completedJob = updatedJobs.find(
            (job) =>
              job.assignedWorkerId === worker.id &&
              job.status === "completed" &&
              prev.jobs.find((j) => j.id === job.id)?.status === "assigned"
          );

          if (completedJob) {
            return {
              ...worker,
              isWorking: false,
              assignedJobId: undefined,
              totalEarned: worker.totalEarned + completedJob.payment,
              jobsCompleted: worker.jobsCompleted + 1,
            };
          }
          return worker;
        });

        const newCompletedJobs = updatedJobs.filter(
          (job) => job.status === "completed"
        ).length;
        const completedThisCycle = newCompletedJobs - prev.completedJobs;
        const earnedThisCycle =
          completedThisCycle > 0
            ? updatedJobs
                .filter((job) => job.status === "completed")
                .slice(-completedThisCycle)
                .reduce((sum, job) => sum + job.payment, 0)
            : 0;

        return {
          ...prev,
          workers: finalWorkers,
          jobs: updatedJobs,
          cash: prev.cash + earnedThisCycle,
          completedJobs: newCompletedJobs,
          reputation: Math.min(100, prev.reputation + completedThisCycle * 2),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    gameState,
    hireWorker,
    generateJob,
    assignJob,
    selectWorker,
    handleTileClick,
  };
}
