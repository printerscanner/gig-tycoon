import { create } from 'zustand'
import type { GameState } from './types'
import { INITIAL_CASH, COURIER_HIRE_COST, DEPOT, LOG_MAX } from './constants'
import { tick } from './engine'

const NAMES = ['Alex', 'Sam', 'Jordan', 'Riley', 'Morgan', 'Casey', 'Taylor']

function fresh(): GameState {
  return {
    phase: 'running',
    day: 1,
    tickOfDay: 0,
    cash: INITIAL_CASH,
    couriers: [{ id: 'c1', name: 'Alex', pos: { ...DEPOT }, status: 'idle', jobId: null }],
    jobs: [],
    log: ['game started'],
  }
}

interface Actions {
  advance: () => void
  hireCourier: () => void
  togglePause: () => void
  restart: () => void
}

export type GameStore = GameState & Actions

let nextCourierId = 1

export const useGameStore = create<GameStore>((set) => ({
  ...fresh(),

  advance: () => set(state => tick(state)),

  hireCourier: () =>
    set(state => {
      if (state.cash < COURIER_HIRE_COST) return {}
      nextCourierId++
      const name = NAMES[nextCourierId % NAMES.length]
      return {
        cash: state.cash - COURIER_HIRE_COST,
        couriers: [
          ...state.couriers,
          { id: `c${nextCourierId}`, name, pos: { ...DEPOT }, status: 'idle' as const, jobId: null },
        ],
        log: [`hired ${name}`, ...state.log].slice(0, LOG_MAX),
      }
    }),

  togglePause: () =>
    set(state => ({ phase: state.phase === 'running' ? 'paused' : 'running' })),

  restart: () => {
    nextCourierId = 1
    set(fresh())
  },
}))
