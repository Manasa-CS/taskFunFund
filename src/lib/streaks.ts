import { addDays } from 'date-fns'
import type { LogEntry, Task } from '@/store/types'
import { toDateISO } from './dates'
import { tasksDueOn } from './schedule'

/** True if every task due on this date for this kid has a matching log entry. */
export function isAllDueTasksDoneOn(
  kidTasks: Task[],
  logEntries: LogEntry[],
  kidId: string,
  date: Date,
): boolean {
  const due = tasksDueOn(kidTasks, date)
  if (due.length === 0) return false
  const dateISO = toDateISO(date)
  const doneIds = new Set(
    logEntries
      .filter((l) => l.kidId === kidId && l.sourceType === 'task' && l.dateISO === dateISO)
      .map((l) => l.sourceId),
  )
  return due.every((t) => doneIds.has(t.id))
}

/**
 * Counts consecutive days, walking back from `today`, where every scheduled task
 * was completed. Days with nothing scheduled don't break the streak. Today only
 * counts once it's fully done — an in-progress today never ends the streak early.
 */
export function getStreak(kidTasks: Task[], logEntries: LogEntry[], kidId: string, today: Date): number {
  let streak = 0
  let cursor = today
  let daysChecked = 0

  while (daysChecked < 400) {
    const due = tasksDueOn(kidTasks, cursor)
    if (due.length > 0) {
      const allDone = isAllDueTasksDoneOn(kidTasks, logEntries, kidId, cursor)
      if (allDone) {
        streak += 1
      } else if (daysChecked > 0) {
        break // a past day was missed — streak ends here
      }
      // else: today isn't finished yet, don't break, just don't count it
    }
    cursor = addDays(cursor, -1)
    daysChecked += 1
  }

  return streak
}
