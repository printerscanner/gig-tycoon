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
import type { Job, Notification } from "@/types";

export function RightSidebar() {
  const {
    jobs,
    workers,
    notifications,
    generateJob,
    dismissNotification,
    acceptInvestorDeal,
  } = useGameStore();

  const formatCurrency = (amount: number) => `$${amount.toFixed(0)}`;

  const getJobTypeIcon = (type: Job["type"]) => {
    switch (type) {
      case "delivery":
        return "�";
      case "rideshare":
        return "🚗";
      case "labor":
        return "🔨";
      default:
        return "💼";
    }
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

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "investor":
        return "�";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "worker":
        return "�";
      case "customer":
        return "😊";
      default:
        return "ℹ️";
    }
  };

  const pendingJobs = jobs.filter((job) => job.status === "pending");
  const assignedJobs = jobs.filter((job) => job.status === "assigned");
  const recentJobs = jobs.filter((job) => job.status === "completed").slice(-3);

  return (
    <Sidebar side="right" className="w-80">
      <SidebarContent className="p-2">
        {notifications.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs">🔔 ALERTS</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {notifications.slice(0, 2).map((notification) => (
                  <SidebarMenuItem key={notification.id}>
                    <div
                      className={`p-2 border rounded text-xs ${
                        notification.type === "investor"
                          ? "bg-yellow-50 border-yellow-300"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-1 flex-1">
                          <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs truncate">
                              {notification.title}
                            </div>
                            <div className="text-gray-600 text-xs leading-tight">
                              {notification.message.length > 50 
                                ? notification.message.substring(0, 50) + "..." 
                                : notification.message}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 ml-1"
                        >
                          ✕
                        </button>
                      </div>
                      {notification.type === "investor" && (
                        <button
                          onClick={acceptInvestorDeal}
                          className="mt-2 w-full text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Accept Deal! 💰
                        </button>
                      )}
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">
            📋 JOBS ({pendingJobs.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-50 rounded leading-tight">
              🔄 Auto-generating
            </div>
            <SidebarMenu>
              {pendingJobs.slice(0, 4).map((job) => (
                <SidebarMenuItem key={job.id}>
                  <div className="w-full text-left p-2 border rounded hover:bg-gray-50">
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-medium text-sm">
                          {getJobTypeIcon(job.type)} {formatCurrency(job.payment)}
                        </span>
                        <span
                          className={`text-xs px-1 py-0.5 rounded ${getUrgencyColor(
                            job.urgency
                          )}`}
                        >
                          {"🔥".repeat(job.urgency)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground w-full truncate">
                        {job.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({job.pickup.row},{job.pickup.col}) → ({job.dropoff.row},{job.dropoff.col})
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        ⚡ Auto-assigned
                      </div>
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}
                            ? "URGENT"
                            : job.urgency === 2
                            ? "MEDIUM"
                            : "LOW"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground w-full">
                        {job.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({job.pickup.row},{job.pickup.col}) → ({job.dropoff.row}
                        ,{job.dropoff.col})
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        ⚡ Auto-assigned to available workers
                      </div>
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}

              {pendingJobs.length === 0 && (
                <SidebarMenuItem>
                  <div className="p-3 text-center text-gray-500 text-sm">
                    📱 Waiting for customer requests...
                    <br />
                    <span className="text-xs">
                      Jobs appear automatically every few seconds
                    </span>
                  </div>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={generateJob}
                  className="w-full border-dashed border-2 border-blue-300 hover:border-blue-400 bg-blue-50 text-xs"
                >
                  <span>� Boost Marketing (Generate Job Now)</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            🚀 ACTIVE JOBS ({assignedJobs.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {assignedJobs.map((job) => {
                const worker = workers.find(
                  (w) => w.id === job.assignedWorkerId
                );
                return (
                  <SidebarMenuItem key={job.id}>
                    <div className="p-2 border rounded bg-blue-50">
                      <div className="text-sm font-medium">
                        {getJobTypeIcon(job.type)} {formatCurrency(job.payment)}
                      </div>
                      <div className="text-xs text-blue-600">
                        🧑‍💼 {worker?.name || "Unknown"} is working...
                      </div>
                      <div className="text-xs">{job.description}</div>
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>✅ RECENT REVIEWS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentJobs.map((job) => (
                <SidebarMenuItem key={job.id}>
                  <div className="p-2 border rounded bg-green-50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {getJobTypeIcon(job.type)} {formatCurrency(job.payment)}
                      </span>
                      <span className="text-sm">
                        {"⭐".repeat(job.customerRating || 0)}
                      </span>
                    </div>
                    <div className="text-xs text-green-600">
                      {job.customerRating === 5
                        ? "Amazing service!"
                        : job.customerRating === 4
                        ? "Good job!"
                        : job.customerRating === 3
                        ? "Okay..."
                        : job.customerRating === 2
                        ? "Could be better"
                        : "Disappointed"}
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
