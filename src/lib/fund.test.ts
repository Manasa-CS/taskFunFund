import { describe, expect, it } from 'vitest'
import type { LogEntry, Rates, Spend } from '@/store/types'
import {
  earnedInWeek,
  earnedOn,
  formatMoney,
  lifetimeEarned,
  lifetimeSavingsEarned,
  lifetimeSavingsWithdrawn,
  lifetimeSpent,
  lifetimeWalletEarned,
  lifetimeWalletSpent,
  pointsToMoneyUnits,
  pointsToStars,
  savingsBalance,
  savingsEarnedInWeek,
  screenTimeCost,
  spentInWeek,
  starsToMoneyUnits,
  walletBalance,
  walletEarnedInWeek,
  walletSpentInWeek,
} from './fund'

const defaultRates: Rates = { pointsPerStar: 5, starsPerMoneyUnit: 5, moneyUnit: 'cent', currency: 'USD' }
const kidId = 'kid-1'

/** Defaults to a 100%-to-wallet split (toSpend = points) unless overridden, for tests unrelated to savings. */
function entry(points: number, overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: Math.random().toString(),
    kidId,
    sourceType: 'task',
    sourceId: 't1',
    points,
    toSpend: points,
    toSavings: 0,
    dateISO: '2026-03-16',
    weekKey: '2026-W12',
    ...overrides,
  }
}

function spend(points: number, overrides: Partial<Spend> = {}): Spend {
  return {
    id: Math.random().toString(),
    kidId,
    kind: 'reward',
    refId: 'r1',
    points,
    dateISO: '2026-03-16',
    weekKey: '2026-W12',
    ...overrides,
  }
}

describe('pointsToStars', () => {
  it('10 points -> 2 stars, 0 leftover', () => {
    expect(pointsToStars(10, defaultRates)).toEqual({ stars: 2, leftover: 0 })
  })
  it('13 points -> 2 stars + 3 leftover', () => {
    expect(pointsToStars(13, defaultRates)).toEqual({ stars: 2, leftover: 3 })
  })
  it('25 points -> 5 stars, 0 leftover', () => {
    expect(pointsToStars(25, defaultRates)).toEqual({ stars: 5, leftover: 0 })
  })
  it('0 points -> 0 stars, 0 leftover', () => {
    expect(pointsToStars(0, defaultRates)).toEqual({ stars: 0, leftover: 0 })
  })
})

describe('starsToMoneyUnits / pointsToMoneyUnits', () => {
  it('5 stars -> 1 cent', () => {
    expect(starsToMoneyUnits(5, defaultRates)).toBe(1)
  })
  it('25 points -> 5 stars -> 1 cent', () => {
    expect(pointsToMoneyUnits(25, defaultRates)).toBe(1)
  })
  it('leftover stars under a full money unit round down to 0', () => {
    expect(starsToMoneyUnits(4, defaultRates)).toBe(0)
  })
})

describe('formatMoney', () => {
  it('formats cents under a dollar as "N¢"', () => {
    expect(formatMoney(3, defaultRates)).toBe('3¢')
  })
  it('formats 100+ cents as a dollar amount', () => {
    expect(formatMoney(120, defaultRates)).toBe('$1.20')
  })
})

describe('earnedOn / earnedInWeek / spentInWeek', () => {
  it('sums only the given kid and date/week', () => {
    const entries = [
      entry(5, { dateISO: '2026-03-16', weekKey: '2026-W12' }),
      entry(3, { dateISO: '2026-03-16', weekKey: '2026-W12' }),
      entry(10, { dateISO: '2026-03-17', weekKey: '2026-W12' }),
      entry(99, { kidId: 'other-kid', dateISO: '2026-03-16', weekKey: '2026-W12' }),
    ]
    expect(earnedOn(entries, kidId, '2026-03-16')).toBe(8)
    expect(earnedInWeek(entries, kidId, '2026-W12')).toBe(18)
  })

  it('excludes entries still pending approval', () => {
    const entries = [entry(5, { approved: false }), entry(3)]
    expect(earnedOn(entries, kidId, '2026-03-16')).toBe(3)
  })

  it('spentInWeek sums spends for the kid and week', () => {
    const spends = [spend(4, { weekKey: '2026-W12' }), spend(6, { weekKey: '2026-W13' })]
    expect(spentInWeek(spends, kidId, '2026-W12')).toBe(4)
  })
})

describe('lifetimeEarned / lifetimeSpent', () => {
  it('sums everything for the kid, excluding pending approval entries', () => {
    const entries = [entry(5), entry(5, { approved: false }), entry(10)]
    expect(lifetimeEarned(entries, kidId)).toBe(15)
  })
  it('lifetimeSpent sums all spends for the kid', () => {
    const spends = [spend(3), spend(7)]
    expect(lifetimeSpent(spends, kidId)).toBe(10)
  })
})

