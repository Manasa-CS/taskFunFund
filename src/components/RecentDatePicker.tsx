import { addDays, format, subDays } from 'date-fns'
import { Button } from '@/components/Button'
import { parseDateISO, toDateISO } from '@/lib/dates'
import { useToday } from '@/lib/useToday'

interface RecentDatePickerProps {
  dateISO: string
  onChange: (dateISO: string) => void
  /** How many days back from today can be picked. Default 14 (two weeks). */
  maxDaysBack?: number
}

/** A kid-friendly day stepper for catching up on a recent day — bounded to today and `maxDaysBack` before it. */
export function RecentDatePicker({ dateISO, onChange, maxDaysBack = 14 }: RecentDatePickerProps) {
  const today = useToday()
  const todayISO = toDateISO(today)
  const oldestISO = toDateISO(subDays(today, maxDaysBack))
  const isToday = dateISO === todayISO
  const atOldest = dateISO <= oldestISO

  function shift(days: number) {
    const next = toDateISO(addDays(parseDateISO(dateISO), days))
    if (next < oldestISO || next > todayISO) return
    onChange(next)
  }

  const label = isToday ? 'Today' : format(parseDateISO(dateISO), 'EEE, MMM d')

  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="ghost" aria-label="Previous day" disabled={atOldest} onClick={() => shift(-1)}>
        ←
      </Button>
      <div className="min-w-24 text-center">
        <p className="font-display text-slate-700">{label}</p>
        {!isToday && (
          <button type="button" className="text-xs text-sky-600 underline" onClick={() => onChange(todayISO)}>
            Back to today
          </button>
        )}
      </div>
      <Button variant="ghost" aria-label="Next day" disabled={isToday} onClick={() => shift(1)}>
        →
      </Button>
    </div>
  )
}
