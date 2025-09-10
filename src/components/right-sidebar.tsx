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
import { useEffect } from "react";

export function RightSidebar() {
  // Use the entire store and extract what we need
  const store = useGameStore();
  const {
    jobs,
    workers,
    notifications,
    generateJob,
    dismissNotification,
    acceptInvestorDeal,
  } = store;

  const formatCurrency = (amount: number) => `$${amount.toFixed(0)}`;

  const getJobTypeIcon = (type: Job["type"]) => {
    switch (type) {
      case "delivery":
        return "🚚";
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
        return "💰";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "worker":
        return "👥";
      case "customer":
        return "😊";
      default:
        return "ℹ️";
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
                          <span>{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs truncate">
                              {notification.title}
                            </div>
                            <div className="text-gray-600 text-xs leading-tight">
                              {notification.message.length > 40
                                ? notification.message.substring(0, 40) + "..."
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
            <div className="text-xs text-gray-500 mb-2 p-1 bg-gray-50 rounded">
              🔄 Auto-generating | Total: {jobs.length} | Pending:{" "}
              {pendingJobs.length}
            </div>
            <SidebarMenu>
              {pendingJobs.slice(0, 3).map((job) => (
                <SidebarMenuItem key={job.id}>
                  <div className="w-full text-left p-2 border rounded hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
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
                    <div className="text-xs text-gray-600 truncate">
                      {job.description}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      ⚡ Auto-assigned
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}

              {pendingJobs.length === 0 && (
                <SidebarMenuItem>
                  <div className="p-2 text-center text-gray-500 text-xs">
                    📱 Waiting for jobs...
                  </div>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={generateJob}
                  className="w-full border-dashed border-2 border-blue-300 hover:border-blue-400 bg-blue-50 text-xs h-8"
                >
                  📢 Marketing Boost
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                          {getJobTypeIcon(job.type)}{" "}
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
                        {getJobTypeIcon(job.type)} {formatCurrency(job.payment)}
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
