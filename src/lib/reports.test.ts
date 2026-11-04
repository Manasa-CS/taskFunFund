import { describe, expect, it } from 'vitest'
import type { LogEntry, Rates, Spend, Task } from '@/store/types'
import { buildWeeklyReport, listWeeklyTotals, summarizeWeek } from './reports'

const kidId = 'kid-1'
const rates: Rates = { pointsPerStar: 5, starsPerMoneyUnit: 5, moneyUnit: 'cent', currency: 'USD' }
const weekStartsOn = 1
// 2026-03-16 is a Monday -> week 2026-W12, days Mon 03-16 .. Sun 03-22
const weekKey = '2026-W12'

function task(id: string, daysOfWeek: Task['daysOfWeek'] = [1, 2, 3, 4, 5]): Task {
  return { id, kidId, title: id, icon: '✅', points: 2, daysOfWeek, timeOfDay: 'morning', active: true }
}

/** Defaults to a 100%-to-wallet split (toSpend = points) unless overridden. */
function entry(overrides: Partial<LogEntry> & Pick<LogEntry, 'sourceId' | 'dateISO' | 'points'>): LogEntry {
  return {
    id: Math.random().toString(),
    kidId,
    sourceType: 'task',
    weekKey,
    toSpend: overrides.points,
    toSavings: 0,
    ...overrides,
  }
}

function spend(overrides: Partial<Spend> & Pick<Spend, 'points' | 'dateISO'>): Spend {
  return { id: Math.random().toString(), kidId, kind: 'reward', refId: 'r1', weekKey, ...overrides }
}

describe('buildWeeklyReport', () => {
  it('splits points earned by source and matches earnedInWeek for the total', () => {
    const tasks = [task('t1')]
    const logEntries = [
      entry({ sourceId: 't1', dateISO: '2026-03-16', points: 2, sourceType: 'task' }),
      entry({ sourceId: 'a1', dateISO: '2026-03-16', points: 3, sourceType: 'activity' }),
      entry({ sourceId: 'allTasksBonus', dateISO: '2026-03-16', points: 1, sourceType: 'bonus' }),
    ]
    const report = buildWeeklyReport({
      kidId,
      weekKey,
      weekStartsOn,
      rates,
      dailyPointsTarget: 10,
      tasks,
      logEntries,
      spends: [],
    })
    expect(report.pointsFromTasks).toBe(2)
    expect(report.pointsFromActivities).toBe(3)
    expect(report.pointsFromBonus).toBe(1)
    expect(report.totalEarned).toBe(6)
  })

  it('counts days the daily target was hit', () => {
    const logEntries = [
      entry({ sourceId: 't1', dateISO: '2026-03-16', points: 10 }), // hit
      entry({ sourceId: 't1', dateISO: '2026-03-17', points: 4 }), // missed
    ]
    const report = buildWeeklyReport({
      kidId,
      weekKey,
      weekStartsOn,
      rates,
      dailyPointsTarget: 10,
      tasks: [],
      logEntries,
      spends: [],
    })
    expect(report.daysTargetHit).toBe(1)
  })

  it('computes task completion % across the week\'s task days only', () => {
    const tasks = [task('t1', [1, 2]), task('t2', [1, 2])] // Mon & Tue only
    const logEntries = [
      entry({ sourceId: 't1', dateISO: '2026-03-16', points: 2 }), // Mon: 1 of 2 done
      entry({ sourceId: 't1', dateISO: '2026-03-17', points: 2 }),
      entry({ sourceId: 't2', dateISO: '2026-03-17', points: 2 }), // Tue: 2 of 2 done
    ]
    const report = buildWeeklyReport({
      kidId,
      weekKey,
      weekStartsOn,
      rates,
      dailyPointsTarget: 10,
      tasks,
      logEntries,
      spends: [],
    })
    expect(report.taskDayCount).toBe(2)
    // 3 of 4 due-task-slots completed across the week
    expect(report.taskCompletionPct).toBe(75)
  })

  it('finds the best streak within the week, resetting after a missed task day', () => {
    const tasks = [task('t1', [1, 2, 3, 4, 5])]
    const logEntries = [
      entry({ sourceId: 't1', dateISO: '2026-03-16', points: 2 }), // Mon done
      entry({ sourceId: 't1', dateISO: '2026-03-17', points: 2 }), // Tue done
      // Wed missed
      entry({ sourceId: 't1', dateISO: '2026-03-19', points: 2 }), // Thu done
      entry({ sourceId: 't1', dateISO: '2026-03-20', points: 2 }), // Fri done
    ]
    const report = buildWeeklyReport({
      kidId,
      weekKey,
      weekStartsOn,
      rates,
      dailyPointsTarget: 10,
      tasks,
      logEntries,
      spends: [],
    })
    expect(report.bestStreakInWeek).toBe(2)
  })

  it('tallies fun minutes and screen time minutes bought', () => {
    const logEntries = [
      entry({ sourceId: 'f1', dateISO: '2026-03-16', points: 0, sourceType: 'fun', minutes: 15 }),
      entry({ sourceId: 'f2', dateISO: '2026-03-17', points: 0, sourceType: 'fun', minutes: 20 }),
    ]
    const spends = [spend({ points: 10, dateISO: '2026-03-16', kind: 'screenTime', minutes: 30 })]
    const report = buildWeeklyReport({
      kidId,
      weekKey,
      weekStartsOn,
      rates,
      dailyPointsTarget: 10,
      tasks: [],
      logEntries,
      spends,
    })
    expect(report.funSessionsCount).toBe(2)
    expect(report.funMinutes).toBe(35)
    expect(report.screenTimeMinutesBought).toBe(30)
    expect(report.totalSpent).toBe(10)
    expect(report.netSavedPoints).toBe(-10) // 0 earned - 10 spent
  })

  it('produces a 7-day breakdown spanning the whole week', () => {
    const report = buildWeeklyReport({
      kidId,
      weekKey,
      weekStartsOn,
      rates,
      dailyPointsTarget: 10,
      tasks: [],
      logEntries: [],
      spends: [],
    })
    expect(report.dailyBreakdown).toHaveLength(7)
    expect(report.dailyBreakdown[0].dateISO).toBe('2026-03-16')
    expect(report.dailyBreakdown[6].dateISO).toBe('2026-03-22')
  })
})

