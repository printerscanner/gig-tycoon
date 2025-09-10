import React from 'react';
import type { CityTile, Worker, Job } from '@/types';

interface CityGridProps {
  workers: Worker[];
  jobs: Job[];
  onTileClick: (row: number, col: number) => void;
}

const GRID_SIZE = 8; // Smaller 8x8 grid for MVP

const CityGrid: React.FC<CityGridProps> = ({ workers, jobs, onTileClick }) => {
  const generateTile = (row: number, col: number): CityTile => {
    // Create a more interesting city layout
    const cityLayout = [
      ['🍕', '🏠', '🏠', '🏢', '🏢', '🏠', '🏠', '🌳'],
      ['🏠', '🏠', '🛒', '🏢', '🏢', '🏥', '🏠', '🏠'],
      ['🏪', '🏠', '🏠', '🏢', '🏢', '🏠', '🏠', '🚗'],
      ['🏠', '🏠', '🏪', '🏢', '🏢', '🏠', '🍔', '🏠'],
      ['🏠', '🏥', '🏠', '🏢', '🏢', '🏠', '🏠', '🏠'],
      ['🌳', '🏠', '🏠', '🏢', '🏢', '🛒', '🏠', '🏠'],
      ['🏠', '🏠', '🏪', '🏢', '🏢', '🏠', '🏠', '🌳'],
      ['🏠', '🏠', '🏠', '🏠', '🏠', '🏠', '🏠', '🏠'],
    ];

    const emoji = cityLayout[row]?.[col] || '🏠';
    
    const typeMap: Record<string, CityTile['type']> = {
      '🍕': 'restaurant', '🍔': 'restaurant', '🏪': 'store',
      '🏠': 'home', '🏢': 'office', '🛒': 'store',
      '🏥': 'office', '🌳': 'park', '🚗': 'store'
    };

    const hasJob = jobs.some(job => 
      (job.pickup.row === row && job.pickup.col === col) ||
      (job.dropoff.row === row && job.dropoff.col === col)
    );
    
    return {
      id: `${row}-${col}`,
      type: typeMap[emoji] || 'home',
      hasJob,
      row,
      col,
      emoji
    };
  };

  const getTileStyle = (hasWorker: boolean, hasJob: boolean) => {
    let baseStyle = 'w-12 h-12 border border-gray-300 cursor-pointer flex flex-col items-center justify-center text-lg relative transition-all hover:border-black hover:scale-105';
    
    if (hasJob) {
      baseStyle += ' ring-2 ring-yellow-400 animate-pulse';
    }
    
    if (hasWorker) {
      baseStyle += ' ring-2 ring-blue-500';
    }
    
    return baseStyle;
  };

  const getWorkerAtPosition = (row: number, col: number) => {
    return workers.find(worker => worker.position.row === row && worker.position.col === col);
  };

  const getJobAtPosition = (row: number, col: number) => {
    return jobs.find(job => 
      (job.pickup.row === row && job.pickup.col === col) ||
      (job.dropoff.row === row && job.dropoff.col === col)
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-lg font-bold">🏙️ DOWNTOWN DISTRICT</h2>
        <p className="text-sm text-gray-600">Click to move selected workers • Yellow pulse = Job available</p>
      </div>
      
      <div className="grid grid-cols-8 gap-1 p-4 bg-gray-100 rounded-lg shadow-lg">
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const tile = generateTile(row, col);
            const worker = getWorkerAtPosition(row, col);
            const job = getJobAtPosition(row, col);
            
            return (
              <div
                key={`${row}-${col}`}
                className={getTileStyle(!!worker, !!job)}
                onClick={() => onTileClick(row, col)}
                title={`${tile.emoji} ${tile.type} (${row}, ${col})`}
              >
                {/* Building emoji */}
                <span className="text-base">{tile.emoji}</span>
                
                {/* Worker indicator */}
                {worker && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white text-xs flex items-center justify-center text-white font-bold">
                    {worker.name.charAt(0)}
                  </div>
                )}
                
                {/* Job indicator */}
                {job && !worker && (
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="flex gap-4 text-xs text-gray-600">
        <span>🍕🍔 Restaurants</span>
        <span>🏠 Homes</span>
        <span>🏢 Offices</span>
        <span>🛒🏪 Stores</span>
        <span>🌳 Parks</span>
      </div>
    </div>
  );
};

export default CityGrid;
