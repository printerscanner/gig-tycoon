import { create } from "zustand";
import { toast } from "sonner";
import type {
  GameState,
  Worker,
  Job,
  Notification,
  WorkerTrait,
} from "@/types";

interface GameStore extends GameState {
  // Actions
  hireWorker: () => void;
  generateJob: () => void;
  assignJob: (jobId: string, workerId: string) => void;
  selectWorker: (workerId: string) => void;
  moveWorker: (workerId: string, targetRow: number, targetCol: number) => void;
  handleTileClick: (row: number, col: number) => void;
  updateGameState: () => void;
  resetGame: () => void;
  adjustServiceFee: (newFee: number) => void;
  dismissNotification: (notificationId: string) => void;
  acceptInvestorDeal: () => void;
  autoAssignJobs: () => void; // New: auto-assign jobs to available workers
  lastJobGeneration: number; // Track when last job was generated
}

const WORKER_NAMES = ["Alex", "Sam", "Jordan", "Casey", "Taylor", "Morgan"];

const WORKER_TRAITS: WorkerTrait[] = [
  { name: "Reliable", description: "Always on time", effect: "positive" },
  { name: "Hustler", description: "Works extra fast", effect: "positive" },
  {
    name: "Burnout-prone",
    description: "Happiness drops quickly",
    effect: "negative",
  },
  { name: "Lazy", description: "Moves slowly", effect: "negative" },
  { name: "Stressed", description: "Makes more mistakes", effect: "negative" },
  { name: "Optimist", description: "Stays happy longer", effect: "positive" },
];

const SARCASTIC_MESSAGES = [
  "Guess I'll eat instant noodles again lol",
  "Living the dream on minimum wage! 🙃",
  "Another day, another dollar... wait, make that 50 cents",
  "My landlord will understand, right?",
  "Time to update my LinkedIn... again",
];

// Check if a position is a road (matches CityGrid road logic)
const isRoadPosition = (row: number, col: number) => {
  return row % 3 === 0 || col % 3 === 0;
};

// Generate a random road position for worker spawning
const generateRandomRoadPosition = () => {
  const roads = [];
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 20; col++) {
      if (isRoadPosition(row, col)) {
        roads.push({ row, col });
      }
    }
  }
  return roads[Math.floor(Math.random() * roads.length)];
};

// Generate a random building position for job pickup/dropoff (no roads)
const generateRandomBuildingPosition = () => {
  const buildings = [];
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 20; col++) {
      if (!isRoadPosition(row, col)) {
        buildings.push({ row, col });
      }
    }
  }
  return buildings[Math.floor(Math.random() * buildings.length)];
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const generateNotification = (
  type: Notification["type"],
  title: string,
  message: string
): Notification => ({
  id: generateId(),
  type,
  title,
  message,
  timestamp: Date.now(),
  read: false,
});

