import { describe, expect, it } from 'vitest'
import type { LogEntry, Task } from '@/store/types'
import { getStreak, isAllDueTasksDoneOn } from './streaks'

const kidId = 'kid-1'

function task(id: string, daysOfWeek: Task['daysOfWeek']): Task {
  return {
    id,
    kidId,
    title: id,
    icon: '✅',
    points: 1,
    daysOfWeek,
    timeOfDay: 'morning',
    active: true,
  }
}

function log(sourceId: string, dateISO: string): LogEntry {
  return {
    id: `${sourceId}-${dateISO}`,
    kidId,
    sourceType: 'task',
    sourceId,
    points: 1,
    toSpend: 1,
    toSavings: 0,
    dateISO,
    weekKey: 'x',
  }
}

describe('isAllDueTasksDoneOn', () => {
  it('is false when nothing is scheduled that day', () => {
    const tasks = [task('t1', [1])] // Mondays only
    const sunday = new Date(2026, 2, 15) // a Sunday
    expect(isAllDueTasksDoneOn(tasks, [], kidId, sunday)).toBe(false)
  })

  it('is true only once every due task is logged', () => {
    const monday = new Date(2026, 2, 16)
    const tasks = [task('t1', [1]), task('t2', [1])]
    expect(isAllDueTasksDoneOn(tasks, [log('t1', '2026-03-16')], kidId, monday)).toBe(false)
    expect(
      isAllDueTasksDoneOn(tasks, [log('t1', '2026-03-16'), log('t2', '2026-03-16')], kidId, monday),
    ).toBe(true)
  })
})

describe('getStreak', () => {
  const everyDay = [0, 1, 2, 3, 4, 5, 6] as const
  const tasks = [task('t1', [...everyDay])]

  it('counts consecutive fully-completed days', () => {
    const today = new Date(2026, 2, 18) // Wed
    const logs = [
      log('t1', '2026-03-18'), // today
      log('t1', '2026-03-17'),
      log('t1', '2026-03-16'),
    ]
    expect(getStreak(tasks, logs, kidId, today)).toBe(3)
  })

  it('stops at the first past day that was missed', () => {
    const today = new Date(2026, 2, 18)
    const logs = [
      log('t1', '2026-03-18'),
      log('t1', '2026-03-17'),
      // 03-16 missing — streak should stop there
      log('t1', '2026-03-15'),
    ]
    expect(getStreak(tasks, logs, kidId, today)).toBe(2)
  })

  it('does not break the streak just because today is still in progress', () => {
    const today = new Date(2026, 2, 18)
    const logs = [log('t1', '2026-03-17'), log('t1', '2026-03-16')] // today not done yet
    expect(getStreak(tasks, logs, kidId, today)).toBe(2)
  })

  it('skips days with nothing scheduled without breaking the streak', () => {
    const weekdaysOnly = [task('t1', [1, 2, 3, 4, 5])] // Mon-Fri
    const friday = new Date(2026, 2, 20)
    const logs = [
      log('t1', '2026-03-20'), // Fri
      log('t1', '2026-03-19'), // Thu
      log('t1', '2026-03-18'), // Wed
      log('t1', '2026-03-17'), // Tue
      log('t1', '2026-03-16'), // Mon
      // weekend before that had nothing scheduled
      log('t1', '2026-03-13'), // Fri before
    ]
    expect(getStreak(weekdaysOnly, logs, kidId, friday)).toBe(6)
  })
})
