import { useGameStore } from './store'
import { useGameLoop } from './hooks/useGameLoop'
import { renderMap } from './map'
import { COURIER_HIRE_COST } from './constants'

export default function App() {
  useGameLoop()

  const state = useGameStore()
  const { phase, day, hour, cash, couriers, jobs, log, hireCourier, togglePause, restart } = state


  if (phase === 'gameover') {
    return (
      <pre>
        GAME OVER - cash ran out on day {day}{'\n\n'}
        <button onClick={restart}>restart</button>
      </pre>
    )
  }

  const pending = jobs.filter(j => j.status === 'pending')

  const lines: string[] = []
  lines.push(`GIG TYCOON  |  day ${day} | time ${hour}  |  cash $${cash}`)
  lines.push('')
  lines.push(renderMap(state))
  lines.push('')
  lines.push(`COURIERS (${couriers.length})`)
  for (const c of couriers) {
    const job = jobs.find(j => j.id === c.jobId)
    let status = 'idle'
    if (c.status === 'to_pickup' && job)  status = `going to pick up at ${job.pickupName}`
    if (c.status === 'to_dropoff' && job) status = `delivering to ${job.dropoffName}`
    lines.push(`  ${c.name.padEnd(8)} income: $${c.income} status: ${status}`)
  }
  lines.push('')
  if (pending.length > 0) {
    lines.push(`WAITING ORDERS (${pending.length})`)
    for (const j of pending) {
      lines.push(`  ${j.pickupName} -> ${j.dropoffName}  $${j.payout}`)
    }
    lines.push('')
  }
  lines.push('LOG')
  for (const l of log) lines.push(`  ${l}`)

  const canHire = cash >= COURIER_HIRE_COST

  return (
    <pre>
      {lines.join('\n')}
      {'\n\n'}
      <button onClick={hireCourier} disabled={!canHire}>hire courier (${COURIER_HIRE_COST})</button>
      {'  '}
      <button onClick={togglePause}>{phase === 'paused' ? 'resume' : 'pause'}</button>
    </pre>
  )
}
