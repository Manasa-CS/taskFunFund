import type { WeeklyReport } from './reports'
import { formatMoney } from './fund'
import type { CertificateType, Rates } from '@/store/types'

export interface CertificateSuggestion {
  type: CertificateType
  title: string
  message: string
}

const FUND_BUILDER_MILESTONE_CENTS = 100 // "first dollar"
const SUPER_LEARNER_THRESHOLD = 10
const STREAK_MASTER_THRESHOLD = 5
const SAVINGS_MILESTONES = [50, 100, 250, 500, 1000, 2500, 5000]

/** The largest milestone newly crossed between two balances, if any. */
function crossedMilestone(before: number, now: number, milestones: number[]): number | undefined {
  let crossed: number | undefined
  for (const milestone of milestones) {
    if (before < milestone && now >= milestone) crossed = milestone
  }
  return crossed
}

/**
 * Suggests certificates worth issuing for a kid's week, based on their report and
 * whether a lifetime or Savings milestone was just crossed.
 */
export function suggestCertificates(args: {
  kidName: string
  report: WeeklyReport
  lifetimeMoneyUnitsBeforeWeek: number
  lifetimeMoneyUnitsNow: number
  savingsBalanceBeforeWeek: number
  savingsBalanceNow: number
  savingsGoal?: { title: string; cost: number }
  rates: Rates
}): CertificateSuggestion[] {
  const {
    kidName,
    report,
    lifetimeMoneyUnitsBeforeWeek,
    lifetimeMoneyUnitsNow,
    savingsBalanceBeforeWeek,
    savingsBalanceNow,
    savingsGoal,
    rates,
  } = args
  const suggestions: CertificateSuggestion[] = []

  if (report.taskDayCount > 0 && report.daysTargetHit === report.taskDayCount) {
    suggestions.push({
      type: 'taskHero',
      title: 'Task Hero',
      message: `${kidName} hit the daily target every single scheduled day this week!`,
    })
  }

  if (report.bestStreakInWeek >= STREAK_MASTER_THRESHOLD) {
    suggestions.push({
      type: 'streakMaster',
      title: 'Streak Master',
      message: `${kidName} kept a ${report.bestStreakInWeek}-day streak going strong!`,
    })
  }

  const savingsMilestone = crossedMilestone(savingsBalanceBeforeWeek, savingsBalanceNow, SAVINGS_MILESTONES)
  if (savingsMilestone !== undefined) {
    suggestions.push({
      type: 'superSaver',
      title: 'Super Saver',
      message: `${kidName}'s locked Savings just passed ${savingsMilestone} points!`,
    })
  }

  if (report.pointsFromActivities >= SUPER_LEARNER_THRESHOLD) {
    suggestions.push({
      type: 'superLearner',
      title: 'Super Learner',
      message: `${kidName} earned ${report.pointsFromActivities} points from activities this week!`,
    })
  }

  if (
    lifetimeMoneyUnitsBeforeWeek < FUND_BUILDER_MILESTONE_CENTS &&
    lifetimeMoneyUnitsNow >= FUND_BUILDER_MILESTONE_CENTS
  ) {
    suggestions.push({
      type: 'fundBuilder',
      title: 'Fund Builder',
      message: `${kidName}'s fund just reached ${formatMoney(lifetimeMoneyUnitsNow, rates)} — a huge milestone!`,
    })
  }

  if (savingsGoal && savingsBalanceBeforeWeek < savingsGoal.cost && savingsBalanceNow >= savingsGoal.cost) {
    suggestions.push({
      type: 'goalGetter',
      title: 'Goal Getter',
      message: `${kidName} saved enough for "${savingsGoal.title}" — goal reached! 🎯`,
    })
  }

  return suggestions
}
