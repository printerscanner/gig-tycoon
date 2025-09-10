import { create } from 'zustand';
import type { GameState, Worker, Job, Notification, WorkerTrait } from '@/types';

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
  adjustWorkerWage: (workerId: string, newWage: number) => void;
  dismissNotification: (notificationId: string) => void;
  acceptInvestorDeal: () => void;
  autoAssignJobs: () => void; // New: auto-assign jobs to available workers
  lastJobGeneration: number; // Track when last job was generated
}

const WORKER_NAMES = ['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Morgan'];

const WORKER_TRAITS: WorkerTrait[] = [
  { name: 'Reliable', description: 'Always on time', effect: 'positive' },
  { name: 'Hustler', description: 'Works extra fast', effect: 'positive' },
  { name: 'Burnout-prone', description: 'Happiness drops quickly', effect: 'negative' },
  { name: 'Lazy', description: 'Moves slowly', effect: 'negative' },
  { name: 'Stressed', description: 'Makes more mistakes', effect: 'negative' },
  { name: 'Optimist', description: 'Stays happy longer', effect: 'positive' },
];

const SARCASTIC_MESSAGES = [
  "Guess I'll eat instant noodles again lol",
  "Living the dream on minimum wage! 🙃",
  "Another day, another dollar... wait, make that 50 cents",
  "My landlord will understand, right?",
  "Time to update my LinkedIn... again",
];

const generateRandomPosition = () => ({
  row: Math.floor(Math.random() * 8),
  col: Math.floor(Math.random() * 8),
});

const generateId = () => Math.random().toString(36).substr(2, 9);

