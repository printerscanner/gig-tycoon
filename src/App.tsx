import Layout from "@/layouts/Layout";
import CityGrid from "@/components/CityGrid";
import { useGameStore } from "@/stores/gameStore";
import { useGameLoop } from "@/hooks/useGameLoop";

function App() {
  // Use the game loop hook to handle automatic updates
  useGameLoop();

  // Get state and actions from Zustand store
  const { workers, jobs, handleTileClick, completedJobs, monthlyTarget } = useGameStore();

  return (
    <Layout>
      <div className="flex-1 p-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚀 GIG TYCOON
          </h1>
          <p className="text-gray-600 mt-2">
            Build your gig economy empire! Hire workers, dispatch jobs, balance the books.
          </p>
          <div className="mt-3 text-sm text-gray-500">
            Progress: {completedJobs}/{monthlyTarget} jobs to unlock investor funding 💰
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <CityGrid 
            workers={workers}
            jobs={jobs}
            onTileClick={handleTileClick}
          />
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <div className="font-medium mb-1">🎮 How to Play (Automation Mode):</div>
            <div className="space-y-1 text-xs">
              <div>1. Hire workers (first 2 are FREE!) - they'll work automatically 🤖</div>
              <div>2. Jobs generate automatically from customers 📱</div>
              <div>3. Workers auto-assign to jobs based on availability ⚡</div>
              <div>4. Adjust wages to keep workers happy 💰</div>
              <div>5. Watch your business grow passively! 📈</div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            <div>💡 Your role: Hire staff, set wages, and watch the empire grow!</div>
            <div>⚠️ Warning: Underpaid workers = bad reviews = fewer customers</div>
            <div>🎯 Goal: Balance automation efficiency with worker satisfaction</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
