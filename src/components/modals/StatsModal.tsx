import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/stores/gameStore";
import { getCurrentDay, getCurrentMonth } from "@/stores/utils/timeUtils";

export function StatsModal() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    cash,
    reputation,
    workerMorale,
    completedJobs,
    workers,
    officeWorkers,
    supportStaff,
    gameDays,
  } = useGameStore();

  const formatCurrency = (amount: number) => `€${amount.toFixed(0)}`;

  // Calculate max capacity based on office workers
  const calculateMaxCapacity = () => {
    const baseCapacity = 5;
    const additionalCapacity = officeWorkers.reduce(
      (total, worker) => total + worker.adminCapacity,
      0
    );
    return baseCapacity + additionalCapacity;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg" size="sm">
          📊 Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl z-[2000]">
        <DialogHeader>
          <DialogTitle>📊 Game Statistics</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Stats */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Current Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>🕐 Time:</span>
                <span className="font-bold">Day {getCurrentDay(gameDays)}</span>
              </div>
              <div className="flex justify-between">
                <span>💰 Cash:</span>
                <span
                  className={`font-bold ${
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
              <div className="flex justify-between">
                <span>🛵 Couriers:</span>
                <span className="font-bold">
                  {workers.length}/{calculateMaxCapacity()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>⭐ Reputation:</span>
                <span
                  className={`font-bold ${
                    reputation >= 80
                      ? "text-green-600"
                      : reputation >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {reputation.toFixed(0)}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span>😊 Worker Morale:</span>
                <span
                  className={`font-bold ${
                    workerMorale >= 80
                      ? "text-green-600"
                      : workerMorale >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {workerMorale.toFixed(0)}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span>📦 Jobs Done:</span>
                <span className="font-bold">{completedJobs}</span>
              </div>
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">📊 Monthly Expenses</h3>
            <div className="text-xs text-gray-600 mb-3">
              Next payment: Day {getCurrentMonth(gameDays) * 30}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>👥 Office Workers:</span>
                <span className="text-red-600">
                  -€{(officeWorkers.length * 10000).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>📞 Support Staff:</span>
                <span className="text-red-600">
                  -€{(supportStaff.length * 2500).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>🏢 Rent & Legal:</span>
                <span className="text-red-600">
                  -€
                  {(
                    20000 +
                    workers.length * 1000 +
                    officeWorkers.length * 2000
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>☁️ Cloud/Infrastructure:</span>
                <span className="text-red-600">
                  -€{(5000).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 font-semibold">
                <span>💸 Total/Month:</span>
                <span className="text-red-600">
                  -€
                  {(
                    officeWorkers.length * 10000 +
                    supportStaff.length * 2500 +
                    (20000 +
                      workers.length * 1000 +
                      officeWorkers.length * 2000) +
                    5000
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
