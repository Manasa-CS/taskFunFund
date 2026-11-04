import { addDays, endOfWeek, format, startOfWeek } from 'date-fns'
import type { DayOfWeek } from '@/store/types'

const MS_PER_WEEK = 7 * 86_400_000

/** The Thursday that falls inside the week starting on `weekStart`, per the ISO week-date rule. */
function thursdayOf(weekStart: Date, weekStartsOn: DayOfWeek): Date {
  return addDays(weekStart, (4 - weekStartsOn + 7) % 7)
}

/** The Thursday of the week containing Jan 4 of `year` — the anchor for week 1. */
function firstThursdayOfYear(year: number, weekStartsOn: DayOfWeek): Date {
  const jan4 = new Date(year, 0, 4)
  return thursdayOf(startOfWeek(jan4, { weekStartsOn }), weekStartsOn)
}

/**
 * Returns a sortable "YYYY-Www" key for the week containing this date, given the
 * family's week-start day. Uses the ISO rule (the week's Thursday decides its
 * year/number) so it stays correct across year boundaries and DST changes.
 */
export function getWeekKey(date: Date, weekStartsOn: DayOfWeek): string {
  const weekStart = startOfWeek(date, { weekStartsOn })
  const thursday = thursdayOf(weekStart, weekStartsOn)
  const year = thursday.getFullYear()
  const weekNumber =
    Math.round((thursday.getTime() - firstThursdayOfYear(year, weekStartsOn).getTime()) / MS_PER_WEEK) + 1
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

/** Returns the [start, end] dates (inclusive) covered by a week key produced by getWeekKey. */
export function getWeekRange(
  weekKey: string,
  weekStartsOn: DayOfWeek,
): { start: Date; end: Date } {
  const [yearStr, weekStr] = weekKey.split('-W')
  const year = Number(yearStr)
  const week = Number(weekStr)

  const targetThursday = addDays(firstThursdayOfYear(year, weekStartsOn), (week - 1) * 7)
  const start = startOfWeek(targetThursday, { weekStartsOn })
  const end = endOfWeek(targetThursday, { weekStartsOn })
  return { start, end }
}

/** Formats a date as YYYY-MM-DD for use as a dateISO value. */
export function toDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Parses a YYYY-MM-DD string as a local-time date — avoids `new Date(str)`'s UTC-midnight day shift. */
export function parseDateISO(dateISO: string): Date {
  const [year, month, day] = dateISO.split('-').map(Number)
  return new Date(year, month - 1, day)
}
