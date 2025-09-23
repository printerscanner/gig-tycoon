import React from "react";
import type { CityTile, Worker, Job } from "@/types";

interface CityGridProps {
  workers: Worker[];
  jobs: Job[];
  onTileClick: (row: number, col: number) => void;
}

const GRID_SIZE = 12; // 12x12 grid for more compact view and support for multiple grids

const CityGrid: React.FC<CityGridProps> = ({ workers, jobs, onTileClick }) => {
  const generateTile = (row: number, col: number): CityTile => {
    // Create a delivery app style city with clear roads and districts
    let type: CityTile["type"] = "home";
    let isRoad = false;
    let bgColor = "";
    let displayName = "";

    // Define road network - roads every 3 tiles AND around the perimeter
    if (
      row % 3 === 0 ||
      col % 3 === 0 ||
      row === GRID_SIZE - 1 ||
      col === GRID_SIZE - 1
    ) {
      isRoad = true;
      type = "park"; // Use park type for roads
      bgColor = "bg-gray-400";
      displayName = "Road";
    } else {
      // Define building types based on districts
      const districtRow = Math.floor(row / 3);
      const districtCol = Math.floor(col / 3);

      // Create different districts
      if ((districtRow + districtCol) % 4 === 0) {
        // Business district
        type = "office";
        bgColor = "bg-blue-100";
        displayName = "Office";
      } else if ((districtRow + districtCol) % 4 === 1) {
        // Residential district
        type = "home";
        bgColor = "bg-gray-50";
        displayName = "Home";
      } else if ((districtRow + districtCol) % 4 === 2) {
        // Shopping district
        type = "store";
        bgColor = "bg-green-100";
        displayName = "Store";
      } else {
        // Restaurant district
        type = "restaurant";
        bgColor = "bg-red-100";
        displayName = "Restaurant";
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
      baseClass += "ring-1 ring-blue-400 ring-offset-1 ";
    }

    return baseClass;
  };

  const isPickupLocation = (row: number, col: number) => {
    return jobs.some((job) => {
      // Only show pickup if job is assigned and not yet picked up
      const worker = workers.find((w) => w.id === job.assignedWorkerId);
      return (
        job.pickup.row === row &&
        job.pickup.col === col &&
        job.status === "assigned" &&
        (!worker || !worker.hasPickedUpOrder)
      ); // Don't show if worker has picked up
    });
  };

  const isDropoffLocation = (row: number, col: number) => {
    return jobs.some(
      (job) =>
        job.dropoff.row === row &&
        job.dropoff.col === col &&
        job.status === "assigned" // Only show dropoff after job is assigned
    );
  };

  const isPendingJobLocation = (row: number, col: number) => {
    return jobs.some(
      (job) =>
        job.pickup.row === row &&
        job.pickup.col === col &&
        job.status === "pending" // Show star for pending jobs at pickup location
    );
  };

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="text-center flex items-center justify-center gap-2">
        <h2 className="text-lg font-bold">🚚 DELIVERY MAP</h2>
      </div>

      <div
        className="flex-1 grid gap-0 bg-gray-200 rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden mx-auto"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          maxWidth: "400px",
          maxHeight: "400px",
          aspectRatio: "1/1",
          width: "100%",
        }}
      >
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const tile = generateTile(row, col);
            const workersAtPosition = workers.filter(
              (worker) =>
                worker.position.row === row && worker.position.col === col
            );
            const isPickup = isPickupLocation(row, col);
            const isDropoff = isDropoffLocation(row, col);
            const isPending = isPendingJobLocation(row, col);

            return (
              <div
                key={`${row}-${col}`}
                className={getTileStyle(tile, isPickup || isDropoff)}
                onClick={() => onTileClick(row, col)}
                title={`${tile.displayName} (${row}, ${col})`}
                style={{ minHeight: "32px", minWidth: "32px" }}
              >
                {/* Building content - only show on non-roads */}
                {!tile.isStreet && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded border border-gray-400 flex items-center justify-center text-sm font-semibold text-gray-700">
                      {tile.displayName?.charAt(0)}
                    </div>
                  </div>
                )}

                {/* Road markings - better visibility for two-way traffic */}
                {tile.isStreet && (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="w-full h-1 bg-yellow-400 opacity-90 absolute"></div>
                    <div className="w-1 h-full bg-yellow-400 opacity-90 absolute"></div>
                  </div>
                )}

                {/* Multiple workers display - they can overlap */}
                {workersAtPosition.map((worker, index) => (
                  <div
                    key={worker.id}
                    className="absolute inset-0 flex items-center justify-center z-20"
                    style={{
                      transform: `translate(${index * 1}px, ${index * 1}px)`,
                      zIndex: 20 + index,
                    }}
                  >
                    {worker.isWorking ? (
                      <div className="w-6 h-6 flex items-center justify-center animate-pulse bg-blue-100 rounded-full border border-blue-500 shadow-lg">
                        <span className="text-sm">🚴</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full border border-gray-500 shadow-lg">
                        <span className="text-sm">🧍</span>
                      </div>
                    )}
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border border-white text-xs flex items-center justify-center text-white font-bold shadow-md"
                      style={{ fontSize: "8px" }}
                    >
                      {worker.name.charAt(0)}
                    </div>

                    {/* Pin indicator for workers carrying orders */}
                    {worker.hasPickedUpOrder && (
                      <div className="absolute -top-1 -left-1 w-4 h-4 z-30">
                        <span className="text-base animate-bounce">📌</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Pending job indicator - Gold star */}
                {isPending && (
                  <div className="absolute top-0 left-0 w-4 h-4 z-20">
                    <span className="text-base animate-pulse">⭐</span>
                  </div>
                )}

                {/* Pickup indicator - Green circle with P (only when assigned) */}
                {isPickup && (
                  <div className="absolute top-0 left-0 w-4 h-4 bg-green-500 rounded-full border border-white shadow-lg z-20 animate-pulse">
                    <div
                      className="text-xs text-white font-bold flex items-center justify-center w-full h-full"
                      style={{ fontSize: "10px" }}
                    >
                      P
                    </div>
                  </div>
                )}

                {/* Dropoff indicator - Red circle with D (only when assigned) */}
                {isDropoff && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border border-white shadow-lg z-20 animate-pulse">
                    <div
                      className="text-xs text-white font-bold flex items-center justify-center w-full h-full"
                      style={{ fontSize: "10px" }}
                    >
                      D
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-4 text-sm text-gray-600 justify-center flex-wrap">
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

      <div className="flex gap-4 text-sm text-gray-600 justify-center flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-base">🚴</span>
          <span>Working</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base">🧍</span>
          <span>Idle</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base">📌</span>
          <span>Carrying Order</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded-full border border-white flex items-center justify-center text-xs text-white font-bold">
            P
          </div>
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center text-xs text-white font-bold">
            D
          </div>
          <span>Dropoff</span>
        </div>
      </div>
    </div>
  );
};

export default CityGrid;
