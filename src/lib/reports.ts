import { addDays } from 'date-fns'
import type { LogEntry, Rates, Spend, Task } from '@/store/types'
import {
  earnedInWeek,
  pointsToStars,
  savingsEarnedInWeek,
  spentInWeek,
  starsToMoneyUnits,
  walletEarnedInWeek,
} from './fund'
import { getWeekRange, toDateISO } from './dates'
import { isAllDueTasksDoneOn } from './streaks'
import { tasksDueOn } from './schedule'

type WeekStartsOn = Parameters<typeof getWeekRange>[1]

export interface DailyPoints {
  dateISO: string
  points: number
}

export interface WeeklyReport {
  weekKey: string
  kidId: string
  pointsFromTasks: number
  pointsFromActivities: number
  pointsFromBonus: number
  /** Points deducted for misbehavior this week — zero or negative. */
  pointsFromPenalties: number
  totalEarned: number
  stars: number
  moneyUnits: number
  daysTargetHit: number
  taskDayCount: number
  taskCompletionPct: number
  bestStreakInWeek: number
  funSessionsCount: number
  funMinutes: number
  screenTimeMinutesBought: number
  totalSpent: number
  netSavedPoints: number
  /** Points swept into locked Savings this week. */
  pointsToSavings: number
  /** Points swept into the spend wallet this week. */
  pointsToWallet: number
  /** Points pulled out of locked Savings via an approved withdrawal this week. */
  savingsWithdrawnThisWeek: number
  dailyBreakdown: DailyPoints[]
}

function approved(entries: LogEntry[]): LogEntry[] {
  return entries.filter((e) => e.approved !== false)
}

function sumPoints(entries: LogEntry[]): number {
  return entries.reduce((sum, e) => sum + e.points, 0)
}

