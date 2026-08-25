import type { GameState } from './types'
import { MAP_W, MAP_H, RESTAURANTS } from './constants'

export function renderMap(state: GameState): string {
  // Each cell is 2 characters wide so emoji like 🛵 fit correctly.
  const grid: string[][] = Array.from(
    { length: MAP_H },
    () => Array(MAP_W).fill('. ')
  )

  // Pass 1: restaurants (always visible)
  for (const r of RESTAURANTS) {
    set(grid, r.pos.x, r.pos.y, '🏬')
  }

  // Pass 2: active dropoff targets
  for (const job of state.jobs) {
    if (job.status === 'active') {
      const { x, y } = job.dropoffPos

      if (grid[y]?.[x] === '. ') {
        set(grid, x, y, '🏠')
      }
    }
  }

  // Pass 3: couriers (draw on top of everything)
  for (const courier of state.couriers) {
    const { x, y } = courier.pos
    set(grid, x, y, '🛵')
  }

  // Each grid cell is 2 characters wide
  const border = '+' + '-'.repeat(MAP_W * 2) + '+'
  const rows = grid.map(row => '|' + row.join('') + '|')

  return [border, ...rows, border].join('\n')
}

function set(
  grid: string[][],
  x: number,
  y: number,
  char: string
) {
  if (
    y >= 0 &&
    y < grid.length &&
    x >= 0 &&
    x < grid[0].length
  ) {
    grid[y][x] = char
  }
}
