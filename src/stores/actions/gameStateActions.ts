import { toast } from "sonner";
import type { Worker, GameState } from "@/types";
import {
  EXPENSE_CONFIG,
  REPUTATION_CONFIG,
  TIP_CONFIG,
  INVESTOR_CONFIG,
} from "../constants/gameConstants";
import { SARCASTIC_MESSAGES } from "../constants/gameData";
import {
  getDemandMultiplier,
  calculateDailyOfficeWages,
  calculateMonthlyExpenses,
  isRoadPosition,
} from "../utils/gameUtils";
import { generateNotification } from "../utils/notificationUtils";
import { TIME_CONFIG } from "../constants/gameConstants";
import { isNewDay, isNewMonth } from "../utils/timeUtils";
import { createInitialState } from "../gameState/initialState";

type SetState = (
  partial: Partial<GameState> | ((state: GameState) => Partial<GameState>)
) => void;
type GetState = () => GameState & {
  generateJob: () => void;
  instantAssignJobs: () => void;
  autoAssignJobs: () => void;
  moveWorker: (workerId: string, targetRow: number, targetCol: number) => void;
  lastJobGeneration: number;
};

export const createGameStateActions = (set: SetState, get: GetState) => ({
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

    // Clamp payout between €2-4
    const clampedPayout = Math.max(2, Math.min(4, newPayout));

    set({
      ...state,
      courierPayout: clampedPayout,
    });

    toast.info(`💵 Courier payout updated: €${clampedPayout.toFixed(2)}`, {
      description: `Couriers earn €${clampedPayout} per delivery + tips (€0.5-5 based on performance, <50% chance)`,
    });
  },

  acceptInvestorDeal: () => {
    set((state: GameState) => ({
      ...state,
      cash: state.cash + INVESTOR_CONFIG.FIRST_FUNDING,
      investorFunding: INVESTOR_CONFIG.FIRST_FUNDING,
      notifications: [
        ...state.notifications.filter((n) => n.type !== "investor"),
        generateNotification(
          "success",
          "Funding Secured!",
          `You now have €${INVESTOR_CONFIG.FIRST_FUNDING.toLocaleString()} to expand. Target: ${
            INVESTOR_CONFIG.MONTHLY_TARGET
          } deliveries this month!`
        ),
      ],
    }));
  },

  dismissNotification: (notificationId: string) => {
    set((state: GameState) => ({
      ...state,
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    }));
  },

  addNotification: (
    notification: Omit<import("@/types").Notification, "id"> & { id?: string }
  ) => {
    const id = notification.id || `notification-${Date.now()}-${Math.random()}`;
    set((state: GameState) => ({
      ...state,
      notifications: [...state.notifications, { ...notification, id }],
    }));
  },

  resetGame: () => {
    set({
      ...createInitialState(),
      realStartTime: Date.now(),
      lastJobGeneration: Date.now(),
    });
  },

  updateGameState: () => {
    const now = Date.now();
    const currentState = get();

    // Update game time using simplified day-based system
    const newGameDays =
      currentState.gameDays + TIME_CONFIG.DAYS_PER_REAL_SECOND;

    // Check if we need to deduct monthly expenses (when a new month starts)
    const hasNewMonthStarted = isNewMonth(
      newGameDays,
      currentState.lastExpenseCheck
    );

    if (hasNewMonthStarted) {
      // Calculate monthly expenses
      const monthlyExpenses = calculateMonthlyExpenses(
        currentState.workers,
        currentState.officeWorkers,
        currentState.supportStaff
      );

      if (monthlyExpenses.total > 0) {
        set((state: GameState) => ({
          ...state,
          cash: state.cash - monthlyExpenses.total,
          weeklyExpenses: state.weeklyExpenses + monthlyExpenses.total,
          lastExpenseCheck: newGameDays,
        }));

        // Show notification for monthly expenses
        toast.info(
          `💸 Monthly expenses: -€${monthlyExpenses.total.toLocaleString()}`,
          {
            description: `Salaries: €${(
              monthlyExpenses.officeWorkerSalaries +
              monthlyExpenses.supportStaffSalaries
            ).toLocaleString()}, Rent: €${monthlyExpenses.rentAndLegal.toLocaleString()}, Cloud: €${monthlyExpenses.cloudCosts.toLocaleString()}`,
          }
        );

        // Show warning if cash is getting low
        const newCash = currentState.cash - monthlyExpenses.total;
        if (newCash < 20000 && newCash > 0) {
          toast.warning(`⚠️ Cash running low: €${newCash.toLocaleString()}`, {
            description: "Consider reducing expenses or increasing revenue",
          });
        } else if (newCash <= EXPENSE_CONFIG.BANKRUPTCY_THRESHOLD) {
          toast.error(`💀 BANKRUPTCY! Cash: €${newCash.toLocaleString()}`, {
            description: "Game Over - you've run out of money!",
          });
        }
      }
    }

    // Handle job generation with demand multiplier
    const timeSinceLastJob = now - currentState.lastJobGeneration;
    const demandMultiplier = getDemandMultiplier(newGameDays);
    // Target 2.5 deliveries/hour per courier on average
    // Generate jobs more frequently with more couriers available
    const onlineCouriers = currentState.workers.filter(
      (w: Worker) => w.isOnline && !w.isSick
    ).length;

    // Moderate job generation - ensure it doesn't stall overnight
    // Generate 1-2 jobs every ~5-15 seconds, faster with more couriers
    const effectiveDemand = Math.max(0.6, demandMultiplier); // never below 0.6
    const baseJobInterval = Math.max(5000, 15000 - onlineCouriers * 1000);
    const jobGenerationInterval = baseJobInterval / effectiveDemand;

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

      // Auto-assign new jobs to free couriers immediately (no delay)
      get().instantAssignJobs();

      // Update the last generation time
      set((state: GameState) => ({
        ...state,
        lastJobGeneration: now,
        gameDays: newGameDays,
      }));
    } else {
      // Safety: if there are no active jobs for a while, create one
      const activeJobsCount = currentState.jobs.filter(
        (j) => j.status === "pending" || j.status === "assigned"
      ).length;
      if (activeJobsCount === 0 && timeSinceLastJob > 6000) {
        get().generateJob();
        get().instantAssignJobs();
        set((state: GameState) => ({
          ...state,
          lastJobGeneration: now,
          gameDays: newGameDays,
        }));
      }
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
      const penaltyInterval = REPUTATION_CONFIG.PENALTY_INTERVAL;
      const maxWaitTime =
        job.urgency === 3 ? 480000 : job.urgency === 2 ? 540000 : 600000;
      const timeSincePenalty = (jobAge - maxWaitTime) % penaltyInterval;
      return timeSincePenalty < 1000; // Apply penalty in the first second of each interval
    });

    if (verySlowJobs.length > 0) {
      // Apply strong reputation penalty for late orders - this should motivate hiring more couriers!
      const reputationPenalty =
        verySlowJobs.length * REPUTATION_CONFIG.LATE_ORDER_PENALTY;

      set((state: GameState) => ({
        ...state,
        reputation: Math.max(0, state.reputation - reputationPenalty),
      }));

      // Show warning when reputation is dropping fast
      if (verySlowJobs.length >= 3) {
        toast.error(
          `📉 Reputation dropping! ${verySlowJobs.length} late orders`,
          {
            description:
              "Hire more couriers to handle demand and maintain reputation",
          }
        );
      }
    }

    // Update time in state and handle wage payments
    set((state: GameState) => {
      let newCash = state.cash;
      let newLastWageCheck = state.lastWageCheck;

      // Pay office worker wages every game day
      const hasNewDayPassedForWages = isNewDay(
        newGameDays,
        state.lastWageCheck
      );

      if (hasNewDayPassedForWages) {
        const daysSinceLastPayment = Math.floor(
          newGameDays - state.lastWageCheck
        );
        const dailyWages = calculateDailyOfficeWages(state.officeWorkers);
        const totalWages = dailyWages * daysSinceLastPayment;

        newCash -= totalWages;
        newLastWageCheck = newGameDays;

        // Update office workers' total costs
        const daysPerMonth = 30; // Approximate days per month
        const updatedOfficeWorkers = state.officeWorkers.map((worker) => ({
          ...worker,
          totalCost:
            worker.totalCost +
            (worker.monthlySalary / daysPerMonth) * daysSinceLastPayment,
        }));

        // Check for bankruptcy
        if (newCash < EXPENSE_CONFIG.BANKRUPTCY_THRESHOLD) {
          toast.error("💀 BANKRUPTCY! You've exceeded €20,000 debt!", {
            description: "Game Over - restart to try again",
          });
        }

        return {
          gameDays: newGameDays,
          cash: newCash,
          lastWageCheck: newLastWageCheck,
          officeWorkers: updatedOfficeWorkers,
        };
      }

      return { gameDays: newGameDays };
    });

    // Auto-assignment logic (every 3 seconds)
    if (
      Math.floor(timeSinceLastJob / 1000) % 3 === 0 &&
      timeSinceLastJob % 1000 < 100
    ) {
      get().autoAssignJobs();
    }

    // Now handle the main game state update with worker movement and job completion
    set((state: GameState) => {
      const now = Date.now();

      // Update worker statuses (online/offline, sickness, mood)
      const statusUpdatedWorkers = state.workers
        .map((worker: Worker) => {
          // Check if worker should be online based on working hours
          const currentHour = Math.floor(newGameDays % 24);
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
          const isStillSick = !!(
            worker.isSick &&
            worker.sickUntil !== undefined &&
            newGameDays < worker.sickUntil
          );

          // Random sickness check (once per game hour, only if online and not already sick)
          const timeSinceLastMoodCheck = newGameDays - worker.lastMoodCheck;
          if (timeSinceLastMoodCheck >= 1 && shouldBeOnline && !isStillSick) {
            // Check every game hour
            let newMood = worker.mood;
            let newIsSick = worker.isSick;
            let newSickUntil = worker.sickUntil;

            // Mood affects sickness probability (lower mood = higher chance to call in sick)
            const sicknessProbability = Math.max(0, (100 - worker.mood) / 1000); // 0-10% based on mood
            if (Math.random() < sicknessProbability) {
              newIsSick = true;
              newSickUntil = newGameDays + (Math.random() * 8 + 4); // Sick for 4-12 game hours
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
              lastMoodCheck: newGameDays,
              totalHoursWorked:
                worker.totalHoursWorked +
                (shouldBeOnline && !newIsSick
                  ? TIME_CONFIG.DAYS_PER_REAL_SECOND * 24
                  : 0),
            };
          }

          return {
            ...worker,
            isOnline: shouldBeOnline && !isStillSick,
            isSick: isStillSick,
            totalHoursWorked:
              worker.totalHoursWorked +
              (shouldBeOnline && !isStillSick
                ? TIME_CONFIG.DAYS_PER_REAL_SECOND * 24
                : 0),
          };
        })
        .filter((worker: Worker | null) => worker !== null); // Remove workers who quit

      // Move workers towards their target (enhanced AI movement)
      const updatedWorkers = statusUpdatedWorkers.map((worker: Worker) => {
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

          // If reached pickup, instantly move to dropoff
          if (reachedTarget && worker.assignedJobId) {
            const job = state.jobs.find((j) => j.id === worker.assignedJobId);
            if (
              job &&
              job.pickup.row === targetRow &&
              job.pickup.col === targetCol
            ) {
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
            (w: Worker) => w.id === job.assignedWorkerId
          );
          if (
            worker &&
            worker.position.row === job.dropoff.row &&
            worker.position.col === job.dropoff.col
          ) {
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
      const finalWorkers = updatedWorkers.map((worker: Worker) => {
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

          // Courier gets fixed payout per delivery (player-set €2-4)
          const courierPayment = state.courierPayout;

          // Calculate tip based on stamina and happiness (max €5, <50% chance)
          let tipAmount = 0;

          // Base tip chance - less than half the time
          const baseTipChance = TIP_CONFIG.BASE_TIP_CHANCE;

          // Performance score combines stamina and happiness (0-100 each)
          const performanceScore = (worker.stamina + worker.happiness) / 2;

          // Adjust tip chance based on performance (20%-60% range)
          const adjustedTipChance =
            baseTipChance + (performanceScore - 50) * 0.004; // +/-20% based on performance
          const finalTipChance = Math.max(
            TIP_CONFIG.TIP_CHANCE_RANGE[0],
            Math.min(TIP_CONFIG.TIP_CHANCE_RANGE[1], adjustedTipChance)
          );

          if (Math.random() < finalTipChance) {
            // Tip amount based on performance score (€0.5 - €5.0)
            const maxTip = TIP_CONFIG.MAX_TIP_AMOUNT;
            if (performanceScore >= 85) {
              tipAmount = Math.random() * 1.5 + 3.5; // €3.5-5.0 for excellent performance
            } else if (performanceScore >= 70) {
              tipAmount = Math.random() * 1.5 + 2.0; // €2.0-3.5 for good performance
            } else if (performanceScore >= 50) {
              tipAmount = Math.random() * 1.0 + 1.0; // €1.0-2.0 for average performance
            } else {
              tipAmount = Math.random() * 1.0 + 0.5; // €0.5-1.5 for poor performance
            }

            // Ensure tip doesn't exceed maximum
            tipAmount = Math.min(maxTip, tipAmount);
          }

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
              .reduce((sum: number, job) => {
                const totalOrderValue = job.payment || 0;
                const platformRevenue =
                  (totalOrderValue * state.platformCommission) / 100;
                return sum + platformRevenue;
              }, 0)
          : 0;

      // Calculate new reputation from recent ratings (slow growth, fast decline)
      const recentRatings = updatedJobs
        .filter((job) => job.customerRating)
        .slice(-20) // Look at more recent jobs for smoother calculation
        .map((job) => job.customerRating!);

      let newReputation = state.reputation;
      if (recentRatings.length > 0) {
        const averageRating =
          recentRatings.reduce(
            (sum: number, rating: number) => sum + rating,
            0
          ) / recentRatings.length;
        const targetReputation = averageRating * 20; // 5-star rating = 100 reputation

        // Slow reputation recovery: only move 10% toward target each cycle
        const reputationChange =
          (targetReputation - state.reputation) *
          REPUTATION_CONFIG.REPUTATION_RECOVERY_RATE;

        // Cap positive changes to +0.5 per cycle (slow growth)
        const cappedChange =
          reputationChange > 0
            ? Math.min(reputationChange, REPUTATION_CONFIG.MAX_POSITIVE_CHANGE)
            : reputationChange; // No cap on negative changes

        newReputation = Math.max(
          0,
          Math.min(100, state.reputation + cappedChange)
        );
      }

      // Calculate worker morale
      const newWorkerMorale =
        finalWorkers.length > 0
          ? finalWorkers.reduce(
              (sum: number, worker: Worker) => sum + worker.happiness,
              0
            ) / finalWorkers.length
          : 100;

      // Check for investor milestone
      const newNotifications = [...state.notifications];
      if (
        newCompletedJobs >= INVESTOR_CONFIG.FIRST_MILESTONE &&
        state.investorFunding === 0
      ) {
        newNotifications.push(
          generateNotification(
            "investor",
            "Investor Interest!",
            `We like your growth. Here's €${INVESTOR_CONFIG.FIRST_FUNDING.toLocaleString()}. Expand deliveries to ${
              INVESTOR_CONFIG.MONTHLY_TARGET
            } per day by end of month!`
          )
        );
      }

      // Add notifications for worker happiness issues
      const unhappyWorkers = finalWorkers.filter(
        (w: Worker) => w.happiness < 30
      );
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

    // Final safety: always try to assign if we have both pending jobs and available workers
    const s = get();
    const hasPending = s.jobs.some((j) => j.status === "pending");
    const hasAvailable = s.workers.some(
      (w: Worker) => !w.isWorking && !w.assignedJobId && w.isOnline && !w.isSick
    );
    if (hasPending && hasAvailable) {
      get().instantAssignJobs();
    }
  },
});