/** Builds a full weekly report for one kid from their tasks, activities, logs and spends. */
export function buildWeeklyReport(args: {
  kidId: string
  weekKey: string
  weekStartsOn: WeekStartsOn
  rates: Rates
  dailyPointsTarget: number
  tasks: Task[]
  logEntries: LogEntry[]
  spends: Spend[]
}): WeeklyReport {
  const { kidId, weekKey, weekStartsOn, rates, dailyPointsTarget, tasks, logEntries, spends } = args

  const kidTasks = tasks.filter((t) => t.kidId === kidId)
  const weekEntries = approved(logEntries.filter((e) => e.kidId === kidId && e.weekKey === weekKey))
  const weekSpends = spends.filter((s) => s.kidId === kidId && s.weekKey === weekKey)

  const pointsFromTasks = sumPoints(weekEntries.filter((e) => e.sourceType === 'task'))
  const pointsFromActivities = sumPoints(weekEntries.filter((e) => e.sourceType === 'activity'))
  const pointsFromBonus = sumPoints(weekEntries.filter((e) => e.sourceType === 'bonus'))
  const pointsFromPenalties = sumPoints(weekEntries.filter((e) => e.sourceType === 'penalty'))
  const totalEarned = earnedInWeek(logEntries, kidId, weekKey)
  const { stars } = pointsToStars(totalEarned, rates)
  const moneyUnits = starsToMoneyUnits(stars, rates)

  const { start } = getWeekRange(weekKey, weekStartsOn)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  const dailyBreakdown: DailyPoints[] = days.map((day) => {
    const dateISO = toDateISO(day)
    const points = sumPoints(weekEntries.filter((e) => e.dateISO === dateISO))
    return { dateISO, points }
  })

  const daysTargetHit = dailyBreakdown.filter((d) => d.points >= dailyPointsTarget && dailyPointsTarget > 0).length

  const taskDays = days.filter((day) => tasksDueOn(kidTasks, day).length > 0)
  const taskDayCount = taskDays.length
  let totalDue = 0
  let totalDone = 0
  for (const day of taskDays) {
    const due = tasksDueOn(kidTasks, day)
    const dateISO = toDateISO(day)
    const doneIds = new Set(
      weekEntries.filter((e) => e.sourceType === 'task' && e.dateISO === dateISO).map((e) => e.sourceId),
    )
    totalDue += due.length
    totalDone += due.filter((t) => doneIds.has(t.id)).length
  }
  const taskCompletionPct = totalDue === 0 ? 0 : Math.round((totalDone / totalDue) * 100)

  let bestStreakInWeek = 0
  let current = 0
  for (const day of days) {
    if (tasksDueOn(kidTasks, day).length === 0) continue
    if (isAllDueTasksDoneOn(kidTasks, weekEntries, kidId, day)) {
      current += 1
      bestStreakInWeek = Math.max(bestStreakInWeek, current)
    } else {
      current = 0
    }
  }

  const funEntries = weekEntries.filter((e) => e.sourceType === 'fun')
  const funSessionsCount = funEntries.length
  const funMinutes = funEntries.reduce((sum, e) => sum + (e.minutes ?? 0), 0)

  const screenTimeMinutesBought = weekSpends
    .filter((s) => s.kind === 'screenTime')
    .reduce((sum, s) => sum + (s.minutes ?? 0), 0)

  const totalSpent = spentInWeek(spends, kidId, weekKey)
  const pointsToSavings = savingsEarnedInWeek(logEntries, kidId, weekKey)
  const pointsToWallet = walletEarnedInWeek(logEntries, kidId, weekKey)
  const savingsWithdrawnThisWeek = weekSpends
    .filter((s) => s.kind === 'savingsWithdrawal')
    .reduce((sum, s) => sum + s.points, 0)

  return {
    weekKey,
    kidId,
    pointsFromTasks,
    pointsFromActivities,
    pointsFromBonus,
    pointsFromPenalties,
    totalEarned,
    stars,
    moneyUnits,
    daysTargetHit,
    taskDayCount,
    taskCompletionPct,
    bestStreakInWeek,
    funSessionsCount,
    funMinutes,
    screenTimeMinutesBought,
    totalSpent,
    netSavedPoints: totalEarned - totalSpent,
    pointsToSavings,
    pointsToWallet,
    savingsWithdrawnThisWeek,
    dailyBreakdown,
  }
}

export interface WeekTotal {
  weekKey: string
  earned: number
  spent: number
  stars: number
  moneyUnits: number
  savingsEarned: number
}

/** Lists every week a kid has any activity in, oldest first, with each week's totals. */
export function listWeeklyTotals(logEntries: LogEntry[], spends: Spend[], kidId: string, rates: Rates): WeekTotal[] {
  const weekKeys = new Set<string>()
  for (const e of logEntries) if (e.kidId === kidId) weekKeys.add(e.weekKey)
  for (const s of spends) if (s.kidId === kidId) weekKeys.add(s.weekKey)

  return Array.from(weekKeys)
    .sort()
    .map((weekKey) => {
      const earned = earnedInWeek(logEntries, kidId, weekKey)
      const spent = spentInWeek(spends, kidId, weekKey)
      const { stars } = pointsToStars(earned, rates)
      return {
        weekKey,
        earned,
        spent,
        stars,
        moneyUnits: starsToMoneyUnits(stars, rates),
        savingsEarned: savingsEarnedInWeek(logEntries, kidId, weekKey),
      }
    })
}

/** A short, kind one-line summary of a kid's week for the top of their report. */
export function summarizeWeek(kidName: string, report: WeeklyReport, rates: Rates): string {
  const moneyPhrase =
    report.moneyUnits > 0
      ? `grew her fund by ${report.moneyUnits} ${rates.moneyUnit}${report.moneyUnits === 1 ? '' : 's'}`
      : 'kept building toward the next star'
  if (report.taskDayCount === 0) {
    return `${kidName} had a flexible week — ${report.totalEarned} points earned overall!`
  }
  return `${kidName} hit her target ${report.daysTargetHit} of ${report.taskDayCount} days and ${moneyPhrase}!`
}