const initialState: GameState = {
  cash: 10000, // Starting with $10k seed money
  reputation: 85,
  workerMorale: 75,
  completedJobs: 0,
  serviceFee: 20, // Platform takes 20% by default, workers keep 80%
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
    },
  ],
  jobs: [],
  customers: [],
  gameStartTime: Date.now(),
  currentDay: 1,
  gameSpeed: 1,
  investorFunding: 0,
  monthlyTarget: 50, // First investor goal: 50 deliveries
  notifications: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  lastJobGeneration: Date.now() - 6000, // Start 6 seconds ago to trigger immediate job generation

  hireWorker: () => {
    const state = get();
    const hiringCost = state.workers.length === 0 ? 0 : 2000; // First 2 workers free, then $2000

    if (state.cash < hiringCost && state.workers.length >= 2) {
      toast.error("💸 Not enough cash to hire a worker!");
      return;
    }

    const traits = [
      WORKER_TRAITS[Math.floor(Math.random() * WORKER_TRAITS.length)],
    ];

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
    };

    const isFirstWorker = state.workers.length === 0;
    const costMessage = isFirstWorker ? "(Free!)" : `(-$${hiringCost})`;
    
    toast.success(`🎉 ${newWorker.name} joined your team! ${costMessage}`, {
      description: `Traits: ${traits.map((t) => t.name).join(", ")}`,
    });

    set({
      ...state,
      cash: state.cash - hiringCost,
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

  generateJob: () => {
    const jobTypes: Job["type"][] = ["delivery", "rideshare", "labor"];
    const type = jobTypes[Math.floor(Math.random() * jobTypes.length)];
    const urgency = Math.floor(Math.random() * 3) + 1;

    const descriptions = {
      delivery: [
        "🥡 Pizza Palace → Home",
        "🍔 Burger Barn → Office",
        "🥗 Salad Station → Apartment",
      ],
      rideshare: [
        "🏠 Home → Airport",
        "🏢 Office → Mall",
        "🎭 Theater → Hotel",
      ],
      labor: ["📦 Moving boxes", "🔧 Furniture assembly", "🧹 Office cleaning"],
    };

    const newJob: Job = {
      id: generateId(),
      type,
      pickup: generateRandomBuildingPosition(),
      dropoff: generateRandomBuildingPosition(),
      payment: urgency * 5 + Math.floor(Math.random() * 10) + 10, // $15-35 based on urgency
      timeCreated: Date.now(),
      status: "pending",
      description:
        descriptions[type][
          Math.floor(Math.random() * descriptions[type].length)
        ],
      urgency,
    };

    const currentState = get();
    
    set({
      jobs: [...currentState.jobs, newJob],
    });
  },

  assignJob: (jobId: string, workerId: string) => {
    const state = get();
    const worker = state.workers.find((w) => w.id === workerId);
    const job = state.jobs.find((j) => j.id === jobId);

    if (!worker || !job || worker.isWorking) return;

    set({
      ...state,
      jobs: state.jobs.map((j) =>
        j.id === jobId
          ? { ...j, status: "assigned" as const, assignedWorkerId: workerId }
          : j
      ),
      workers: state.workers.map((w) =>
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

  selectWorker: (workerId: string) => {
    set((state) => ({
      ...state,
      selectedWorkerId:
        state.selectedWorkerId === workerId ? undefined : workerId,
    }));
  },

  moveWorker: (workerId: string, targetRow: number, targetCol: number) => {
    set((state) => ({
      ...state,
      workers: state.workers.map((worker) =>
        worker.id === workerId
          ? { ...worker, targetPosition: { row: targetRow, col: targetCol } }
          : worker
      ),
    }));
  },

  handleTileClick: (row: number, col: number) => {
    const state = get();
    if (state.selectedWorkerId) {
      get().moveWorker(state.selectedWorkerId, row, col);
    }
  },

  adjustServiceFee: (newFee: number) => {
    const state = get();
    
    // Clamp service fee between 0% and 50%
    const clampedFee = Math.max(0, Math.min(50, newFee));
    
    set({
      ...state,
      serviceFee: clampedFee,
    });
    
    toast.info(`💰 Service fee updated to ${clampedFee}%`, {
      description: `Workers keep ${100 - clampedFee}% of each job payment`,
    });
  },

  updateGameState: () => {
    // Handle job generation OUTSIDE of the main state update
    const now = Date.now();
    const currentState = get();
    const timeSinceLastJob = now - currentState.lastJobGeneration;
    const jobGenerationInterval = Math.max(
      2000,
      5000 - currentState.completedJobs * 50
    );

    if (timeSinceLastJob > jobGenerationInterval) {
      // Generate jobs first, then update game state
      const jobsToGenerate = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < jobsToGenerate; i++) {
        get().generateJob();
      }
      // Update the last generation time
      set((state) => ({ ...state, lastJobGeneration: now }));
      return; // Exit early to let the jobs be processed in the next cycle
    }

    // Auto-assignment logic (every 3 seconds)
    if (
      Math.floor(timeSinceLastJob / 1000) % 3 === 0 &&
      timeSinceLastJob % 1000 < 100
    ) {
      get().autoAssignJobs();
    }

    // Now handle the main game state update
    set((state) => {
      const now = Date.now();

      // Move workers towards their target (enhanced AI movement)
      const updatedWorkers = state.workers.map((worker) => {
        if (worker.assignedJobId && !worker.targetPosition) {
          // If worker has a job but no target, set target to pickup location
          const assignedJob = state.jobs.find(
            (j) => j.id === worker.assignedJobId
          );
          if (assignedJob) {
            return { ...worker, targetPosition: assignedJob.pickup };
          }
        }

        if (worker.targetPosition) {
          const { row, col } = worker.position;
          const { row: targetRow, col: targetCol } = worker.targetPosition;

          // Check if worker is stuck (same position for several ticks)
          if (worker.lastPosition && 
              worker.lastPosition.row === row && 
              worker.lastPosition.col === col) {
            console.log(`Worker stuck at ${row},${col} trying to reach ${targetRow},${targetCol}`);
          }

          let newRow = row;
          let newCol = col;

          // Apply trait effects to movement speed (faster for visibility)
          const baseSpeed = 0.3; // Faster movement so you can see workers traveling
          const speed = worker.traits.some((t) => t.name === "Hustler")
            ? baseSpeed * 1.5
            : worker.traits.some((t) => t.name === "Lazy")
            ? baseSpeed * 0.5
            : baseSpeed;

          if (Math.random() < speed) {
            // Smart pathfinding - move towards target, but only on roads unless at destination
            const reachedTarget = row === targetRow && col === targetCol;
            
            if (reachedTarget) {
              // Worker is at destination, no need to move
            } else {
              // Try to move towards target
              let nextRow = row;
              let nextCol = col;
              
              // Calculate which direction to move
              if (row < targetRow) nextRow++;
              else if (row > targetRow) nextRow--;
              
              if (col < targetCol) nextCol++;
              else if (col > targetCol) nextCol--;
              
              // Check if next position is valid (within bounds)
              const nextInBounds = nextRow >= 0 && nextRow < 20 && nextCol >= 0 && nextCol < 20;
              
              if (nextInBounds) {
                const nextIsDestination = nextRow === targetRow && nextCol === targetCol;
                const nextIsRoad = isRoadPosition(nextRow, nextCol);
                
                // Check if we're going to a building that's our pickup/dropoff destination
                const isDestinationBuilding = worker.assignedJobId && nextIsDestination;
                
                if (nextIsRoad || isDestinationBuilding) {
                  // Preferred path: use roads OR enter destination building
                  newRow = nextRow;
                  newCol = nextCol;
                } else {
                  // Try to find a road path first
                  const roadOptions = [
                    { row: row - 1, col }, { row: row + 1, col },
                    { row, col: col - 1 }, { row, col: col + 1 }
                  ].filter(pos => 
                    pos.row >= 0 && pos.row < 20 && 
                    pos.col >= 0 && pos.col < 20 && 
                    isRoadPosition(pos.row, pos.col)
                  );
                  
                  if (roadOptions.length > 0) {
                    // Filter out the last position to prevent oscillation
                    const filteredOptions = worker.lastPosition 
                      ? roadOptions.filter(option => 
                          !(option.row === worker.lastPosition!.row && option.col === worker.lastPosition!.col)
                        )
                      : roadOptions;
                    
                    const optionsToUse = filteredOptions.length > 0 ? filteredOptions : roadOptions;
                    
                    // Pick the road option that gets us closest to target
                    const bestOption = optionsToUse.reduce((best, option) => {
                      const bestDistance = Math.abs(best.row - targetRow) + Math.abs(best.col - targetCol);
                      const optionDistance = Math.abs(option.row - targetRow) + Math.abs(option.col - targetCol);
                      return optionDistance < bestDistance ? option : best;
                    });
                    newRow = bestOption.row;
                    newCol = bestOption.col;
                  } else {
                    // No road options available - allow movement through buildings
                    // if we're close to destination (within 2 tiles)
                    const currentDistance = Math.abs(row - targetRow) + Math.abs(col - targetCol);
                    const nextDistance = Math.abs(nextRow - targetRow) + Math.abs(nextCol - targetCol);
                    
                    // Allow building traversal if we're close to destination or getting closer
                    if (currentDistance <= 3 || nextDistance < currentDistance) {
                      newRow = nextRow;
                      newCol = nextCol;
                    }
                  }
                }
              }
            }
          }

          const reachedTarget = newRow === targetRow && newCol === targetCol;

          // Debug logging for stuck workers
          if (worker.assignedJobId && newRow === row && newCol === col) {
            const job = state.jobs.find(j => j.id === worker.assignedJobId);
            if (job) {
              console.log(`🚫 ${worker.name} stuck at (${row}, ${col}), trying to reach (${targetRow}, ${targetCol})`);
            }
          }

          // If reached pickup, instantly move to dropoff
          if (reachedTarget && worker.assignedJobId) {
            const job = state.jobs.find((j) => j.id === worker.assignedJobId);
            if (
              job &&
              job.pickup.row === targetRow &&
              job.pickup.col === targetCol
            ) {
              console.log(`📦 ${worker.name} picked up job at (${targetRow}, ${targetCol}), heading to (${job.dropoff.row}, ${job.dropoff.col})`);
              // Instant pickup - immediately set target to dropoff
              return {
                ...worker,
                position: { row: newRow, col: newCol },
                targetPosition: job.dropoff,
              };
            }
            // If reached dropoff, clear target immediately for instant completion
            if (
              job &&
              job.dropoff.row === targetRow &&
              job.dropoff.col === targetCol
            ) {
              console.log(`✅ ${worker.name} reached dropoff at (${targetRow}, ${targetCol})`);
              return {
                ...worker,
                position: { row: newRow, col: newCol },
                targetPosition: undefined, // Clear target for instant completion
              };
            }
          }

          return {
            ...worker,
            position: { row: newRow, col: newCol },
            lastPosition: { row, col }, // Track previous position
            targetPosition: reachedTarget ? undefined : worker.targetPosition,
          };
        }

        // If worker is idle, occasionally move them to a random road location
        if (!worker.isWorking && Math.random() < 0.05) { // Reduced frequency
          return {
            ...worker,
            targetPosition: generateRandomRoadPosition(),
          };
        }

        return worker;
      });

      // Handle job completion and ratings (but preserve recently created jobs)
      const updatedJobs = state.jobs.map((job) => {
        // Don't process jobs that were just created (less than 1 second old)
        if (job.status === "pending" && now - job.timeCreated < 1000) {
          return job; // Keep the job as-is
        }

        if (job.status === "assigned" && job.assignedWorkerId) {
          const worker = updatedWorkers.find(
            (w) => w.id === job.assignedWorkerId
          );
          if (
            worker &&
            worker.position.row === job.dropoff.row &&
            worker.position.col === job.dropoff.col
          ) {
            // Complete the job as soon as worker reaches dropoff position
            // No need to check targetPosition since we want instant completion
            
            console.log(`🎉 ${worker.name} completed delivery at (${job.dropoff.row}, ${job.dropoff.col})!`);
            
            // Calculate customer rating based on worker happiness and job urgency
            const baseRating = Math.min(
              5,
              Math.max(1, Math.floor(worker.happiness / 20 + (6 - job.urgency)))
            );

            const rating = worker.traits.some((t) => t.name === "Stressed")
              ? Math.max(1, baseRating - 1)
              : baseRating;

            return {
              ...job,
              status: "completed" as const,
              customerRating: rating,
            };
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
            state.jobs.find((j) => j.id === job.id)?.status === "assigned"
        );

        if (completedJob) {
          // Calculate worker earnings based on service fee
          const jobPayment = completedJob.payment || 0;
          const workerEarnings = jobPayment * (100 - state.serviceFee) / 100;
          const platformCut = jobPayment - workerEarnings;
          
          // Add platform cut to cash
          state.cash += platformCut;
          
          // Adjust happiness based on service fee
          let happinessChange = 0;
          if (state.serviceFee <= 15) happinessChange = 2; // Low fee = happy
          else if (state.serviceFee <= 25) happinessChange = 0; // Medium fee = neutral  
          else happinessChange = -3; // High fee = unhappy

          // Apply trait effects
          if (worker.traits.some((t) => t.name === "Burnout-prone")) {
            happinessChange -= 2;
          }
          if (worker.traits.some((t) => t.name === "Optimist")) {
            happinessChange += 1;
          }

          const newHappiness = Math.max(
            0,
            Math.min(100, worker.happiness + happinessChange)
          );

          return {
            ...worker,
            isWorking: false,
            assignedJobId: undefined,
            targetPosition: undefined,
            totalEarned: worker.totalEarned + workerEarnings,
            jobsCompleted: worker.jobsCompleted + 1,
            happiness: newHappiness,
          };
        }
        return worker;
      });

      const newCompletedJobs = updatedJobs.filter(
        (job) => job.status === "completed"
      ).length;
      const completedThisCycle = newCompletedJobs - state.completedJobs;
      
      const earnedThisCycle =
        completedThisCycle > 0
          ? updatedJobs
              .filter((job) => job.status === "completed")
              .slice(-completedThisCycle)
              .reduce(
                (sum, job) => {
                  const jobPayment = job.payment || 0;
                  const platformCut = jobPayment * state.serviceFee / 100;
                  return sum + platformCut;
                },
                0
              )
          : 0;

      // Calculate new reputation from recent ratings
      const recentRatings = updatedJobs
        .filter((job) => job.customerRating)
        .slice(-10)
        .map((job) => job.customerRating!);

      const newReputation =
        recentRatings.length > 0
          ? (recentRatings.reduce((sum, rating) => sum + rating, 0) /
              recentRatings.length) *
            20
          : state.reputation;

      // Calculate worker morale
      const newWorkerMorale =
        finalWorkers.length > 0
          ? finalWorkers.reduce((sum, worker) => sum + worker.happiness, 0) /
            finalWorkers.length
          : 100;

      // Check for investor milestone
      const newNotifications = [...state.notifications];
      if (newCompletedJobs >= 10 && state.investorFunding === 0) {
        newNotifications.push(
          generateNotification(
            "investor",
            "Investor Interest!",
            "We like your growth. Here's $20,000. Expand deliveries to 50 per day by end of month!"
          )
        );
      }

      // Add notifications for worker happiness issues
      const unhappyWorkers = finalWorkers.filter((w) => w.happiness < 30);
      if (unhappyWorkers.length > 0 && Math.random() < 0.1) {
        const worker =
          unhappyWorkers[Math.floor(Math.random() * unhappyWorkers.length)];
        newNotifications.push(
          generateNotification(
            "warning",
            `${worker.name} is struggling`,
            SARCASTIC_MESSAGES[
              Math.floor(Math.random() * SARCASTIC_MESSAGES.length)
            ]
          )
        );
      }

      return {
        ...state, // Spread the entire state first
        workers: finalWorkers,
        jobs: updatedJobs,
        cash: state.cash + earnedThisCycle,
        completedJobs: newCompletedJobs,
        reputation: newReputation,
        workerMorale: newWorkerMorale,
        notifications: newNotifications,
      };
    });
  },

  acceptInvestorDeal: () => {
    set((state) => ({
      ...state,
      cash: state.cash + 20000,
      investorFunding: 20000,
      monthlyTarget: 50,
      notifications: [
        ...state.notifications.filter((n) => n.type !== "investor"),
        generateNotification(
          "success",
          "Funding Secured!",
          "You now have $20,000 to expand. Target: 50 deliveries this month!"
        ),
      ],
    }));
  },

  dismissNotification: (notificationId: string) => {
    set((state) => ({
      ...state,
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    }));
  },

  resetGame: () => {
    set({
      ...initialState,
      gameStartTime: Date.now(),
      lastJobGeneration: Date.now(),
    });
  },

  autoAssignJobs: () => {
    const state = get();
    const now = Date.now();
    const availableWorkers = state.workers.filter((w) => !w.isWorking);
    // Only assign jobs that have been pending for at least 2 seconds (so they're visible first)
    const pendingJobs = state.jobs.filter(
      (j) => j.status === "pending" && now - j.timeCreated > 2000
    );

    if (availableWorkers.length === 0 || pendingJobs.length === 0) return;

    // Sort jobs by urgency (highest first) and payment (highest first)
    const sortedJobs = pendingJobs.sort((a, b) => {
      if (a.urgency !== b.urgency) return b.urgency - a.urgency;
      return b.payment - a.payment;
    });

    // Sort workers by happiness (happiest first for better service)
    const sortedWorkers = availableWorkers.sort(
      (a, b) => b.happiness - a.happiness
    );

    // Auto-assign jobs to workers
    const assignments: Array<{ jobId: string; workerId: string }> = [];
    for (
      let i = 0;
      i < Math.min(sortedJobs.length, sortedWorkers.length);
      i++
    ) {
      assignments.push({
        jobId: sortedJobs[i].id,
        workerId: sortedWorkers[i].id,
      });
    }

    if (assignments.length > 0) {
      assignments.forEach(({ jobId, workerId }) => {
        get().assignJob(jobId, workerId);
      });
    }
  },
}));