describe('walletBalance', () => {
  const weekStartsOn = 1
  const now = new Date(2026, 2, 18) // Wed, week 2026-W12

  it('with carryOverUnspent on, balance is all-time wallet earned minus wallet spent', () => {
    const entries = [entry(10, { weekKey: '2026-W10' }), entry(5, { weekKey: '2026-W12' })]
    const spends = [spend(3, { weekKey: '2026-W10' })]
    expect(walletBalance(entries, spends, kidId, true, now, weekStartsOn)).toBe(12)
  })

  it('with carryOverUnspent off, balance resets to just this week', () => {
    const entries = [entry(10, { weekKey: '2026-W10' }), entry(5, { weekKey: '2026-W12' })]
    const spends = [spend(3, { weekKey: '2026-W10' })]
    // Week 10's 10 earned / 3 spent are ignored — only this week (W12) counts.
    expect(walletBalance(entries, spends, kidId, false, now, weekStartsOn)).toBe(5)
  })

  it('never goes negative even if spends exceed earnings', () => {
    const entries = [entry(5, { weekKey: '2026-W12' })]
    const spends = [spend(50, { weekKey: '2026-W12' })]
    expect(walletBalance(entries, spends, kidId, true, now, weekStartsOn)).toBe(0)
    expect(walletBalance(entries, spends, kidId, false, now, weekStartsOn)).toBe(0)
  })

  it('only counts the toSpend share of a split earning, never the toSavings share', () => {
    const entries = [entry(10, { toSpend: 8, toSavings: 2, weekKey: '2026-W12' })]
    expect(walletBalance(entries, [], kidId, true, now, weekStartsOn)).toBe(8)
  })

  it('ignores savingsWithdrawal spends — they never touch the wallet', () => {
    const entries = [entry(10, { toSpend: 8, toSavings: 2, weekKey: '2026-W12' })]
    const spends = [spend(2, { kind: 'savingsWithdrawal', weekKey: '2026-W12' })]
    expect(walletBalance(entries, spends, kidId, true, now, weekStartsOn)).toBe(8)
  })
})

describe('savingsBalance', () => {
  it('sums toSavings across all entries, lifetime', () => {
    const entries = [
      entry(10, { toSpend: 8, toSavings: 2, weekKey: '2026-W10' }),
      entry(5, { toSpend: 4, toSavings: 1, weekKey: '2026-W12' }),
    ]
    expect(savingsBalance(entries, [], kidId)).toBe(3)
  })

  it('subtracts approved savings withdrawals', () => {
    const entries = [entry(10, { toSpend: 8, toSavings: 2, weekKey: '2026-W12' })]
    const spends = [spend(1, { kind: 'savingsWithdrawal', weekKey: '2026-W12' })]
    expect(savingsBalance(entries, spends, kidId)).toBe(1)
  })

  it('ignores wallet spends (reward/screenTime/cashOut) — they never touch savings', () => {
    const entries = [entry(10, { toSpend: 8, toSavings: 2, weekKey: '2026-W12' })]
    const spends = [spend(8, { kind: 'reward', weekKey: '2026-W12' })]
    expect(savingsBalance(entries, spends, kidId)).toBe(2)
  })

  it('never resets weekly, unlike the wallet', () => {
    // Savings earned in a long-past week should still count today regardless of carryOverUnspent.
    const entries = [entry(10, { toSpend: 8, toSavings: 2, weekKey: '2020-W01' })]
    expect(savingsBalance(entries, [], kidId)).toBe(2)
  })

  it('never goes negative', () => {
    const entries = [entry(5, { toSpend: 4, toSavings: 1, weekKey: '2026-W12' })]
    const spends = [spend(99, { kind: 'savingsWithdrawal', weekKey: '2026-W12' })]
    expect(savingsBalance(entries, spends, kidId)).toBe(0)
  })
})

describe('wallet/savings earned helpers', () => {
  it('walletEarnedInWeek and savingsEarnedInWeek split a week\'s earnings correctly', () => {
    const entries = [
      entry(10, { toSpend: 8, toSavings: 2, weekKey: '2026-W12' }),
      entry(5, { toSpend: 4, toSavings: 1, weekKey: '2026-W12' }),
    ]
    expect(walletEarnedInWeek(entries, kidId, '2026-W12')).toBe(12)
    expect(savingsEarnedInWeek(entries, kidId, '2026-W12')).toBe(3)
  })

  it('lifetimeWalletEarned and lifetimeSavingsEarned split lifetime totals correctly', () => {
    const entries = [
      entry(10, { toSpend: 8, toSavings: 2, weekKey: '2026-W10' }),
      entry(5, { toSpend: 4, toSavings: 1, weekKey: '2026-W12' }),
    ]
    expect(lifetimeWalletEarned(entries, kidId)).toBe(12)
    expect(lifetimeSavingsEarned(entries, kidId)).toBe(3)
  })

  it('walletSpentInWeek and lifetimeSavingsWithdrawn separate spend kinds correctly', () => {
    const spends = [
      spend(5, { kind: 'reward', weekKey: '2026-W12' }),
      spend(3, { kind: 'savingsWithdrawal', weekKey: '2026-W12' }),
    ]
    expect(walletSpentInWeek(spends, kidId, '2026-W12')).toBe(5)
    expect(lifetimeSavingsWithdrawn(spends, kidId)).toBe(3)
  })

  it('lifetimeWalletSpent excludes savingsWithdrawal spends', () => {
    const spends = [spend(5, { kind: 'cashOut' }), spend(3, { kind: 'savingsWithdrawal' })]
    expect(lifetimeWalletSpent(spends, kidId)).toBe(5)
  })
})

describe('screenTimeCost', () => {
  it('scales linearly with minutes at the given rate per 15 minutes', () => {
    expect(screenTimeCost(5, 15)).toBe(5)
    expect(screenTimeCost(5, 30)).toBe(10)
    expect(screenTimeCost(5, 45)).toBe(15)
  })
})