describe('listWeeklyTotals', () => {
  it('lists every week with activity, oldest first', () => {
    const logEntries = [
      entry({ sourceId: 't1', dateISO: '2026-03-02', points: 10, weekKey: '2026-W10' }),
      entry({ sourceId: 't1', dateISO: '2026-03-16', points: 25, weekKey: '2026-W12' }),
    ]
    const totals = listWeeklyTotals(logEntries, [], kidId, rates)
    expect(totals.map((t) => t.weekKey)).toEqual(['2026-W10', '2026-W12'])
    expect(totals[1].earned).toBe(25)
    expect(totals[1].stars).toBe(5)
    expect(totals[1].moneyUnits).toBe(1)
  })
})

describe('summarizeWeek', () => {
  it('names days hit and fund growth when there were task days', () => {
    const report = buildWeeklyReport({
      kidId,
      weekKey,
      weekStartsOn,
      rates,
      dailyPointsTarget: 10,
      tasks: [task('t1', [1])],
      logEntries: [entry({ sourceId: 't1', dateISO: '2026-03-16', points: 25 })],
      spends: [],
    })
    const line = summarizeWeek('Aria', report, rates)
    expect(line).toContain('Aria')
    expect(line).toContain('1 of 1 days')
    expect(line).toContain('1 cent')
  })

  it('falls back to a flexible-week message when there were no task days', () => {
    const report = buildWeeklyReport({
      kidId,
      weekKey,
      weekStartsOn,
      rates,
      dailyPointsTarget: 10,
      tasks: [],
      logEntries: [],
      spends: [],
    })
    expect(summarizeWeek('Aria', report, rates)).toContain('flexible week')
  })
})
