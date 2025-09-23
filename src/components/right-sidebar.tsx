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
import type { Job } from "@/types";

export function RightSidebar() {
  // Use the entire store and extract what we need
  const store = useGameStore();
  const {
    jobs,
    workers,
    generateJob,
    platformCommission,
    adjustPlatformCommission,
    courierPayout,
    adjustCourierPayout,
    getJobUrgencyStatus,
    buyMarketingBoost,
    officeWorkers,
    supportStaff,
    currentTime,
    cash,
  } = store;

  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;

  const formatGameTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, "0")} ${ampm}`;
  };

  const isDemandHigh = (minutes: number) => {
    const hours = Math.floor(minutes / 60) % 24;
    return (hours >= 11 && hours < 14) || (hours >= 17 && hours < 21);
  };

  const getJobTypeIcon = (job: Job) => {
    // All jobs are food delivery now - use job ID to get consistent icon
    const foodIcons = ["🍕", "🍔", "🥗", "🍜", "🌮", "🍣", "🍗", "🥪", "🍝", "🍰", "☕", "🥘"];
    // Use job ID to get consistent hash for this job
    const hash = job.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return foodIcons[hash % foodIcons.length];
  };

  const getUrgencyColor = (urgency: number) => {
    switch (urgency) {
      case 3:
        return "text-red-600 bg-red-50";
      case 2:
        return "text-yellow-600 bg-yellow-50";
      case 1:
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const pendingJobs = jobs.filter((job) => job.status === "pending");
  const assignedJobs = jobs.filter((job) => job.status === "assigned");
  const recentJobs = jobs.filter((job) => job.status === "completed").slice(-3);

  // Debug logging
  console.log("🔍 UI Debug:", {
    totalJobs: jobs.length,
    pendingJobs: pendingJobs.length,
    assignedJobs: assignedJobs.length,
    recentJobs: recentJobs.length,
    jobs: jobs.map((j) => ({ id: j.id, type: j.type, status: j.status })),
  });

  return (
    <Sidebar side="right" className="w-72 m-2">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">
            💰 PLATFORM COMMISSION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2 border rounded bg-yellow-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Commission:</span>
                <span className="text-sm font-bold">{platformCommission}%</span>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                Platform keeps {platformCommission}% of total order value
              </div>
              <div className="flex gap-1">
                {[25, 30, 35, 40, 45].map((commission) => (
                  <button
                    key={commission}
                    onClick={() => adjustPlatformCommission(commission)}
                    className={`px-2 py-1 text-xs rounded ${
                      platformCommission === commission
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {commission}%
                  </button>
                ))}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">
            💵 COURIER PAYOUT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2 border rounded bg-green-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Per Delivery:</span>
                <span className="text-sm font-bold">
                  ${courierPayout.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                Fixed payout per delivery + tips
              </div>

              <div className="flex gap-1">
                {[2, 2.5, 3, 3.5, 4].map((payout) => (
                  <button
                    key={payout}
                    onClick={() => adjustCourierPayout(payout)}
                    className={`px-2 py-1 text-xs rounded ${
                      Math.abs(courierPayout - payout) < 0.01
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    ${payout.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">
            📢 MARKETING BOOST
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2 border rounded bg-purple-50">
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
                    <div className="text-sm font-bold mb-2">
                      Cost: ${totalCost.toLocaleString()}
                    </div>
                    <button
                      onClick={buyMarketingBoost}
                      disabled={!canAfford}
                      className={`w-full px-3 py-2 rounded text-sm font-medium ${
                        canAfford
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    >
                      📢 Buy Marketing Boost
                    </button>
                    <div className="text-xs text-gray-500 mt-1">
                      Team size: {totalStaff} | Cost: $5k + $2k per staff
                    </div>
                  </>
                );
              })()}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">
            📋 JOBS ({pendingJobs.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="text-xs text-gray-500 mb-2 p-1 bg-gray-50 rounded">
              🔄 Auto-generating | Total: {jobs.length} | Pending:{" "}
              {pendingJobs.length}
            </div>
            <SidebarMenu>
              {pendingJobs.slice(0, 8).map((job) => {
                const urgencyStatus = getJobUrgencyStatus(job);
                const timeElapsedHours = urgencyStatus.timeElapsed; // Now in game hours

                // Show elapsed time counting up to 10 minutes
                const elapsedMinutes = Math.floor(timeElapsedHours);
                const timeDisplay =
                  elapsedMinutes === 0 ? "0m" : `${elapsedMinutes}m`;

                const assignedWorker = workers.find(
                  (w) => w.assignedJobId === job.id
                );

                return (
                  <SidebarMenuItem key={job.id}>
                    <div className="w-full text-left p-2 border rounded hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {getJobTypeIcon(job)}{" "}
                          {formatCurrency(job.payment)}
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
                      <div className="text-xs text-gray-600 truncate">
                        {job.description}
                      </div>
                      <div className="text-xs mt-1">
                        {assignedWorker ? (
                          <span className="text-blue-600">
                            👤 Assigned to {assignedWorker.name}
                          </span>
                        ) : (
                          <span className="text-orange-500">
                            ⚡ Unassigned - waiting for courier
                          </span>
                        )}
                      </div>
                    </div>
                  </SidebarMenuItem>
                );
              })}

              {pendingJobs.length === 0 && (
                <SidebarMenuItem>
                  <div className="p-2 text-center text-gray-500 text-xs">
                    📱 Waiting for jobs...
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">
            🚀 ACTIVE ({assignedJobs.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {assignedJobs.slice(0, 3).map((job) => {
                const worker = workers.find(
                  (w) => w.id === job.assignedWorkerId
                );
                return (
                  <SidebarMenuItem key={job.id}>
                    <div className="p-2 border rounded bg-blue-50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {getJobTypeIcon(job)}{" "}
                          {formatCurrency(job.payment)}
                        </span>
                        <span className="text-xs text-blue-600">
                          {worker?.name || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">✅ REVIEWS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentJobs.map((job) => (
                <SidebarMenuItem key={job.id}>
                  <div className="p-2 border rounded bg-green-50">
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
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
