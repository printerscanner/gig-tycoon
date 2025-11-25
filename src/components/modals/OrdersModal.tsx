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
import type { Job } from "@/types";

export function OrdersModal() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    jobs,
    workers,
    getJobUrgencyStatus,
  } = useGameStore();

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;

  const getJobTypeIcon = (job: Job) => {
    const foodIcons = [
      "🍕", "🍔", "🥗", "🍜", "🌮", "🍣", "🍗", "🥪", "🍝", "🍰", "☕", "🥘",
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg" size="sm">
          📋 Orders
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden z-[2000]">
        <DialogHeader>
          <DialogTitle>📋 Order Management</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Active Orders */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">📋 Active Orders ({activeJobs.length})</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {activeJobs.slice(0, 8).map((job) => {
                const urgencyStatus = getJobUrgencyStatus(job);
                const timeElapsedHours = urgencyStatus.timeElapsed;
                const elapsedMinutes = Math.floor(timeElapsedHours);
                const timeDisplay = elapsedMinutes === 0 ? "0m" : `${elapsedMinutes}m`;
                const detailedStatus = getDetailedJobStatus(job);

                return (
                  <div key={job.id} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {getJobTypeIcon(job)} {formatCurrency(job.payment)}
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
                    <div className="text-xs text-gray-600 mb-1">{job.description}</div>
                    <div className="text-xs">
                      <span className={detailedStatus.color}>{detailedStatus.text}</span>
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

          {/* In Progress Orders */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">🚀 In Progress ({assignedJobs.length})</h3>
            <div className="space-y-3">
              {assignedJobs.slice(0, 3).map((job) => {
                const worker = workers.find(
                  (w) => w.id === job.assignedWorkerId
                );
                return (
                  <div key={job.id} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {getJobTypeIcon(job)} {formatCurrency(job.payment)}
                      </span>
                      <span className="text-xs text-blue-600">
                        {worker?.name || "Unknown"}
                      </span>
                    </div>
                  </div>
                );
              })}
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
                      {getJobTypeIcon(job)} {formatCurrency(job.payment)}
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
      </DialogContent>
    </Dialog>
  );
}
