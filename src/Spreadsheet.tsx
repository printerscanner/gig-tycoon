import { useState } from 'react'
import { useGameStore } from './store'
import "./css/spreadsheet.css"

export function Spreadsheet() {
  const [open, setOpen] = useState(false)

  const spreadsheet = useGameStore(s => s.spreadsheet)
  const cash = useGameStore(s => s.cash)
  const couriers = useGameStore(s => s.couriers)

  return (
    <>
      <button
        className="spreadsheet__open-button"
        onClick={() => setOpen(true)}
      >
        ▦
      </button>

      {open && (
        <div
          className="spreadsheet__overlay"
          onClick={() => setOpen(false)}
        >
          <div
            className="spreadsheet__modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="spreadsheet__header">
              <div>
                <div className="spreadsheet__title">
                  Company spreadsheet
                </div>

                <div className="spreadsheet__subtitle">
                  Business performance
                </div>
              </div>

              <button
                className="spreadsheet__close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="spreadsheet__spreadsheet">
              <div className="spreadsheet__row spreadsheet__row--header">
                <div>#</div>
                <div>Metric</div>
                <div>Value</div>
              </div>

              <MetricRow
                number={1}
                name="Orders completed"
                value={spreadsheet.ordersCompleted}
              />

              <MetricRow
                number={2}
                name="Customers"
                value={spreadsheet.customers}
              />

              <MetricRow
                number={3}
                name="Revenue"
                value={`€${spreadsheet.revenue}`}
              />

              <MetricRow
                number={4}
                name="GMV"
                value={`€${spreadsheet.gmv}`}
              />

              <MetricRow
                number={5}
                name="Cash"
                value={`€${cash}`}
              />

              <MetricRow
                number={6}
                name="Couriers"
                value={couriers.length}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MetricRow({
  number,
  name,
  value,
}: {
  number: number
  name: string
  value: string | number
}) {
  return (
    <div className="spreadsheet__row">
      <div className="spreadsheet__number">
        {number}
      </div>

      <div className="spreadsheet__name">
        {name}
      </div>

      <div className="spreadsheet__value">
        {value}
      </div>
    </div>
  )
}
