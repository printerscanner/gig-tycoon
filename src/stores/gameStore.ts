import { create } from "zustand";
import { toast } from "sonner";
import type {
  GameState,
  Worker,
  OfficeWorker,
  SupportWorker,
  Job,
  Notification,
  WorkerTrait,
} from "@/types";

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
  autoAssignJobs: () => void; // New: auto-assign jobs to available workers
  instantAssignJobs: () => void; // Instantly assign jobs without delay
  buyMarketingBoost: () => void; // Buy marketing boost to increase job generation
  getJobUrgencyStatus: (job: Job) => {
    timeElapsed: number;
    isOverdue: boolean;
    severity: "normal" | "warning" | "critical";
  };
  lastJobGeneration: number; // Track when last job was generated
}

const WORKER_NAMES = ["Alex", "Sam", "Jordan", "Casey", "Taylor", "Morgan"];

const OFFICE_WORKER_NAMES = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "William",
  "Sophia",
  "James",
  "Isabella",
  "Oliver",
  "Charlotte",
  "Benjamin",
  "Amelia",
  "Lucas",
  "Mia",
];

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
  const GRID_SIZE = 12;
  return (
    row % 3 === 0 ||
    col % 3 === 0 ||
    row === GRID_SIZE - 1 ||
    col === GRID_SIZE - 1
  );
};

// Generate a random road position for worker spawning
const generateRandomRoadPosition = () => {
  const GRID_SIZE = 12; // Match CityGrid size
  const roads = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (isRoadPosition(row, col)) {
        roads.push({ row, col });
      }
    }
  }
  return roads[Math.floor(Math.random() * roads.length)];
};

