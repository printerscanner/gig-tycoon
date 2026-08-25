import type { Pos, Courier } from './types'
import { rnd } from './engine'

// ── Time ─────────────────────────────────────────────────────────────────────
export const MS_PER_HOUR = 400
export const HOURS_PER_DAY = 24

// ── Map ──────────────────────────────────────────────────────────────────────
export const MAP_W = 22
export const MAP_H = 9

export const RESTAURANTS: { name: string; pos: Pos }[] = [
  { name: 'AL-Faisal',    pos: { x: 2,  y: 1 } },
  { name: 'Gazzo',        pos: { x: 13, y: 1 } },
  { name: 'Azzam',        pos: { x: 6,  y: 5 } },
  { name: 'Brammibal',    pos: { x: 17, y: 5 } },
]

export const DROPOFFS: { name: string; pos: Pos }[] = [
  { name: 'Karl-Marx-Str.',   pos: { x: 10, y: 0 } },
  { name: 'Weserstr.',        pos: { x: 19, y: 2 } },
  { name: 'Sonnenallee',      pos: { x: 4,  y: 3 } },
  { name: 'Hermannstr.',      pos: { x: 14, y: 4 } },
  { name: 'Reuterstr.',       pos: { x: 1,  y: 7 } },
  { name: 'Pannierstr.',      pos: { x: 11, y: 8 } },
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
export const COURIER_INCOME_MAX = 5.99
export const JOB_PAYOUT_MIN = 14
export const JOB_PAYOUT_MAX = 28

// ── Jobs ─────────────────────────────────────────────────────────────────────
export const JOB_SPAWN_INTERVAL = 5     
export const MAX_PENDING_JOBS = 4

// ── Log ──────────────────────────────────────────────────────────────────────
export const LOG_MAX = 5

export const INITIAL_TOAST = {id: 1, message: "Welcome to GIG TYCOON. You've bootstrapped a generous pre-seed investment from friends and family to start a new food delivery startup. Do you have what it takes to make it in this packed market?"}