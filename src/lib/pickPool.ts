import type { Activity, LogEntry } from '@/store/types'
import { toDateISO } from './dates'

export interface PickOption {
  kind: 'activity'
  id: string
  title: string
  icon: string
  points: number
}

interface GetPickPoolArgs {
  kidId: string
  date: Date
  activities: Activity[]
  logEntries: LogEntry[]
}

/** Today's pickable activities for a kid: active and not already done today. */
export function getPickPool({ kidId, date, activities, logEntries }: GetPickPoolArgs): PickOption[] {
  const dateISO = toDateISO(date)
  const doneToday = new Set(
    logEntries
      .filter((l) => l.kidId === kidId && l.dateISO === dateISO && l.sourceType === 'activity')
      .map((l) => l.sourceId),
  )

  return activities
    .filter((a) => a.kidId === kidId && a.active && !doneToday.has(a.id))
    .map((a): PickOption => ({ kind: 'activity', id: a.id, title: a.title, icon: a.icon, points: a.points }))
}

/** Maps a pool onto exactly 6 die faces, cycling to fill when there are fewer than 6 options. */
export function diceFaces(pool: PickOption[]): PickOption[] {
  if (pool.length === 0) return []
  return Array.from({ length: 6 }, (_, i) => pool[i % pool.length])
}