// Generate a random building position for job pickup/dropoff (no roads)
const generateRandomBuildingPosition = () => {
  const GRID_SIZE = 12; // Match CityGrid size
  const buildings = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!isRoadPosition(row, col)) {
        buildings.push({ row, col });
      }
    }
  }
  return buildings[Math.floor(Math.random() * buildings.length)];
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Time helper functions
const formatGameTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, "0")} ${ampm}`;
};

// Check if current time is during peak hours (lunch: 11-14, dinner: 17-21)
const isPeakHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60) % 24;
  return (hours >= 11 && hours < 14) || (hours >= 17 && hours < 21);
};

// Get demand multiplier based on time of day
const getDemandMultiplier = (gameHours: number) => {
  const hours = gameHours % 24; // Convert to 24-hour cycle

  // Peak hours: lunch (11-14) and dinner (17-21) - higher demand
  if ((hours >= 11 && hours < 14) || (hours >= 17 && hours < 21)) {
    return 1.5; // 50% more jobs
  }

  // Late night (22-6) - very low demand
  if (hours >= 22 || hours < 6) {
    return 0.3; // 70% fewer jobs
  }

  // Regular hours
  return 1.0;
};

// Get price multiplier for surge pricing
const getPriceMultiplier = (gameHours: number) => {
  const hours = gameHours % 24; // Convert to 24-hour cycle

  // Peak hours get surge pricing
  if ((hours >= 11 && hours < 14) || (hours >= 17 && hours < 21)) {
    return 1.3; // 30% price increase
  }

  // Late night premium
  if (hours >= 22 || hours < 6) {
    return 1.2; // 20% price increase for night orders
  }

  return 1.0;
};

// Calculate maximum courier capacity based on office workers
const calculateMaxCourierCapacity = (officeWorkers: OfficeWorker[]) => {
  if (officeWorkers.length === 0) {
    return 10; // Can hire up to 10 couriers without office workers
  }

  return (
    10 +
    officeWorkers.reduce((total, worker) => total + worker.adminCapacity, 0)
  );
};

// Calculate hourly costs for office workers
const calculateHourlyOfficeWages = (officeWorkers: OfficeWorker[]) => {
  return officeWorkers.reduce((total, worker) => total + worker.hourlyWage, 0);
};

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
  cash: 400000, // Starting with $400k seed funding
  reputation: 85,
  workerMorale: 75,
  completedJobs: 0,
  platformCommission: 20, // Platform takes 20% commission (10-30% range)
  courierPayout: 3, // $3 per delivery (player can adjust $2-4)
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
    },
  ],
  officeWorkers: [
    {
      id: "office-1",
      name: "Morgan",
      efficiency: 95,
      adminCapacity: 10,
      monthlySalary: 10000,
      hiredAt: 0,
      totalCost: 0,
    },
    {
      id: "office-2",
      name: "Taylor",
      efficiency: 98,
      adminCapacity: 10,
      monthlySalary: 10000,
      hiredAt: 0,
      totalCost: 0,
    },
  ],
  supportStaff: [],
  jobs: [],
  customers: [],
  gameStartTime: Date.now(),
  currentWeek: 1,
  gameSpeed: 1,
  investorFunding: 0,
  weeklyTarget: 100, // Target: 100 deliveries per week
  notifications: [
    generateNotification(
      "info",
      "🍕 Welcome to FoodDash!",
      "$400,000 seed funding secured! Build the fastest food delivery platform in the city. Your CEO & CTO are delivering orders while you scale. Track weekly burn rate - bankruptcy at $0 cash!"
    ),
  ],
  currentTime: 0, // Start at Hour 0 of Week 1
  gameTimeMultiplier: 10, // Faster game clock
  lastExpensePayment: 0, // Start expense tracking
  weeklyRevenue: 0,
  weeklyExpenses: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  lastJobGeneration: Date.now() - 6000, // Start 6 seconds ago to trigger immediate job generation

  hireWorker: () => {
    const state = get();

    // First office worker required after 5 couriers
    if (state.workers.length >= 5 && state.officeWorkers.length === 0) {
      toast.error(
        "🏢 Need office worker! Hire an office worker to manage more than 5 couriers.",
        {
          description: "Office workers support 10 couriers each ($10k/month)",
        }
      );
      return;
    }

    const maxCapacity = 5 + state.officeWorkers.length * 10; // 5 base + 10 per office worker

    if (state.workers.length >= maxCapacity) {
      toast.error("🏢 Capacity reached! Hire more office workers to expand.", {
        description: `Current capacity: ${maxCapacity} couriers`,
      });
      return;
    }

    const hiringCost = 500; // $500 per courier

    if (state.cash < hiringCost) {
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
      lastMoodCheck: state.currentTime,
    };

    const costMessage = `(-€${hiringCost})`;

    toast.success(`🎉 ${newWorker.name} joined your team! ${costMessage}`, {
      description: `Traits: ${traits
        .map((t) => t.name)
        .join(", ")} | Capacity: ${state.workers.length + 1}/${maxCapacity}`,
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

  hireOfficeWorker: () => {
    const state = get();
    const hiringCost = 25000; // $25k hiring cost

    if (state.cash < hiringCost) {
      toast.error("💸 Not enough cash to hire an office worker!");
      return;
    }

    const newOfficeWorker = {
      id: generateId(),
      name: OFFICE_WORKER_NAMES[
        state.officeWorkers.length % OFFICE_WORKER_NAMES.length
      ],
      efficiency: Math.floor(Math.random() * 20) + 80, // 80-100 efficiency
      adminCapacity: 10, // Always 10 couriers each
      monthlySalary: 10000, // $10k/month salary
      hiredAt: state.currentTime,
      totalCost: 0,
    };

    const newMaxCapacity = 5 + (state.officeWorkers.length + 1) * 10;

    toast.success(
      `🏢 ${newOfficeWorker.name} joined your office! (-$${hiringCost})`,
      {
        description: `Supports 10 couriers | $10k/month salary | New capacity: ${newMaxCapacity}`,
      }
    );

    set({
      ...state,
      cash: state.cash - hiringCost,
      officeWorkers: [...state.officeWorkers, newOfficeWorker],
      notifications: [
        ...state.notifications,
        generateNotification(
          "success",
          "Office Worker Hired!",
          `${newOfficeWorker.name} can manage 10 couriers. Monthly cost: $10,000. New capacity: ${newMaxCapacity}`
        ),
      ],
    });
  },

  hireSupportWorker: () => {
    const state = get();
    const hiringCost = 5000; // $5k hiring cost (cheaper than office workers)

    if (state.cash < hiringCost) {
      toast.error("💸 Not enough cash to hire customer support!");
      return;
    }

    const supportNames = [
      "Jordan",
      "Riley",
      "Avery",
      "Quinn",
      "Drew",
      "Sage",
      "Blake",
      "Rowan",
    ];

    const newSupportWorker = {
      id: generateId(),
      name: supportNames[state.supportStaff.length % supportNames.length],
      supportCapacity: 20, // Supports 20 couriers each
      monthlySalary: 2500, // $2.5k/month (less than office workers)
      hiredAt: state.currentTime,
      totalCost: 0,
    };

    set((state) => ({
      ...state,
      cash: state.cash - hiringCost,
      supportStaff: [...state.supportStaff, newSupportWorker],
    }));

    toast.success(
      `📞 ${newSupportWorker.name} joined customer support! (-$${hiringCost})`,
      {
        description: `Supports 20 couriers | $2.5k/month salary | Helps maintain reputation`,
      }
    );
  },

  generateJob: () => {
    const jobTypes: Job["type"][] = ["delivery"];
    const type = "delivery"; // All jobs are food delivery
    const urgency = Math.floor(Math.random() * 3) + 1;

    const descriptions = {
      delivery: [
        "🍕 Tony's Pizza → Apartment",
        "🍔 Burger Express → Office Building",
        "🥗 Fresh Salads → Home",
        "🍜 Noodle House → University",
        "🌮 Taco Fiesta → Business District",
        "🍣 Sushi Zone → Residential",
        "🍗 Chicken Palace → Hospital",
        "🥪 Deli Corner → School",
        "🍝 Pasta Central → Hotel",
        "🍰 Sweet Treats → Apartment Complex",
        "☕ Coffee Roasters → Office Tower",
        "🥘 Curry Express → Shopping Mall",
      ],
    };

    const pickup = generateRandomBuildingPosition();
    const dropoff = generateRandomBuildingPosition();

    // Calculate crow flies distance (Euclidean distance)
    const distance = Math.sqrt(
      Math.pow(dropoff.row - pickup.row, 2) +
        Math.pow(dropoff.col - pickup.col, 2)
    );

    const currentState = get();

    // Generate total order value (what customer pays) $50-100
    const baseOrderValue = Math.random() * 50 + 50; // $50-100 base order

    // Add distance bonus (longer distance = higher order value)
    const maxDistance = Math.sqrt(12 * 12 + 12 * 12); // ~17 units
    const normalizedDistance = Math.min(distance / maxDistance, 1); // 0-1 range
    const distanceBonus = normalizedDistance * 20; // 0-20 dollars distance bonus

    // Add urgency multiplier and time-based surge pricing
    const priceMultiplier = getPriceMultiplier(currentState.currentTime);
    const urgencyMultiplier = 1 + (urgency - 1) * 0.15; // 15% per urgency level

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
      timeCreated: currentState.currentTime, // Use game time instead of real time
      status: "pending",
      description:
        descriptions[type][
          Math.floor(Math.random() * descriptions[type].length)
        ],
      urgency,
    };

    set({
      jobs: [...currentState.jobs, newJob],
    });
  },

  assignJob: (jobId: string, workerId: string) => {
    const state = get();
    const worker = state.workers.find((w) => w.id === workerId);
    const job = state.jobs.find((j) => j.id === jobId);

    console.log(`🔗 assignJob called: job=${jobId}, worker=${workerId}`);
    console.log(`Worker found: ${!!worker}, Job found: ${!!job}`);
    if (worker)
      console.log(`Worker ${worker.name} isWorking: ${worker.isWorking}`);

    if (!worker || !job || worker.isWorking) {
      console.log(
        `❌ Assignment failed: worker=${!!worker}, job=${!!job}, isWorking=${
          worker?.isWorking
        }`
      );
      return;
    }

    console.log(`✅ Assignment successful: ${worker.name} → Job ${jobId}`);

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

  adjustPlatformCommission: (newCommission: number) => {
    const state = get();

    // Clamp commission between 20% and 45% (realistic range)
    const clampedCommission = Math.max(20, Math.min(45, newCommission));

    set({
      ...state,
      platformCommission: clampedCommission,
    });

    toast.info(`💰 Platform commission updated to ${clampedCommission}%`, {
      description: `Platform keeps ${clampedCommission}% of each order value`,
    });
  },

  adjustCourierPayout: (newPayout: number) => {
    const state = get();

    // Clamp payout between $2-4
    const clampedPayout = Math.max(2, Math.min(4, newPayout));

    set({
      ...state,
      courierPayout: clampedPayout,
    });

    toast.info(`💵 Courier payout updated: $${clampedPayout.toFixed(2)}`, {
      description: `Couriers now earn $${clampedPayout} per delivery + tips`,
    });
  },

  updateGameState: () => {
    const now = Date.now();
    const currentState = get();

    // Update game time (faster clock - 1 real second = 1 game hour)
    const newTime = (currentState.currentTime + 1) % 168; // Wrap around at 168 hours (1 week)

    // Handle job generation with demand multiplier
    const timeSinceLastJob = now - currentState.lastJobGeneration;
    const demandMultiplier = getDemandMultiplier(newTime);
    // Target 2.5 deliveries/hour per courier on average
    // Generate jobs more frequently with more couriers available
    const onlineCouriers = currentState.workers.filter(
      (w) => w.isOnline && !w.isSick
    ).length;

    // Moderate job generation - create some pressure but not overwhelming
    // Generate 1-2 jobs every 10-20 seconds
    const baseJobInterval = Math.max(10000, 20000 - onlineCouriers * 1000);
    const jobGenerationInterval = baseJobInterval / demandMultiplier;

    if (timeSinceLastJob > jobGenerationInterval) {
      // Generate fewer jobs - should create manageable pressure
      const baseJobCount = Math.random() < 0.7 ? 1 : 2; // 70% 1 job, 30% 2 jobs
      const jobsToGenerate = Math.max(
        1,
        Math.floor(baseJobCount * demandMultiplier)
      );

      for (let i = 0; i < jobsToGenerate; i++) {
        get().generateJob();
      }

      console.log(
        `🚛 Generated ${jobsToGenerate} jobs, calling instantAssignJobs...`
      );
      // Auto-assign new jobs to free couriers immediately (no delay)
      get().instantAssignJobs();

      // Update the last generation time
      set((state) => ({
        ...state,
        lastJobGeneration: now,
        currentTime: newTime,
      }));
    }

    // Check for slow jobs and apply reputation penalties (but don't remove jobs)
    const slowJobs = currentState.jobs.filter((job) => {
      const jobAge = now - job.timeCreated;
      const maxWaitTime =
        job.urgency === 3 ? 480000 : job.urgency === 2 ? 540000 : 600000; // 8min/9min/10min based on urgency
      return job.status === "pending" && jobAge > maxWaitTime;
    });

    // Apply gradual reputation penalty for slow jobs (every 30 seconds)
    const verySlowJobs = slowJobs.filter((job) => {
      const jobAge = now - job.timeCreated;
      const penaltyInterval = 30000; // Apply penalty every 30 seconds after threshold
      const maxWaitTime =
        job.urgency === 3 ? 480000 : job.urgency === 2 ? 540000 : 600000;
      const timeSincePenalty = (jobAge - maxWaitTime) % penaltyInterval;
      return timeSincePenalty < 1000; // Apply penalty in the first second of each interval
    });

    if (verySlowJobs.length > 0) {
      // Apply small reputation penalty for delayed jobs
      const reputationPenalty = verySlowJobs.length * 0.5; // -0.5 reputation per slow job every 5s

      set((state) => ({
        ...state,
        reputation: Math.max(0, state.reputation - reputationPenalty),
      }));
    }

    // Update time in state and handle wage payments
    set((state) => {
      let newCash = state.cash;
      let newLastWagePayment = state.lastWagePayment;

      // Pay office worker wages every game hour (60 minutes)
      const hoursSinceLastPayment = Math.floor(
        (newTime - state.lastWagePayment) / 60
      );

      if (hoursSinceLastPayment >= 1) {
        const hourlyWages = calculateHourlyOfficeWages(state.officeWorkers);
        const totalWages = hourlyWages * hoursSinceLastPayment;

        newCash -= totalWages;
        newLastWagePayment = newTime;

        // Update office workers' total costs
        const updatedOfficeWorkers = state.officeWorkers.map((worker) => ({
          ...worker,
          totalCost:
            worker.totalCost + worker.hourlyWage * hoursSinceLastPayment,
        }));

        if (totalWages > 0) {
          console.log(
            `💰 Paid €${totalWages.toFixed(
              2
            )} in office wages (${hoursSinceLastPayment} hour(s))`
          );
        }

        // Check for bankruptcy
        if (newCash < -20000) {
          toast.error("💀 BANKRUPTCY! You've exceeded -€20,000 debt!", {
            description: "Game Over - restart to try again",
          });
        }

        return {
          ...state,
          currentTime: newTime,
          cash: newCash,
          lastWagePayment: newLastWagePayment,
          officeWorkers: updatedOfficeWorkers,
        };
      }

      return { ...state, currentTime: newTime };
    });

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

      // Update worker statuses (online/offline, sickness, mood)
      const statusUpdatedWorkers = state.workers
        .map((worker) => {
          // Check if worker should be online based on working hours
          const currentHour = Math.floor(state.currentTime / 60);
          const startHour = Math.floor(worker.workingHours.start / 60);
          const endHour = Math.floor(worker.workingHours.end / 60);

          let shouldBeOnline = false;
          if (endHour > startHour) {
            // Normal shift (doesn't cross midnight)
            shouldBeOnline = currentHour >= startHour && currentHour < endHour;
          } else {
            // Night shift (crosses midnight)
            shouldBeOnline = currentHour >= startHour || currentHour < endHour;
          }

          // Check if worker recovers from sickness
          const isStillSick =
            worker.isSick &&
            worker.sickUntil &&
            state.currentTime < worker.sickUntil;

          // Random sickness check (once per game hour, only if online and not already sick)
          const timeSinceLastMoodCheck =
            state.currentTime - worker.lastMoodCheck;
          if (timeSinceLastMoodCheck >= 60 && shouldBeOnline && !isStillSick) {
            // Check every game hour
            let newMood = worker.mood;
            let newIsSick = worker.isSick;
            let newSickUntil = worker.sickUntil;

            // Mood affects sickness probability (lower mood = higher chance to call in sick)
            const sicknessProbability = Math.max(0, (100 - worker.mood) / 1000); // 0-10% based on mood
            if (Math.random() < sicknessProbability) {
              newIsSick = true;
              newSickUntil = state.currentTime + (Math.random() * 480 + 240); // Sick for 4-12 game hours
              toast.warning(`😷 ${worker.name} called in sick`, {
                description: `They'll be back later today`,
              });
            }

            // Quit probability based on mood (very low mood workers may quit)
            const quitProbability = Math.max(0, (30 - worker.mood) / 2000); // 0-1.5% chance if mood < 30
            if (worker.mood < 30 && Math.random() < quitProbability) {
              // Worker quits - mark for removal
              toast.error(`😤 ${worker.name} quit!`, {
                description: `Low mood led them to find another job`,
              });
              return null; // Mark for removal
            }

            // Mood fluctuation based on traits and happiness
            let moodChange = (Math.random() - 0.5) * 10; // ±5 mood change
            if (worker.traits.some((t) => t.name === "Optimist"))
              moodChange += 2;
            if (worker.traits.some((t) => t.name === "Stressed"))
              moodChange -= 3;

            newMood = Math.max(0, Math.min(100, worker.mood + moodChange));

            return {
              ...worker,
              isOnline: shouldBeOnline && !newIsSick,
              isSick: newIsSick,
              sickUntil: newSickUntil,
              mood: newMood,
              lastMoodCheck: state.currentTime,
            };
          }

          return {
            ...worker,
            isOnline: shouldBeOnline && !isStillSick,
            isSick: isStillSick,
          };
        })
        .filter((worker) => worker !== null); // Remove workers who quit

      // Move workers towards their target (enhanced AI movement)
      const updatedWorkers = statusUpdatedWorkers.map((worker) => {
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
          if (
            worker.lastPosition &&
            worker.lastPosition.row === row &&
            worker.lastPosition.col === col
          ) {
            console.log(
              `Worker stuck at ${row},${col} trying to reach ${targetRow},${targetCol}`
            );
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
              const GRID_SIZE = 12; // Match CityGrid size
              const nextInBounds =
                nextRow >= 0 &&
                nextRow < GRID_SIZE &&
                nextCol >= 0 &&
                nextCol < GRID_SIZE;

              if (nextInBounds) {
                const nextIsDestination =
                  nextRow === targetRow && nextCol === targetCol;
                const nextIsRoad = isRoadPosition(nextRow, nextCol);

                // Check if we're going to a building that's our pickup/dropoff destination
                const isDestinationBuilding =
                  worker.assignedJobId && nextIsDestination;

                if (nextIsRoad || isDestinationBuilding) {
                  // Preferred path: use roads OR enter destination building
                  newRow = nextRow;
                  newCol = nextCol;
                } else {
                  // Try to find a road path first
                  const roadOptions = [
                    { row: row - 1, col },
                    { row: row + 1, col },
                    { row, col: col - 1 },
                    { row, col: col + 1 },
                  ].filter(
                    (pos) =>
                      pos.row >= 0 &&
                      pos.row < GRID_SIZE &&
                      pos.col >= 0 &&
                      pos.col < GRID_SIZE &&
                      isRoadPosition(pos.row, pos.col)
                  );

                  if (roadOptions.length > 0) {
                    // Filter out the last position to prevent oscillation
                    const filteredOptions = worker.lastPosition
                      ? roadOptions.filter(
                          (option) =>
                            !(
                              option.row === worker.lastPosition!.row &&
                              option.col === worker.lastPosition!.col
                            )
                        )
                      : roadOptions;

                    const optionsToUse =
                      filteredOptions.length > 0
                        ? filteredOptions
                        : roadOptions;

                    // Pick the road option that gets us closest to target
                    const bestOption = optionsToUse.reduce((best, option) => {
                      const bestDistance =
                        Math.abs(best.row - targetRow) +
                        Math.abs(best.col - targetCol);
                      const optionDistance =
                        Math.abs(option.row - targetRow) +
                        Math.abs(option.col - targetCol);
                      return optionDistance < bestDistance ? option : best;
                    });
                    newRow = bestOption.row;
                    newCol = bestOption.col;
                  } else {
                    // No road options available - allow movement through buildings
                    // if we're close to destination (within 2 tiles)
                    const currentDistance =
                      Math.abs(row - targetRow) + Math.abs(col - targetCol);
                    const nextDistance =
                      Math.abs(nextRow - targetRow) +
                      Math.abs(nextCol - targetCol);

                    // Allow building traversal if we're close to destination or getting closer
                    if (
                      currentDistance <= 3 ||
                      nextDistance < currentDistance
                    ) {
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
            const job = state.jobs.find((j) => j.id === worker.assignedJobId);
            if (job) {
              console.log(
                `🚫 ${worker.name} stuck at (${row}, ${col}), trying to reach (${targetRow}, ${targetCol})`
              );
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
              console.log(
                `📦 ${worker.name} picked up job at (${targetRow}, ${targetCol}), heading to (${job.dropoff.row}, ${job.dropoff.col})`
              );
              // Instant pickup - immediately set target to dropoff and mark as carrying order
              return {
                ...worker,
                position: { row: newRow, col: newCol },
                targetPosition: job.dropoff,
                hasPickedUpOrder: true,
              };
            }
            // If reached dropoff, clear target immediately for instant completion
            if (
              job &&
              job.dropoff.row === targetRow &&
              job.dropoff.col === targetCol
            ) {
              console.log(
                `✅ ${worker.name} reached dropoff at (${targetRow}, ${targetCol})`
              );
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

        // If worker is idle, occasionally move them to a random road location and recover stamina
        if (!worker.isWorking && Math.random() < 0.05) {
          // Reduced frequency
          const staminaRecovery = Math.floor(Math.random() * 3 + 1); // Recover 1-4 stamina when idle (integer)
          const newStamina = Math.min(100, worker.stamina + staminaRecovery);

          return {
            ...worker,
            stamina: newStamina,
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

            console.log(
              `🎉 ${worker.name} completed delivery at (${job.dropoff.row}, ${job.dropoff.col})!`
            );

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
          // The completedJob.payment is the total order value (what customer pays)
          const totalOrderValue = completedJob.payment || 0;

          // Platform takes commission from total order value
          const platformRevenue =
            (totalOrderValue * state.platformCommission) / 100;

          // Courier gets fixed payout per delivery (player-set $2-4)
          const courierPayment = state.courierPayout;

          // Calculate mood-based tip ($1-5 based on happiness levels)
          let tipAmount = 0;
          if (worker.happiness >= 80) {
            tipAmount = Math.random() * 2 + 3; // $3-5 for very happy workers
          } else if (worker.happiness >= 60) {
            tipAmount = Math.random() * 2 + 1; // $1-3 for moderately happy workers
          } else if (worker.happiness >= 40) {
            tipAmount = Math.random() * 1 + 0.5; // $0.5-1.5 for unhappy workers
          }
          // Workers with happiness < 40 get no tips

          // Final courier earnings = base payment + tips
          const courierEarnings = courierPayment + tipAmount;

          // Add platform revenue to cash
          state.cash += platformRevenue;

          // Adjust happiness based on courier payment quality
          let happinessChange = 0;
          if (courierPayment >= 3.5)
            happinessChange = 2; // High payment = happy
          else if (courierPayment >= 2.5)
            happinessChange = 0; // Medium payment = neutral
          else happinessChange = -3; // Low payment = unhappy

          // Apply trait effects
          if (worker.traits.some((t) => t.name === "Burnout-prone")) {
            happinessChange -= 2;
          }
          if (worker.traits.some((t) => t.name === "Optimist")) {
            happinessChange += 1;
          }

          // Stamina affects happiness (low stamina = unhappy workers)
          let staminaEffect = 0;
          if (worker.stamina < 30) {
            staminaEffect = -2; // Very tired workers get unhappy
          } else if (worker.stamina < 50) {
            staminaEffect = -1; // Tired workers get slightly unhappy
          }

          const newHappiness = Math.max(
            0,
            Math.min(100, worker.happiness + happinessChange + staminaEffect)
          );

          // Decrease stamina after completing a job
          const staminaDecrease = Math.floor(Math.random() * 10 + 5); // Lose 5-15 stamina per job (integer)
          const newStamina = Math.max(0, worker.stamina - staminaDecrease);

          return {
            ...worker,
            isWorking: false,
            assignedJobId: undefined,
            targetPosition: undefined,
            hasPickedUpOrder: false, // Reset pickup status
            totalEarned: worker.totalEarned + courierEarnings,
            jobsCompleted: worker.jobsCompleted + 1,
            happiness: newHappiness,
            stamina: newStamina,
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
              .reduce((sum, job) => {
                const totalOrderValue = job.payment || 0;
                const platformRevenue =
                  (totalOrderValue * state.platformCommission) / 100;
                return sum + platformRevenue;
              }, 0)
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

  addNotification: (notification) => {
    const id = notification.id || `notification-${Date.now()}-${Math.random()}`;
    set((state) => ({
      ...state,
      notifications: [...state.notifications, { ...notification, id }],
    }));
  },

  getJobUrgencyStatus: (job) => {
    const state = get();
    const currentGameTime = state.currentTime;
    const jobAge = Math.max(0, currentGameTime - job.timeCreated); // Ensure non-negative
    const maxWaitTime = 10; // 10 minutes for all jobs
    const timeElapsed = jobAge;
    const isOverdue = jobAge > maxWaitTime;

    let severity: "normal" | "warning" | "critical" = "normal";
    if (jobAge > maxWaitTime) {
      severity = "critical";
    } else if (jobAge > maxWaitTime * 0.7) {
      severity = "warning";
    }

    return { timeElapsed, isOverdue, severity };
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
    const availableWorkers = state.workers.filter(
      (w) => !w.isWorking && w.isOnline && !w.isSick
    );
    // Only assign jobs that have been pending for at least 2 seconds (so they're visible first)
    const pendingJobs = state.jobs.filter(
      (j) => j.status === "pending" && now - j.timeCreated > 2000
    );

    console.log(
      `🔄 AutoAssign: ${state.workers.length} total workers, ${availableWorkers.length} available, ${pendingJobs.length} old pending jobs`
    );
    if (state.workers.length > 0) {
      state.workers.forEach((w) => {
        console.log(
          `  Worker ${w.name}: working=${w.isWorking}, online=${w.isOnline}, sick=${w.isSick}`
        );
      });
    }

    if (availableWorkers.length === 0 || pendingJobs.length === 0) return;

    // Sort jobs by urgency (highest first) and payment (highest first)
    const sortedJobs = pendingJobs.sort((a, b) => {
      if (a.urgency !== b.urgency) return b.urgency - a.urgency;
      return b.payment - a.payment;
    });

    // Calculate distance between two points (Manhattan distance for grid-based movement)
    const calculateDistance = (
      pos1: { row: number; col: number },
      pos2: { row: number; col: number }
    ) => {
      return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
    };

    // Auto-assign jobs to closest available workers
    const assignments: Array<{ jobId: string; workerId: string }> = [];
    const usedWorkers = new Set<string>();

    for (const job of sortedJobs) {
      if (usedWorkers.size >= availableWorkers.length) break;

      // Find closest available worker to this job's pickup location
      const availableWorkersForJob = availableWorkers.filter(
        (w) => !usedWorkers.has(w.id)
      );

      if (availableWorkersForJob.length === 0) break;

      const closestWorker = availableWorkersForJob.reduce((closest, worker) => {
        const workerDistance = calculateDistance(worker.position, job.pickup);
        const closestDistance = calculateDistance(closest.position, job.pickup);

        // If distances are equal, prefer happier worker for better service
        if (workerDistance === closestDistance) {
          return worker.happiness > closest.happiness ? worker : closest;
        }

        return workerDistance < closestDistance ? worker : closest;
      });

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

    // Simple check: find workers that are not working
    const availableWorkers = state.workers.filter(
      (w) => !w.isWorking && !w.assignedJobId
    );

    // Find jobs that need assignment
    const pendingJobs = state.jobs.filter((j) => j.status === "pending");

    console.log(`🔍 ASSIGNMENT CHECK:`);
    console.log(`- Total workers: ${state.workers.length}`);
    console.log(`- Available workers: ${availableWorkers.length}`);
    console.log(`- Pending jobs: ${pendingJobs.length}`);
    
    // Debug all workers
    state.workers.forEach((w, i) => {
      console.log(`  Worker ${i}: ${w.name} - isWorking=${w.isWorking}, assignedJobId=${w.assignedJobId}, isOnline=${w.isOnline}, isSick=${w.isSick}`);
    });

    if (availableWorkers.length > 0) {
      availableWorkers.forEach((w) => {
        console.log(
          `  ✅ Available: ${w.name} (working=${w.isWorking}, assigned=${w.assignedJobId})`
        );
      });
    }

    if (state.workers.length > availableWorkers.length) {
      state.workers
        .filter((w) => w.isWorking || w.assignedJobId)
        .forEach((w) => {
          console.log(
            `  ❌ Busy: ${w.name} (working=${w.isWorking}, assigned=${w.assignedJobId})`
          );
        });
    }

    if (availableWorkers.length === 0 || pendingJobs.length === 0) {
      console.log(`❌ Cannot assign: need workers AND jobs`);
      return;
    }

    // Sort jobs by urgency (highest first) and payment (highest first)
    const sortedJobs = pendingJobs.sort((a, b) => {
      if (a.urgency !== b.urgency) return b.urgency - a.urgency;
      return b.payment - a.payment;
    });

    // Calculate distance between two points (Manhattan distance for grid-based movement)
    const calculateDistance = (
      pos1: { row: number; col: number },
      pos2: { row: number; col: number }
    ) => {
      return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
    };

    // Auto-assign jobs to closest available workers
    const assignments: Array<{ jobId: string; workerId: string }> = [];
    const usedWorkers = new Set<string>();

    for (const job of sortedJobs) {
      const eligibleWorkers = availableWorkers.filter(
        (w) => !usedWorkers.has(w.id)
      );
      console.log(
        `🎯 Job ${job.id}: ${eligibleWorkers.length} eligible workers`
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

      console.log(
        `📍 Assigning job ${job.id} to ${closestWorker.name} (distance: ${minDistance})`
      );
      assignments.push({ jobId: job.id, workerId: closestWorker.id });
      usedWorkers.add(closestWorker.id);
    }

    if (assignments.length > 0) {
      console.log(
        `✅ Making ${assignments.length} instant assignments:`,
        assignments
      );
      assignments.forEach(({ jobId, workerId }) => {
        get().assignJob(jobId, workerId);
      });
    } else {
      console.log("❌ No instant assignments made");
    }
  },

  buyMarketingBoost: () => {
    const state = get();
    const totalStaff =
      state.workers.length +
      state.officeWorkers.length +
      state.supportStaff.length;

    // Cost scales aggressively with team size: $5k base + $2k per staff member
    const baseCost = 5000;
    const perStaffCost = 2000;
    const totalCost = baseCost + totalStaff * perStaffCost;

    if (state.cash < totalCost) {
      toast.error(`💸 Not enough cash! Need $${totalCost.toLocaleString()}`, {
        description: `You have $${state.cash.toLocaleString()}`,
      });
      return;
    }

    // Deduct cost and generate 3-5 immediate jobs
    const jobsToGenerate = Math.floor(Math.random() * 3) + 3; // 3-5 jobs

    set((state) => ({
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
        description: `Cost: $${totalCost.toLocaleString()} | Team size: ${totalStaff}`,
      }
    );
  },
}));
