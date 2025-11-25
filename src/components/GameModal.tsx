import React, { useState } from "react";
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
import type { Job } from "@/types";

type TabType = "stats" | "workers" | "orders" | "settings";

export function GameModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("stats");

  const {
    cash,
    reputation,
    workerMorale,
    completedJobs,
    workers,
    officeWorkers,
    supportStaff,
    jobs,
    gameDays,
    hireWorker,
    hireOfficeWorker,
    hireSupportWorker,
    platformCommission,
    adjustPlatformCommission,
    courierPayout,
    adjustCourierPayout,
    getJobUrgencyStatus,
    buyMarketingBoost,
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

  const getWorkerTraitEmoji = (traits: Array<{ name: string }>) => {
    if (traits.some((t) => t.name === "Hustler")) return "⚡";
    if (traits.some((t) => t.name === "Reliable")) return "✅";
    if (traits.some((t) => t.name === "Lazy")) return "😴";
    if (traits.some((t) => t.name === "Stressed")) return "😰";
    if (traits.some((t) => t.name === "Burnout-prone")) return "🔥";
    return "🧑‍💼";
  };

  const getJobTypeIcon = (job: Job) => {
    const foodIcons = [
      "🍕",
      "🍔",
      "🥗",
      "🍜",
      "🌮",
      "🍣",
      "🍗",
      "🥪",
      "🍝",
      "🍰",
      "☕",
      "🥘",
    ];
    const hash = job.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return foodIcons[hash % foodIcons.length];
  };

  const activeJobs = jobs.filter(
    (job) => job.status === "pending" || job.status === "assigned"
  );
  const assignedJobs = jobs.filter((job) => job.status === "assigned");
  const recentJobs = jobs.filter((job) => job.status === "completed").slice(-3);

  const getDetailedJobStatus = (job: Job) => {
    const worker = workers.find((w) => w.assignedJobId === job.id);

    if (!worker) {
      return {
        text: "⚡ Unassigned - waiting for courier",
        color: "text-orange-500",
      };
    }

    const atPickup =
      worker.position.row === job.pickup.row &&
      worker.position.col === job.pickup.col;
    const atDropoff =
      worker.position.row === job.dropoff.row &&
      worker.position.col === job.dropoff.col;

    if (job.status === "assigned") {
      if (atDropoff) {
        return {
          text: `📦 Delivered by ${worker.name}!`,
          color: "text-green-600",
        };
      } else if (atPickup) {
        return {
          text: `🚛 Out for delivery - ${worker.name}`,
          color: "text-blue-600",
        };
      } else {
        return {
          text: `🏃 On the way - ${worker.name}`,
          color: "text-blue-600",
        };
      }
    }

    return {
      text: `👤 Assigned to ${worker.name}`,
      color: "text-blue-600",
    };
  };

  const tabs = [
    { id: "stats", label: "📊 Stats", icon: "📊" },
    { id: "workers", label: "👥 Workers", icon: "👥" },
    { id: "orders", label: "📋 Orders", icon: "📋" },
    { id: "settings", label: "⚙️ Settings", icon: "⚙️" },
  ];

  const renderStatsTab = () => (
    <div className="space-y-6">
      {/* Basic Stats */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Game Statistics</h3>
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
            <span className="text-red-600">-€{(5000).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-gray-300 pt-2 font-semibold">
            <span>💸 Total/Month:</span>
            <span className="text-red-600">
              -€
              {(
                officeWorkers.length * 10000 +
                supportStaff.length * 2500 +
                (20000 + workers.length * 1000 + officeWorkers.length * 2000) +
                5000
              ).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkersTab = () => (
    <div className="space-y-6">
      {/* Couriers */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">🛵 Couriers ({workers.length})</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {workers.map((worker) => (
            <div key={worker.id} className="bg-white p-3 rounded border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {getWorkerTraitEmoji(worker.traits)}
                </span>
                <span className="font-medium">{worker.name}</span>
                {worker.isWorking ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    WORKING
                  </span>
                ) : (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    AVAILABLE
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>⚡ Stamina: {worker.stamina}/100</div>
                <div
                  className={
                    worker.happiness >= 70
                      ? "text-green-600"
                      : worker.happiness >= 40
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  😊 Happiness: {worker.happiness}/100
                </div>
                <div>📈 Jobs: {worker.jobsCompleted}</div>
                <div>💰 Earned: {formatCurrency(worker.totalEarned)}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Traits: {worker.traits.map((t) => t.name).join(", ")}
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={hireWorker}
          className="w-full mt-3"
          disabled={cash < 150 || workers.length >= calculateMaxCapacity()}
        >
          + Hire Courier (€150)
        </Button>
      </div>

      {/* Office Workers */}
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">
          🏢 Office Workers ({officeWorkers.length})
        </h3>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {officeWorkers.map((worker, index) => (
            <div key={worker.id} className="bg-white p-3 rounded border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏢</span>
                <span className="font-medium">{worker.name}</span>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  {index === 0 ? "CEO" : index === 1 ? "CTO" : "ADMIN"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>⚡ Efficiency: {worker.efficiency}/100</div>
                <div>👥 Capacity: {worker.adminCapacity} couriers</div>
                <div>
                  💰 Salary: €{worker.monthlySalary.toLocaleString()}/month
                </div>
                <div>📈 Total Cost: {formatCurrency(worker.totalCost)}</div>
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={hireOfficeWorker}
          className="w-full mt-3"
          disabled={cash < 5000}
        >
          + Hire Office Worker (€5k-10k)
        </Button>
      </div>

      {/* Support Staff */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">
          📞 Support Staff ({supportStaff.length})
        </h3>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {supportStaff.map((worker) => (
            <div key={worker.id} className="bg-white p-3 rounded border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📞</span>
                <span className="font-medium">{worker.name}</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  SUPPORT
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>👥 Capacity: {worker.supportCapacity} couriers</div>
                <div>
                  💰 Salary: €{worker.monthlySalary.toLocaleString()}/month
                </div>
                <div>📈 Total Cost: {formatCurrency(worker.totalCost)}</div>
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={hireSupportWorker}
          className="w-full mt-3"
          disabled={cash < 5000}
        >
          + Hire Customer Support (€5k)
        </Button>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6">
      {/* Active Orders */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">
          📋 Active Orders ({activeJobs.length})
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {activeJobs.slice(0, 8).map((job) => {
            const urgencyStatus = getJobUrgencyStatus(job);
            const timeElapsedHours = urgencyStatus.timeElapsed;
            const elapsedMinutes = Math.floor(timeElapsedHours);
            const timeDisplay =
              elapsedMinutes === 0 ? "0m" : `${elapsedMinutes}m`;
            const detailedStatus = getDetailedJobStatus(job);

            return (
              <div key={job.id} className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {getJobTypeIcon(job)} €{job.payment.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm ${
                        urgencyStatus.severity === "critical"
                          ? "text-red-600"
                          : urgencyStatus.severity === "warning"
                          ? "text-orange-500"
                          : "text-green-600"
                      }`}
                    >
                      🕐
                    </span>
                    <span
                      className={`text-xs font-mono ${
                        urgencyStatus.isOverdue
                          ? "text-red-600 font-bold"
                          : urgencyStatus.severity === "warning"
                          ? "text-orange-500"
                          : "text-gray-600"
                      }`}
                    >
                      {urgencyStatus.isOverdue ? "LATE!" : timeDisplay}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {job.description}
                </div>
                <div className="text-xs">
                  <span className={detailedStatus.color}>
                    {detailedStatus.text}
                  </span>
                </div>
              </div>
            );
          })}
          {activeJobs.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              📱 Waiting for orders...
            </div>
          )}
        </div>
      </div>

      {/* Recent Completed Orders */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">✅ Recent Reviews</h3>
        <div className="space-y-3">
          {recentJobs.map((job) => (
            <div key={job.id} className="bg-white p-3 rounded border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {getJobTypeIcon(job)} €{job.payment.toFixed(2)}
                </span>
                <span className="text-sm">
                  {"⭐".repeat(job.customerRating || 0)}
                </span>
              </div>
              <div className="text-xs text-green-600">
                {job.customerRating === 5
                  ? "Amazing!"
                  : job.customerRating === 4
                  ? "Good!"
                  : job.customerRating === 3
                  ? "Okay"
                  : job.customerRating === 2
                  ? "Poor"
                  : "Bad"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Platform Commission */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">💰 Platform Commission</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Commission:</span>
          <span className="text-sm font-bold">{platformCommission}%</span>
        </div>
        <div className="text-xs text-gray-600 mb-3">
          Platform keeps {platformCommission}% of total order value
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 10, 15, 20, 30, 40].map((commission) => (
            <Button
              key={commission}
              onClick={() => adjustPlatformCommission(commission)}
              variant={
                platformCommission === commission ? "default" : "outline"
              }
              size="sm"
            >
              {commission}%
            </Button>
          ))}
        </div>
      </div>

      {/* Courier Payout */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">💵 Courier Payout</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Per Delivery:</span>
          <span className="text-sm font-bold">€{courierPayout.toFixed(2)}</span>
        </div>
        <div className="text-xs text-gray-600 mb-3">
          Fixed payout per delivery + tips
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[2, 2.5, 3, 3.5, 4].map((payout) => (
            <Button
              key={payout}
              onClick={() => adjustCourierPayout(payout)}
              variant={
                Math.abs(courierPayout - payout) < 0.01 ? "default" : "outline"
              }
              size="sm"
            >
              €{payout.toFixed(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Marketing Boost */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">📢 Marketing Boost</h3>
        {(() => {
          const totalStaff =
            workers.length + officeWorkers.length + supportStaff.length;
          const baseCost = 5000;
          const perStaffCost = 2000;
          const totalCost = baseCost + totalStaff * perStaffCost;
          const canAfford = cash >= totalCost;

          return (
            <>
              <div className="text-xs text-gray-600 mb-2">
                Generate 3-5 immediate orders
              </div>
              <div className="text-sm font-bold mb-3">
                Cost: €{totalCost.toLocaleString()}
              </div>
              <Button
                onClick={buyMarketingBoost}
                disabled={!canAfford}
                className="w-full"
                variant={canAfford ? "default" : "outline"}
              >
                Marketing Campaign
              </Button>
              <div className="text-xs text-gray-500 mt-2">
                Team size: {totalStaff} | Cost: €5k + €2k per staff
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed top-4 right-4 z-50 shadow-lg" size="lg">
          📊 Game Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>FoodDash Management</DialogTitle>
        </DialogHeader>

        <div className="flex h-[60vh]">
          {/* Tab Navigation */}
          <div className="w-48 border-r pr-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 pl-4 overflow-y-auto">
            {activeTab === "stats" && renderStatsTab()}
            {activeTab === "workers" && renderWorkersTab()}
            {activeTab === "orders" && renderOrdersTab()}
            {activeTab === "settings" && renderSettingsTab()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
