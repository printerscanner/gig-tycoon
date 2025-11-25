import { StatsModal } from "@/components/modals/StatsModal";
import { WorkersModal } from "@/components/modals/WorkersModal";
import { OrdersModal } from "@/components/modals/OrdersModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { StatusOverlay } from "@/components/StatusOverlay";
import { useGameStore } from "@/stores/gameStore";
import { getCurrentDay } from "@/stores/utils/timeUtils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { cash, gameDays, completedJobs } = useGameStore();

  const formatCurrency = (amount: number) => `€${amount.toFixed(0)}`;

  return (
    <div className="h-screen w-full bg-gray-100 relative">
      {/* Top Status Bar */}
      <div className="bg-white border-b shadow-sm px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span>🕐</span>
            <span className="font-medium">Day {getCurrentDay(gameDays)}</span>
          </div>
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span className="font-medium">{completedJobs} jobs completed</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-lg font-bold text-blue-600">🍕 FoodDash</div>

          {/* Game Control Buttons */}
          <div className="flex gap-2">
            <StatsModal />
            <WorkersModal />
            <OrdersModal />
            <SettingsModal />
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <main className="flex-1 h-[calc(100vh-60px)] overflow-hidden">
        <div className="h-full flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-full">{children}</div>
        </div>
      </main>

      {/* Status Overlay */}
      <StatusOverlay />
    </div>
  );
}
