import { describe, expect, it } from 'vitest'
import type { Rates } from '@/store/types'
import type { WeeklyReport } from './reports'
import { suggestCertificates } from './certificateSuggestions'

const rates: Rates = { pointsPerStar: 5, starsPerMoneyUnit: 5, moneyUnit: 'cent', currency: 'USD' }

function baseReport(overrides: Partial<WeeklyReport> = {}): WeeklyReport {
  return {
    weekKey: '2026-W12',
    kidId: 'kid-1',
    pointsFromTasks: 0,
    pointsFromActivities: 0,
    pointsFromBonus: 0,
    pointsFromPenalties: 0,
    totalEarned: 0,
    stars: 0,
    moneyUnits: 0,
    daysTargetHit: 0,
    taskDayCount: 0,
    taskCompletionPct: 0,
    bestStreakInWeek: 0,
    funSessionsCount: 0,
    funMinutes: 0,
    screenTimeMinutesBought: 0,
    totalSpent: 0,
    netSavedPoints: 0,
    pointsToSavings: 0,
    pointsToWallet: 0,
    savingsWithdrawnThisWeek: 0,
    dailyBreakdown: [],
    ...overrides,
  }
}

function suggest(overrides: Partial<Parameters<typeof suggestCertificates>[0]> = {}) {
  return suggestCertificates({
    kidName: 'Aria',
    report: baseReport(),
    lifetimeMoneyUnitsBeforeWeek: 0,
    lifetimeMoneyUnitsNow: 0,
    savingsBalanceBeforeWeek: 0,
    savingsBalanceNow: 0,
    rates,
    ...overrides,
  })
}

describe('suggestCertificates', () => {
  it('suggests Task Hero only when the target was hit every scheduled day', () => {
    const hit = suggest({ report: baseReport({ taskDayCount: 5, daysTargetHit: 5 }) })
    expect(hit.some((s) => s.type === 'taskHero')).toBe(true)

    const missed = suggest({ report: baseReport({ taskDayCount: 5, daysTargetHit: 4 }) })
    expect(missed.some((s) => s.type === 'taskHero')).toBe(false)
  })

  it('suggests Streak Master at 5+ consecutive days', () => {
    const suggestions = suggest({ report: baseReport({ bestStreakInWeek: 5 }) })
    expect(suggestions.some((s) => s.type === 'streakMaster')).toBe(true)
  })

  it('suggests Super Saver when Savings crosses a milestone this week', () => {
    const crossed = suggest({ savingsBalanceBeforeWeek: 40, savingsBalanceNow: 55 })
    expect(crossed.some((s) => s.type === 'superSaver')).toBe(true)

    const alreadyPast = suggest({ savingsBalanceBeforeWeek: 60, savingsBalanceNow: 70 })
    expect(alreadyPast.some((s) => s.type === 'superSaver')).toBe(false)

    const notYet = suggest({ savingsBalanceBeforeWeek: 10, savingsBalanceNow: 20 })
    expect(notYet.some((s) => s.type === 'superSaver')).toBe(false)
  })

  it('suggests Super Learner at 10+ activity points', () => {
    const suggestions = suggest({ report: baseReport({ pointsFromActivities: 10 }) })
    expect(suggestions.some((s) => s.type === 'superLearner')).toBe(true)
  })

  it('suggests Fund Builder only on the week the first-dollar milestone is crossed', () => {
    const crossedThisWeek = suggest({ lifetimeMoneyUnitsBeforeWeek: 95, lifetimeMoneyUnitsNow: 102 })
    expect(crossedThisWeek.some((s) => s.type === 'fundBuilder')).toBe(true)

    const alreadyPast = suggest({ lifetimeMoneyUnitsBeforeWeek: 150, lifetimeMoneyUnitsNow: 160 })
    expect(alreadyPast.some((s) => s.type === 'fundBuilder')).toBe(false)

    const notYet = suggest({ lifetimeMoneyUnitsBeforeWeek: 10, lifetimeMoneyUnitsNow: 20 })
    expect(notYet.some((s) => s.type === 'fundBuilder')).toBe(false)
  })

  it('suggests Goal Getter only when a pinned savings goal is reached this week', () => {
    const goal = { title: 'Bike', cost: 100 }
    const reached = suggest({ savingsGoal: goal, savingsBalanceBeforeWeek: 90, savingsBalanceNow: 105 })
    expect(reached.some((s) => s.type === 'goalGetter')).toBe(true)

    const notReached = suggest({ savingsGoal: goal, savingsBalanceBeforeWeek: 50, savingsBalanceNow: 80 })
    expect(notReached.some((s) => s.type === 'goalGetter')).toBe(false)

    const alreadyReached = suggest({ savingsGoal: goal, savingsBalanceBeforeWeek: 110, savingsBalanceNow: 120 })
    expect(alreadyReached.some((s) => s.type === 'goalGetter')).toBe(false)

    const noGoalPinned = suggest({ savingsBalanceBeforeWeek: 90, savingsBalanceNow: 105 })
    expect(noGoalPinned.some((s) => s.type === 'goalGetter')).toBe(false)
  })

  it('suggests nothing for an uneventful week', () => {
    expect(suggest()).toEqual([])
  })
})
