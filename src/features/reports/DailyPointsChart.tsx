import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import type { DailyPoints } from '@/lib/reports'

interface DailyPointsChartProps {
  days: DailyPoints[]
}

/** A single-series day-by-day bar chart of points earned, with a tap-to-reveal value. */
export function DailyPointsChart({ days }: DailyPointsChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const max = Math.max(1, ...days.map((d) => d.points))

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {days.map((day, i) => {
          const heightPct = (day.points / max) * 100
          const isActive = activeIndex === i
          return (
            <button
              key={day.dateISO}
              type="button"
              className="flex flex-1 flex-col items-center justify-end gap-1"
              style={{ height: '100%' }}
              onClick={() => setActiveIndex(isActive ? null : i)}
              aria-label={`${format(parseISO(day.dateISO), 'EEEE')}: ${day.points} points`}
            >
              {isActive && (
                <span className="font-display rounded-full bg-slate-700 px-2 py-0.5 text-xs text-white">
                  {day.points}
                </span>
              )}
              <div
                className="w-full rounded-t-md bg-mint-400"
                style={{ height: `${Math.max(4, heightPct)}%` }}
              />
            </button>
          )
        })}
      </div>
      <div className="mt-1 flex gap-2 border-t border-slate-200 pt-1">
        {days.map((day) => (
          <span key={day.dateISO} className="flex-1 text-center text-xs text-slate-400">
            {format(parseISO(day.dateISO), 'EEEEE')}
          </span>
        ))}
      </div>
    </div>
  )
}
