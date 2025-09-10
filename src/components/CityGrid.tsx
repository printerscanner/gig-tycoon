import React from "react";
import type { CityTile, Worker, Job } from "@/types";

interface CityGridProps {
  workers: Worker[];
  jobs: Job[];
  onTileClick: (row: number, col: number) => void;
}

const GRID_SIZE = 10; // 10x10 grid for better delivery app feel

const CityGrid: React.FC<CityGridProps> = ({ workers, jobs, onTileClick }) => {
  const generateTile = (row: number, col: number): CityTile => {
    // Create a delivery app style city with clear roads and districts
    let type: CityTile["type"] = "home";
    let isRoad = false;
    let bgColor = "";
    let displayName = "";
    
    // Define road network - horizontal and vertical roads every 3 tiles
    if (row === 2 || row === 5 || row === 8 || col === 2 || col === 5 || col === 8) {
      isRoad = true;
      type = "park"; // Use park type for roads
      bgColor = "bg-gray-400";
      displayName = "Road";
    } else {
      // Define building types based on position
      if ((row < 2 && col < 2) || (row < 2 && col > 8) || (row > 8 && col < 2) || (row > 8 && col > 8)) {
        // Corners: Restaurants
        type = "restaurant";
        bgColor = "bg-red-100";
        displayName = "Restaurant";
      } else if ((row < 2 && col >= 3 && col <= 7) || (row > 8 && col >= 3 && col <= 7)) {
        // Top/Bottom center: Offices
        type = "office";
        bgColor = "bg-blue-100";
        displayName = "Office";
      } else if ((col < 2 && row >= 3 && row <= 7) || (col > 8 && row >= 3 && row <= 7)) {
        // Left/Right center: Stores
        type = "store";
        bgColor = "bg-green-100";
        displayName = "Store";
      } else {
        // Center areas: Homes
        type = "home";
        bgColor = "bg-gray-50";
        displayName = "Home";
      }
    }

    const hasJob = jobs.some(
      (job) =>
        (job.pickup.row === row && job.pickup.col === col) ||
        (job.dropoff.row === row && job.dropoff.col === col)
    );

    return {
      id: `${row}-${col}`,
      type,
      hasJob,
      row,
      col,
      emoji: displayName.charAt(0),
      isStreet: isRoad,
      displayName,
      bgColor,
    };
  };

    const getTileStyle = (tile: CityTile, hasJob: boolean) => {
    let baseClass = `relative w-full h-full border border-gray-300 transition-all duration-200 cursor-pointer hover:opacity-80 `;
    
    if (tile.isStreet) {
      baseClass += "bg-gray-400 border-gray-500 "; // Road color
    } else {
      baseClass += tile.bgColor || "bg-white ";
    }
    
    if (hasJob) {
      baseClass += "ring-2 ring-blue-400 ring-offset-1 ";
    }
    
    return baseClass;
  };

  const getWorkerAtPosition = (row: number, col: number) => {
    return workers.find(
      (worker) => worker.position.row === row && worker.position.col === col
    );
  };

  const isPickupLocation = (row: number, col: number) => {
    return jobs.some(job => 
      job.pickup.row === row && 
      job.pickup.col === col && 
      job.status === "assigned" // Only show pickup after job is assigned
    );
  };

  const isDropoffLocation = (row: number, col: number) => {
    return jobs.some(job => 
      job.dropoff.row === row && 
      job.dropoff.col === col && 
      job.status === "assigned" // Only show dropoff after job is assigned
    );
  };

  const isPendingJobLocation = (row: number, col: number) => {
    return jobs.some(job => 
      (job.pickup.row === row && job.pickup.col === col) && 
      job.status === "pending" // Show star for pending jobs at pickup location
    );
  };

  const getWorkerDisplay = (worker: Worker) => {
    // Show bike emoji for workers (future: car emoji if they have vehicles)
    if (worker.isWorking) {
      return (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-10 h-10 flex items-center justify-center animate-pulse bg-blue-100 rounded-full border-2 border-blue-500 shadow-lg">
            <span className="text-xl">🚴</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white text-xs flex items-center justify-center text-white font-bold shadow-md">
            {worker.name.charAt(0)}
          </div>
        </div>
      );
    } else {
      return (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full border-2 border-gray-500 shadow-lg">
            <span className="text-xl">🧍</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-white text-xs flex items-center justify-center text-white font-bold shadow-md">
            {worker.name.charAt(0)}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center flex items-center gap-2">
        <h2 className="text-lg font-bold">🚚 DELIVERY MAP</h2>
      </div>

      <div className="grid grid-cols-10 gap-0 p-4 bg-gray-200 rounded-lg shadow-lg border-2 border-gray-300">
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const tile = generateTile(row, col);
            const worker = getWorkerAtPosition(row, col);
            const isPickup = isPickupLocation(row, col);
            const isDropoff = isDropoffLocation(row, col);
            const isPending = isPendingJobLocation(row, col);

            return (
              <div
                key={`${row}-${col}`}
                className={getTileStyle(tile, isPickup || isDropoff)}
                onClick={() => onTileClick(row, col)}
                title={`${tile.displayName} (${row}, ${col})`}
              >
                {/* Building content - only show on non-roads */}
                {!tile.isStreet && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded border border-gray-400 flex items-center justify-center text-xs font-semibold text-gray-700">
                      {tile.displayName?.charAt(0)}
                    </div>
                  </div>
                )}

                {/* Road markings */}
                {tile.isStreet && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1 h-6 bg-yellow-300 opacity-70"></div>
                  </div>
                )}

                {/* Worker display */}
                {worker && getWorkerDisplay(worker)}

                {/* Pending job indicator - Gold star */}
                {isPending && (
                  <div className="absolute top-1 left-1 w-4 h-4 z-20">
                    <span className="text-lg animate-pulse">⭐</span>
                  </div>
                )}

                {/* Pickup indicator - Green circle with P (only when assigned) */}
                {isPickup && (
                  <div className="absolute top-1 left-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg z-20 animate-pulse">
                    <div className="text-xs text-white font-bold flex items-center justify-center w-full h-full">
                      P
                    </div>
                  </div>
                )}
                
                {/* Dropoff indicator - Red circle with D (only when assigned) */}
                {isDropoff && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg z-20 animate-pulse">
                    <div className="text-xs text-white font-bold flex items-center justify-center w-full h-full">
                      D
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-100 border border-gray-400 rounded"></div>
          <span>Restaurants</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-100 border border-gray-400 rounded"></div>
          <span>Offices</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-100 border border-gray-400 rounded"></div>
          <span>Stores</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-50 border border-gray-400 rounded"></div>
          <span>Homes</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded"></div>
          <span>Roads</span>
        </div>
      </div>
      
      <div className="flex gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="text-lg">🚴</span>
          <span>Worker Traveling</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg">🧍</span>
          <span>Worker Idle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded-full border border-white flex items-center justify-center text-xs text-white font-bold">P</div>
          <span>Pickup Location</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center text-xs text-white font-bold">D</div>
          <span>Dropoff Location</span>
        </div>
      </div>
    </div>
  );
};

export default CityGrid;
