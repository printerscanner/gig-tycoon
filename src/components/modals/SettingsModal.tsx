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

export function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    cash,
    workers,
    officeWorkers,
    supportStaff,
    platformCommission,
    adjustPlatformCommission,
    courierPayout,
    adjustCourierPayout,
    buyMarketingBoost,
  } = useGameStore();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg" size="sm">
          ⚙️ Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl z-[2000]">
        <DialogHeader>
          <DialogTitle>⚙️ Business Settings</DialogTitle>
        </DialogHeader>
        
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
                  variant={platformCommission === commission ? "default" : "outline"}
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
                  variant={Math.abs(courierPayout - payout) < 0.01 ? "default" : "outline"}
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
              const totalStaff = workers.length + officeWorkers.length + supportStaff.length;
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
      </DialogContent>
    </Dialog>
  );
}
