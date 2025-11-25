import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useGameStore } from "@/stores/gameStore";
import { getCurrentDay } from "@/stores/utils/timeUtils";

export function AppSidebar() {
  const {
    cash,
    reputation,
    workerMorale,
    completedJobs,
    workers,
    officeWorkers,
    supportStaff,
    hireWorker,
    hireOfficeWorker,
    hireSupportWorker,
    gameDays,
  } = useGameStore();

  const formatCurrency = (amount: number) => `€${amount.toFixed(0)}`;

  // Calculate max capacity based on office workers
  const calculateMaxCapacity = () => {
    // Base capacity is 5 couriers (2 CEO/CTO already hired + 3 more slots)
    const baseCapacity = 5;

    // Add capacity from office workers (CEO/CTO have 0 capacity, new hires add 5 each)
    const additionalCapacity = officeWorkers.reduce(
      (total, worker) => total + worker.adminCapacity,
      0
    );

    return baseCapacity + additionalCapacity;
  };

  // Time formatting is now handled by the timeUtils module

  const getWorkerTraitEmoji = (traits: Array<{ name: string }>) => {
    if (traits.some((t) => t.name === "Hustler")) return "⚡";
    if (traits.some((t) => t.name === "Reliable")) return "✅";
    if (traits.some((t) => t.name === "Lazy")) return "😴";
    if (traits.some((t) => t.name === "Stressed")) return "😰";
    if (traits.some((t) => t.name === "Burnout-prone")) return "🔥";
    return "🧑‍💼";
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>STATS</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-3 space-y-3 text-sm">
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

              {/* Weekly Expenses Section */}
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-700 mb-2">
                  📊 MONTHLY EXPENSES
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>👥 Office Workers:</span>
                    <span className="text-red-600">
                      -$
                      {(officeWorkers.length * 10000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>📞 Support Staff:</span>
                    <span className="text-red-600">
                      -$
                      {(supportStaff.length * 2500).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>🏢 Rent & Legal:</span>
                    <span className="text-red-600">
                      -$
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
                      -${(5000).toLocaleString()}+
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-1 font-semibold">
                    <span>💸 Total/Month:</span>
                    <span className="text-red-600">
                      -$
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
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>CONTRACTORS ({workers.length})</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workers.map((worker) => (
                <SidebarMenuItem key={worker.id}>
                  <div className="w-full p-2 border rounded-lg hover:bg-accent">
                    <div className="p-2 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {getWorkerTraitEmoji(worker.traits)}
                        </span>
                        <span className="font-medium">{worker.name}</span>
                        {worker.isWorking && (
                          <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                            WORKING
                          </span>
                        )}
                        {!worker.isWorking && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                            AVAILABLE
                          </span>
                        )}
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>⚡ Stamina:</span>
                          <span>{worker.stamina}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>😊 Happiness:</span>
                          <span
                            className={
                              worker.happiness >= 70
                                ? "text-green-600"
                                : worker.happiness >= 40
                                ? "text-yellow-600"
                                : "text-red-600"
                            }
                          >
                            {worker.happiness}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>📈 Jobs:</span>
                          <span>
                            {worker.jobsCompleted} |{" "}
                            {formatCurrency(worker.totalEarned)} earned
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>⏰ Hours:</span>
                          <span>
                            {worker.totalHoursWorked?.toFixed(1) || 0}h worked
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Traits: {worker.traits.map((t) => t.name).join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={hireWorker}
                  className="w-full border-dashed border-2 border-blue-300 hover:border-blue-400 bg-blue-50"
                  disabled={
                    cash < 150 || workers.length >= calculateMaxCapacity()
                  }
                >
                  <span>+ Hire Courier (€150)</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            OFFICE WORKERS ({officeWorkers.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {officeWorkers.map((worker, index) => (
                <SidebarMenuItem key={worker.id}>
                  <div className="w-full p-2 border rounded-lg hover:bg-accent bg-orange-50">
                    <div className="p-2 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🏢</span>
                        <span className="font-medium">{worker.name}</span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">
                          {index === 0 ? "CEO" : index === 1 ? "CTO" : "ADMIN"}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>⚡ Efficiency:</span>
                          <span>{worker.efficiency}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>👥 Capacity:</span>
                          <span>{worker.adminCapacity} couriers</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💰 Salary:</span>
                          <span>
                            ${worker.monthlySalary.toLocaleString()}/month
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>📈 Total Cost:</span>
                          <span>{formatCurrency(worker.totalCost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={hireOfficeWorker}
                  className="w-full border-dashed border-2 border-orange-300 hover:border-orange-400 bg-orange-50"
                  disabled={cash < 5000}
                >
                  <span>+ Hire Office Worker (€5k-10k)</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            CONTRACTORS ({supportStaff.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportStaff.map((worker) => (
                <SidebarMenuItem key={worker.id}>
                  <div className="w-full p-2 border rounded-lg hover:bg-accent bg-purple-50">
                    <div className="p-2 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📞</span>
                        <span className="font-medium">{worker.name}</span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">
                          SUPPORT
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>👥 Capacity:</span>
                          <span>{worker.supportCapacity} couriers</span>
                        </div>
                        <div className="flex justify-between">
                          <span>💰 Salary:</span>
                          <span>
                            ${worker.monthlySalary.toLocaleString()}/month
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>📈 Total Cost:</span>
                          <span>{formatCurrency(worker.totalCost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={hireSupportWorker}
                  className="w-full border-dashed border-2 border-purple-300 hover:border-purple-400 bg-purple-50"
                  disabled={cash < 5000}
                >
                  <span>+ Hire Customer Support ($5k)</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
