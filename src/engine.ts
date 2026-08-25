// ─── HOW TO ADD MECHANICS ────────────────────────────────────────────────────
// Add a labeled block in tick() below. Read from local copies of state,
// return new values at the bottom. Each mechanic is self-contained.

import type { GameState, Pos, Job } from './types'
import {
  TICKS_PER_DAY, GAMEOVER_CASH,
  JOB_SPAWN_INTERVAL, MAX_PENDING_JOBS,
  JOB_PAYOUT_MIN, JOB_PAYOUT_MAX, COURIER_INCOME_MIN, COURIER_INCOME_MAX,
  LOG_MAX, RESTAURANTS, DROPOFFS,
} from './constants'

let nextJobId = 1

export function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function spawnJob(): Job {
  const pickup = RESTAURANTS[rnd(0, RESTAURANTS.length - 1)]
  const dropoff = DROPOFFS[rnd(0, DROPOFFS.length - 1)]
  return {
    id: `j${nextJobId++}`,
    pickupPos: pickup.pos,
    pickupName: pickup.name,
    dropoffPos: dropoff.pos,
    dropoffName: dropoff.name,
    status: 'pending',
    courierId: null,
    payout: rnd(JOB_PAYOUT_MIN, JOB_PAYOUT_MAX),
  }
}

// Move one cell toward target. Horizontal first, then vertical.
function step(from: Pos, to: Pos): Pos {
  if (from.x !== to.x) return { x: from.x + Math.sign(to.x - from.x), y: from.y }
  if (from.y !== to.y) return { x: from.x, y: from.y + Math.sign(to.y - from.y) }
  return from
}

function same(a: Pos, b: Pos) {
  return a.x === b.x && a.y === b.y
}

export function tick(state: GameState): Partial<GameState> {
  if (state.phase !== 'running') return {}

  const nextTick = state.tickOfDay + 1
  const isNewDay = nextTick >= TICKS_PER_DAY
  const tickOfDay = isNewDay ? 0 : nextTick
  const day = isNewDay ? state.day + 1 : state.day

  let cash = state.cash

  const log = [...state.log]

  // ── Move couriers and resolve arrivals ────────────────────────────────────
  const jobs = state.jobs.map(j => ({ ...j }))
  const couriers = state.couriers.map(c => ({ ...c }))

  for (const courier of couriers) {
    const job = courier.jobId ? jobs.find(j => j.id === courier.jobId) : null

    if (courier.status === 'to_pickup' && job) {
      courier.pos = step(courier.pos, job.pickupPos)
      if (same(courier.pos, job.pickupPos)) {
        courier.status = 'to_dropoff'
        log.unshift(`${courier.name} picked up at ${job.pickupName}`)
      }
    } else if (courier.status === 'to_dropoff' && job) {
      courier.pos = step(courier.pos, job.dropoffPos)
      if (same(courier.pos, job.dropoffPos)) {
        job.status = 'complete'
        courier.income += rnd(COURIER_INCOME_MIN,COURIER_INCOME_MAX)
        cash += job.payout - courier.income
        courier.status = 'idle'
        courier.jobId = null
        log.unshift(`${courier.name} delivered to ${job.dropoffName}  +$${job.payout} income: $${courier.income}`)
      }
    }
  }

  // ── Assign idle couriers to pending jobs ──────────────────────────────────
  for (const courier of couriers) {
    if (courier.status === 'idle') {
      const job = jobs.find(j => j.status === 'pending')
      if (job) {
        courier.status = 'to_pickup'
        courier.jobId = job.id
        job.status = 'active'
        job.courierId = courier.id
        log.unshift(`${courier.name} accepted: ${job.pickupName} -> ${job.dropoffName}`)
      }
    }
  }

  // ── Spawn new job ─────────────────────────────────────────────────────────
  const pendingCount = jobs.filter(j => j.status === 'pending').length
  if (tickOfDay % JOB_SPAWN_INTERVAL === 0 && pendingCount < MAX_PENDING_JOBS) {
    jobs.push(spawnJob())
  }

  // ── Remove old completed jobs ─────────────────────────────────────────────
  const nextJobs = jobs.filter(j => j.status !== 'complete')

  // ── Trim log ──────────────────────────────────────────────────────────────
  const nextLog = log.slice(0, LOG_MAX)

  // ── Game over ─────────────────────────────────────────────────────────────
  const phase = cash <= GAMEOVER_CASH ? 'gameover' : state.phase

  return { day, tickOfDay, cash, couriers, jobs: nextJobs, log: nextLog, phase }
}
