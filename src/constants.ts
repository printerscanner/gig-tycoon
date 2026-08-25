import type { Pos, Courier } from './types'
import { rnd } from './engine'

// ── Time ─────────────────────────────────────────────────────────────────────
export const TICK_MS = 400
export const TICKS_PER_DAY = 24

// ── Map ──────────────────────────────────────────────────────────────────────
export const MAP_W = 22
export const MAP_H = 9

// Fixed pickup spots. Label is what shows on the map.
export const RESTAURANTS: { label: string; name: string; pos: Pos }[] = [
  { label: 'A', name: 'Burger Barn',   pos: { x: 2,  y: 1 } },
  { label: 'B', name: 'Pizza Palace',  pos: { x: 13, y: 1 } },
  { label: 'C', name: 'Sushi Stop',    pos: { x: 6,  y: 5 } },
  { label: 'D', name: 'Taco Town',     pos: { x: 17, y: 5 } },
]

// Fixed dropoff spots. Show as * on the map when a delivery is headed there.
export const DROPOFFS: { name: string; pos: Pos }[] = [
  { name: 'Station Sq', pos: { x: 10, y: 0 } },
  { name: 'Hill Blvd',  pos: { x: 19, y: 2 } },
  { name: 'Oak St',     pos: { x: 4,  y: 3 } },
  { name: 'Park Ave',   pos: { x: 14, y: 4 } },
  { name: 'River Rd',   pos: { x: 1,  y: 7 } },
  { name: 'Market Sq',  pos: { x: 11, y: 8 } },
]

// Couriers spawn here
export const DEPOT: Pos = { x: 10, y: 4 }

export const NAMES = ['Arif', 'Tanvir', 'Mehedi', 'Riley', 'Arjun', 'Casey', 'Taylor']

export const COURIERS: Courier[] = [{ id: 'c1', name: NAMES[rnd(0, NAMES.length)], pos: { ...DEPOT }, status: 'idle', income: 0, jobId: null }]


// ── Economy ───────────────────────────────────────────────────────────────────
export const PRESEED_INVESTMENT = 600
export const GAMEOVER_CASH = -300
export const COURIER_HIRE_COST = 200
export const COURIER_INCOME_MIN = 2
export const COURIER_INCOME_MAX = 5
export const JOB_PAYOUT_MIN = 14
export const JOB_PAYOUT_MAX = 28

// ── Jobs ─────────────────────────────────────────────────────────────────────
export const JOB_SPAWN_INTERVAL = 5     
export const MAX_PENDING_JOBS = 4

// ── Log ──────────────────────────────────────────────────────────────────────
export const LOG_MAX = 5
