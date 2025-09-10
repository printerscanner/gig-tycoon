import Layout from "@/layouts/Layout";
import CityGrid from "@/components/CityGrid";
import { useGameStore } from "@/stores/gameStore";
import { useGameLoop } from "@/hooks/useGameLoop";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { useEffect } from "react";

function App() {
  // Use the game loop hook to handle automatic updates
  useGameLoop();

  // Get state and actions from Zustand store
  const { workers, jobs, handleTileClick, completedJobs, monthlyTarget } =
    useGameStore();

  // Show welcome message on app start
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.info("🎉 Welcome to Gig Tycoon!", {
        description:
          "You start with 2 free workers! Jobs will auto-generate and workers will auto-assign to them.",
        duration: 6000,
      });
    }, 1000); // Delay to ensure app is fully loaded

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col h-full w-full">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            GIG TYCOON
          </h1>
          <p className="text-gray-600 mt-2">
            Build your gig economy empire! Hire workers, dispatch jobs, balance
            the books.
          </p>
          <div className="mt-3 text-sm text-gray-500">
            Progress: {completedJobs}/{monthlyTarget} jobs to unlock investor
            funding 💰
          </div>
        </div>

        <div className="flex-1 w-full">
          <CityGrid
            workers={workers}
            jobs={jobs}
            onTileClick={handleTileClick}
          />
        </div>
      </div>

      {/* Fixed position help button in bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="p-2 border-2 w-10 h-12 rounded-lg shadow-lg font-medium"
            >
              ?
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            className="bg-card text-foreground-card m-3 max-w-sm border shadow-xl"
          >
            <div className="text-sm space-y-3">
              <div className="font-semibold border-b pb-2">
                🎮 How to Play (Automation Mode):
              </div>

              <div className="space-y-1">
                <div>1. Hire workers</div>
                <div>2. Customers call in jobs</div>
                <div>3. Adjust wages to keep workers happy 💰</div>
                <div>4. Watch your business grow! 📈</div>
              </div>

              <div className="text-xs text-gray-600 border-t pt-2 space-y-1">
                <div>
                  💡 Your role: Hire staff, set wages, and watch the empire
                  grow!
                </div>
                <div>
                  ⚠️ Warning: Underpaid workers = bad reviews = fewer customers
                </div>
                <div>
                  🎯 Goal: Balance automation efficiency with worker
                  satisfaction
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t pt-2">
                <div className="font-medium mb-1">🏙️ City Legend:</div>
                <div>
                  🍕🍔 Restaurants • 🏠 Homes • 🏢 Offices • 🛒🏪 Stores • 🌳
                  Parks
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </Layout>
  );
}

export default App;
