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

export function WorkersModal() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    cash,
    workers,
    officeWorkers,
    supportStaff,
    hireWorker,
    hireOfficeWorker,
    hireSupportWorker,
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg" size="sm">
          👥 Workers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden z-[2000]">
        <DialogHeader>
          <DialogTitle>👥 Worker Management</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto max-h-[60vh]">
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
            <h3 className="font-semibold mb-3">🏢 Office Workers ({officeWorkers.length})</h3>
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
                    <div>💰 Salary: €{worker.monthlySalary.toLocaleString()}/month</div>
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
            <h3 className="font-semibold mb-3">📞 Support Staff ({supportStaff.length})</h3>
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
                    <div>💰 Salary: €{worker.monthlySalary.toLocaleString()}/month</div>
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
      </DialogContent>
    </Dialog>
  );
}