const generateNotification = (type: Notification['type'], title: string, message: string): Notification => ({
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
  workers: [],
  jobs: [],
  customers: [],
  gameStartTime: Date.now(),
  currentDay: 1,
  gameSpeed: 1,
  investorFunding: 0,
  monthlyTarget: 50, // First investor goal: 50 deliveries
  notifications: [
    generateNotification('info', 'Welcome to Gig Tycoon!', 'Workers will automatically take jobs when available. Hire more workers to handle the demand!'),
  ],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  lastJobGeneration: Date.now(),

  hireWorker: () => {
    const state = get();
    const hiringCost = state.workers.length === 0 ? 0 : 200; // First 2 workers free, then $200
    
    if (state.cash < hiringCost && state.workers.length >= 2) return;

    const traits = [WORKER_TRAITS[Math.floor(Math.random() * WORKER_TRAITS.length)]];
    
    const newWorker: Worker = {
      id: generateId(),
      name: WORKER_NAMES[state.workers.length % WORKER_NAMES.length],
      stamina: Math.floor(Math.random() * 30) + 60, // 60-90
      happiness: Math.floor(Math.random() * 20) + 70, // 70-90
      wage: 8, // Starting wage $8 per job
      position: generateRandomPosition(),
      isWorking: false,
      totalEarned: 0,
      jobsCompleted: 0,
      traits,
    };

    set({
      cash: state.cash - hiringCost,
      workers: [...state.workers, newWorker],
      notifications: [
        ...state.notifications,
        generateNotification('success', 'New Worker Hired!', `${newWorker.name} joined your team. Traits: ${traits.map(t => t.name).join(', ')}`),
      ],
    });
  },

  generateJob: () => {
    const jobTypes: Job['type'][] = ['delivery', 'rideshare', 'labor'];
    const type = jobTypes[Math.floor(Math.random() * jobTypes.length)];
    const urgency = Math.floor(Math.random() * 3) + 1;
    
    const descriptions = {
      delivery: ['🥡 Pizza Palace → Home', '🍔 Burger Barn → Office', '🥗 Salad Station → Apartment'],
      rideshare: ['🏠 Home → Airport', '🏢 Office → Mall', '🎭 Theater → Hotel'],
      labor: ['📦 Moving boxes', '🔧 Furniture assembly', '🧹 Office cleaning'],
    };

    const newJob: Job = {
      id: generateId(),
      type,
      pickup: generateRandomPosition(),
      dropoff: generateRandomPosition(),
      payment: urgency * 5 + Math.floor(Math.random() * 10) + 10, // $15-35 based on urgency
      timeCreated: Date.now(),
      status: 'pending',
      description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
      urgency,
    };

    set(state => ({
      jobs: [...state.jobs, newJob],
    }));
  },

  assignJob: (jobId: string, workerId: string) => {
    const state = get();
    const worker = state.workers.find(w => w.id === workerId);
    const job = state.jobs.find(j => j.id === jobId);
    
    if (!worker || !job || worker.isWorking) return;

    set({
      jobs: state.jobs.map(j =>
        j.id === jobId ? { ...j, status: 'assigned' as const, assignedWorkerId: workerId } : j
      ),
      workers: state.workers.map(w =>
        w.id === workerId ? { 
          ...w, 
          isWorking: true, 
          assignedJobId: jobId,
          targetPosition: job.pickup 
        } : w
      ),
    });
  },

  selectWorker: (workerId: string) => {
    set(state => ({
      selectedWorkerId: state.selectedWorkerId === workerId ? undefined : workerId,
    }));
  },

  moveWorker: (workerId: string, targetRow: number, targetCol: number) => {
    set(state => ({
      workers: state.workers.map(worker =>
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

  adjustWorkerWage: (workerId: string, newWage: number) => {
    const state = get();
    const worker = state.workers.find(w => w.id === workerId);
    if (!worker) return;

    const oldWage = worker.wage;
    const wageDiff = newWage - oldWage;
    
    set({
      workers: state.workers.map(w =>
        w.id === workerId ? { ...w, wage: newWage } : w
      ),
      notifications: wageDiff < 0 ? [
        ...state.notifications,
        generateNotification('warning', `${worker.name} is not happy`, 
          SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)]
        ),
      ] : state.notifications,
    });
  },

  updateGameState: () => {
    set(state => {
      const now = Date.now();
      
      // Auto-generate jobs every 5-15 seconds based on demand
      const timeSinceLastJob = now - state.lastJobGeneration;
      const jobGenerationInterval = Math.max(3000, 8000 - (state.completedJobs * 100)); // Faster as you progress
      
      if (timeSinceLastJob > jobGenerationInterval) {
        // Generate 1-3 jobs at once
        const jobsToGenerate = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < jobsToGenerate; i++) {
          get().generateJob();
        }
        set({ lastJobGeneration: now });
      }

      // Auto-assign jobs to available workers
      get().autoAssignJobs();

      // Move workers towards their target (enhanced AI movement)
      const updatedWorkers = state.workers.map(worker => {
        if (worker.assignedJobId && !worker.targetPosition) {
          // If worker has a job but no target, set target to pickup location
          const assignedJob = state.jobs.find(j => j.id === worker.assignedJobId);
          if (assignedJob) {
            return { ...worker, targetPosition: assignedJob.pickup };
          }
        }

        if (worker.targetPosition) {
          const { row, col } = worker.position;
          const { row: targetRow, col: targetCol } = worker.targetPosition;
          
          let newRow = row;
          let newCol = col;
          
          // Apply trait effects to movement speed
          const speed = worker.traits.some(t => t.name === 'Hustler') ? 2 : 
                       worker.traits.some(t => t.name === 'Lazy') ? 0.5 : 1;
          
          if (Math.random() < speed) {
            // Smart pathfinding - move towards target
            if (row < targetRow) newRow++;
            else if (row > targetRow) newRow--;
            
            if (col < targetCol) newCol++;
            else if (col > targetCol) newCol--;
          }
          
          const reachedTarget = newRow === targetRow && newCol === targetCol;
          
          // If reached pickup, set target to dropoff
          if (reachedTarget && worker.assignedJobId) {
            const job = state.jobs.find(j => j.id === worker.assignedJobId);
            if (job && job.pickup.row === targetRow && job.pickup.col === targetCol) {
              return {
                ...worker,
                position: { row: newRow, col: newCol },
                targetPosition: job.dropoff,
              };
            }
          }
          
          return {
            ...worker,
            position: { row: newRow, col: newCol },
            targetPosition: reachedTarget ? undefined : worker.targetPosition,
          };
        }
        
        // If worker is idle, occasionally move them to a random location
        if (!worker.isWorking && Math.random() < 0.1) {
          return {
            ...worker,
            targetPosition: generateRandomPosition(),
          };
        }
        
        return worker;
      });

      // Handle job completion and ratings
      const updatedJobs = state.jobs.map(job => {
        if (job.status === 'assigned' && job.assignedWorkerId) {
          const worker = updatedWorkers.find(w => w.id === job.assignedWorkerId);
          if (worker && 
              worker.position.row === job.dropoff.row && 
              worker.position.col === job.dropoff.col &&
              !worker.targetPosition) {
            
            // Calculate customer rating based on worker happiness and job urgency
            const baseRating = Math.min(5, Math.max(1, 
              Math.floor((worker.happiness / 20) + (6 - job.urgency))
            ));
            
            const rating = worker.traits.some(t => t.name === 'Stressed') ? 
              Math.max(1, baseRating - 1) : baseRating;
            
            return { ...job, status: 'completed' as const, customerRating: rating };
          }
        }
        return job;
      });

      // Update workers who completed jobs
      const finalWorkers = updatedWorkers.map(worker => {
        const completedJob = updatedJobs.find(job => 
          job.assignedWorkerId === worker.id && 
          job.status === 'completed' && 
          state.jobs.find(j => j.id === job.id)?.status === 'assigned'
        );
        
        if (completedJob) {
          // Adjust happiness based on wage vs job payment
          const wageRatio = worker.wage / (completedJob.payment || 1);
          let happinessChange = 0;
          
          if (wageRatio > 0.7) happinessChange = 2; // Good pay = happy
          else if (wageRatio > 0.4) happinessChange = 0; // OK pay = neutral
          else happinessChange = -3; // Bad pay = unhappy
          
          // Apply trait effects
          if (worker.traits.some(t => t.name === 'Burnout-prone')) {
            happinessChange -= 2;
          }
          if (worker.traits.some(t => t.name === 'Optimist')) {
            happinessChange += 1;
          }
          
          const newHappiness = Math.max(0, Math.min(100, worker.happiness + happinessChange));
          
          return {
            ...worker,
            isWorking: false,
            assignedJobId: undefined,
            targetPosition: undefined,
            totalEarned: worker.totalEarned + worker.wage,
            jobsCompleted: worker.jobsCompleted + 1,
            happiness: newHappiness,
          };
        }
        return worker;
      });

      const newCompletedJobs = updatedJobs.filter(job => job.status === 'completed').length;
      const completedThisCycle = newCompletedJobs - state.completedJobs;
      const earnedThisCycle = completedThisCycle > 0 ? 
        updatedJobs.filter(job => job.status === 'completed')
          .slice(-completedThisCycle)
          .reduce((sum, job) => sum + (job.payment || 0) - (finalWorkers.find(w => w.id === job.assignedWorkerId)?.wage || 0), 0) : 0;

      // Calculate new reputation from recent ratings
      const recentRatings = updatedJobs
        .filter(job => job.customerRating)
        .slice(-10)
        .map(job => job.customerRating!);
      
      const newReputation = recentRatings.length > 0 ? 
        (recentRatings.reduce((sum, rating) => sum + rating, 0) / recentRatings.length) * 20 : state.reputation;

      // Calculate worker morale
      const newWorkerMorale = finalWorkers.length > 0 ?
        finalWorkers.reduce((sum, worker) => sum + worker.happiness, 0) / finalWorkers.length : 100;

      // Check for investor milestone
      const newNotifications = [...state.notifications];
      if (newCompletedJobs >= 10 && state.investorFunding === 0) {
        newNotifications.push(
          generateNotification('investor', 'Investor Interest!', 
            'We like your growth. Here\'s $20,000. Expand deliveries to 50 per day by end of month!')
        );
      }

      // Add notifications for worker happiness issues
      const unhappyWorkers = finalWorkers.filter(w => w.happiness < 30);
      if (unhappyWorkers.length > 0 && Math.random() < 0.1) {
        const worker = unhappyWorkers[Math.floor(Math.random() * unhappyWorkers.length)];
        newNotifications.push(
          generateNotification('warning', `${worker.name} is struggling`, 
            SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)]
          )
        );
      }

      return {
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
    set(state => ({
      cash: state.cash + 20000,
      investorFunding: 20000,
      monthlyTarget: 50,
      notifications: [
        ...state.notifications.filter(n => n.type !== 'investor'),
        generateNotification('success', 'Funding Secured!', 'You now have $20,000 to expand. Target: 50 deliveries this month!'),
      ],
    }));
  },

  dismissNotification: (notificationId: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== notificationId),
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
    const availableWorkers = state.workers.filter(w => !w.isWorking);
    const pendingJobs = state.jobs.filter(j => j.status === 'pending');
    
    if (availableWorkers.length === 0 || pendingJobs.length === 0) return;

    // Sort jobs by urgency (highest first) and payment (highest first)
    const sortedJobs = pendingJobs.sort((a, b) => {
      if (a.urgency !== b.urgency) return b.urgency - a.urgency;
      return b.payment - a.payment;
    });

    // Sort workers by happiness (happiest first for better service)
    const sortedWorkers = availableWorkers.sort((a, b) => b.happiness - a.happiness);

    // Auto-assign jobs to workers
    const assignments: Array<{jobId: string, workerId: string}> = [];
    for (let i = 0; i < Math.min(sortedJobs.length, sortedWorkers.length); i++) {
      assignments.push({
        jobId: sortedJobs[i].id,
        workerId: sortedWorkers[i].id
      });
    }

    if (assignments.length > 0) {
      assignments.forEach(({ jobId, workerId }) => {
        get().assignJob(jobId, workerId);
      });
    }
  },
}));
