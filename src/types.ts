export type Phase = 'running' | 'paused' | 'gameover'
export type CourierStatus = 'idle' | 'to_pickup' | 'to_dropoff'
export type JobStatus = 'pending' | 'active' | 'complete'

export interface Pos { x: number; y: number }

export interface Courier {
  id: string
  name: string
  pos: Pos
  status: CourierStatus
  income: number
  jobId: string | null
}

export interface Job {
  id: string
  pickupPos: Pos
  pickupName: string
  dropoffPos: Pos
  dropoffName: string
  status: JobStatus
  courierId: string | null
  payout: number
}

export interface GameState {
  phase: Phase
  day: number
  tickOfDay: number
  cash: number
  couriers: Courier[]
  jobs: Job[]
  log: string[]
}
