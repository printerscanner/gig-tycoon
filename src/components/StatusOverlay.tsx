import { useGameStore } from "@/stores/gameStore";
import { getCurrentDay } from "@/stores/utils/timeUtils";

export function StatusOverlay() {
  const { cash, gameDays, reputation, workers, jobs, officeWorkers } =
    useGameStore();

  const formatCurrency = (amount: number) => `€${amount.toFixed(0)}`;

  const activeJobs = jobs.filter(
    (job) => job.status === "pending" || job.status === "assigned"
  );

  // Calculate max capacity
  const calculateMaxCapacity = () => {
    const baseCapacity = 5;
    const additionalCapacity = officeWorkers.reduce(
      (total, worker) => total + worker.adminCapacity,
      0
    );
    return baseCapacity + additionalCapacity;
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 z-40">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="flex items-center gap-1">
          <span>🕐</span>
          <span className="font-medium">Day {getCurrentDay(gameDays)}</span>
        </div>

        <div className="flex items-center gap-1">
          <span>💰</span>
          <span
            className={`font-medium ${
              cash < 0
                ? "text-red-600"
                : cash < 1000
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {formatCurrency(cash)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span>🛵</span>
          <span className="font-medium">
            {workers.length}/{calculateMaxCapacity()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span>⭐</span>
          <span
            className={`font-medium ${
              reputation >= 80
                ? "text-green-600"
                : reputation >= 60
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {reputation.toFixed(0)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span>📋</span>
          <span className="font-medium text-orange-600">
            {activeJobs.length} active
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span>👥</span>
          <span className="font-medium">
            {workers.filter((w) => w.isWorking).length} working
          </span>
        </div>
      </div>
    </div>
  );
}
