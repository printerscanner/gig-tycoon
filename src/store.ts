import { create } from 'zustand'
import type { GameState } from './types'
import { PRESEED_INVESTMENT, COURIER_HIRE_COST, DEPOT, LOG_MAX, NAMES, COURIERS } from './constants'
import { tick } from './engine'


function fresh(): GameState {
  return {
    phase: 'running',
    day: 1,
    tickOfDay: 0,
    cash: PRESEED_INVESTMENT,
    couriers: COURIERS,
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
          { id: `c${nextCourierId}`, name, pos: { ...DEPOT }, income: 0, status: 'idle' as const, jobId: null },
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
