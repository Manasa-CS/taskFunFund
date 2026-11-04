import type { LogEntry, Rates, Spend } from '@/store/types'
import { getWeekKey } from './dates'

/** Points that count toward totals right now — excludes entries still waiting on parent approval. */
function countable(entries: LogEntry[]): LogEntry[] {
  return entries.filter((e) => e.approved !== false)
}

function notSavingsWithdrawal(spends: Spend[]): Spend[] {
  return spends.filter((s) => s.kind !== 'savingsWithdrawal')
}

/** Converts raw points to whole stars plus leftover points (5 points = 1 star by default). */
export function pointsToStars(points: number, rates: Rates): { stars: number; leftover: number } {
  const stars = Math.floor(points / rates.pointsPerStar)
  const leftover = points - stars * rates.pointsPerStar
  return { stars, leftover }
}

/** Converts a star count to a money amount, in the smallest unit (e.g. cents). */
export function starsToMoneyUnits(stars: number, rates: Rates): number {
  return Math.floor(stars / rates.starsPerMoneyUnit)
}

/** Converts points straight to a money amount, in the smallest unit (e.g. cents). */
export function pointsToMoneyUnits(points: number, rates: Rates): number {
  return starsToMoneyUnits(pointsToStars(points, rates).stars, rates)
}

/** Formats a money-unit amount (e.g. cents) as a display string like "3¢" or "$1.20". */
export function formatMoney(units: number, rates: Rates): string {
  if (rates.moneyUnit === 'cent' && rates.currency === 'USD') {
    if (units < 100) return `${units}¢`
    return `$${(units / 100).toFixed(2)}`
  }
  return `${units} ${rates.moneyUnit}${units === 1 ? '' : 's'}`
}

/** Total points a kid earned on one calendar day (dateISO), excluding anything still pending approval. */
export function earnedOn(entries: LogEntry[], kidId: string, dateISO: string): number {
  return countable(entries.filter((e) => e.kidId === kidId && e.dateISO === dateISO)).reduce(
    (sum, e) => sum + e.points,
    0,
  )
}

/** Total points a kid earned in one week (wallet + savings combined). */
export function earnedInWeek(entries: LogEntry[], kidId: string, weekKey: string): number {
  return countable(entries.filter((e) => e.kidId === kidId && e.weekKey === weekKey)).reduce(
    (sum, e) => sum + e.points,
    0,
  )
}

/** Total points a kid spent in one week, across every spend kind (wallet and savings). */
export function spentInWeek(spends: Spend[], kidId: string, weekKey: string): number {
  return spends
    .filter((s) => s.kidId === kidId && s.weekKey === weekKey)
    .reduce((sum, s) => sum + s.points, 0)
}

/** Total points a kid has ever earned, excluding anything still pending approval. */
export function lifetimeEarned(entries: LogEntry[], kidId: string): number {
  return countable(entries.filter((e) => e.kidId === kidId)).reduce((sum, e) => sum + e.points, 0)
}

/** Total points a kid has ever spent, across every spend kind (wallet and savings). */
export function lifetimeSpent(spends: Spend[], kidId: string): number {
  return spends.filter((s) => s.kidId === kidId).reduce((sum, s) => sum + s.points, 0)
}

/** Points earned into the spend wallet (not savings) on one calendar day. */
export function walletEarnedOn(entries: LogEntry[], kidId: string, dateISO: string): number {
  return countable(entries.filter((e) => e.kidId === kidId && e.dateISO === dateISO)).reduce(
    (sum, e) => sum + e.toSpend,
    0,
  )
}

/** Points earned into the spend wallet (not savings) in one week. */
export function walletEarnedInWeek(entries: LogEntry[], kidId: string, weekKey: string): number {
  return countable(entries.filter((e) => e.kidId === kidId && e.weekKey === weekKey)).reduce(
    (sum, e) => sum + e.toSpend,
    0,
  )
}

/** Points a kid has ever earned into the spend wallet (not savings). */
export function lifetimeWalletEarned(entries: LogEntry[], kidId: string): number {
  return countable(entries.filter((e) => e.kidId === kidId)).reduce((sum, e) => sum + e.toSpend, 0)
}

/** Points swept into locked Savings in one week. */
export function savingsEarnedInWeek(entries: LogEntry[], kidId: string, weekKey: string): number {
  return countable(entries.filter((e) => e.kidId === kidId && e.weekKey === weekKey)).reduce(
    (sum, e) => sum + e.toSavings,
    0,
  )
}

/** Points a kid has ever swept into locked Savings. */
export function lifetimeSavingsEarned(entries: LogEntry[], kidId: string): number {
  return countable(entries.filter((e) => e.kidId === kidId)).reduce((sum, e) => sum + e.toSavings, 0)
}

/** Points spent from the wallet in one week — excludes Savings withdrawals, which never touch it. */
export function walletSpentInWeek(spends: Spend[], kidId: string, weekKey: string): number {
  return notSavingsWithdrawal(spends)
    .filter((s) => s.kidId === kidId && s.weekKey === weekKey)
    .reduce((sum, s) => sum + s.points, 0)
}

/** Points a kid has ever spent from the wallet — excludes Savings withdrawals. */
export function lifetimeWalletSpent(spends: Spend[], kidId: string): number {
  return notSavingsWithdrawal(spends)
    .filter((s) => s.kidId === kidId)
    .reduce((sum, s) => sum + s.points, 0)
}

/** Points a kid has ever pulled out of locked Savings via an approved emergency withdrawal. */
export function lifetimeSavingsWithdrawn(spends: Spend[], kidId: string): number {
  return spends
    .filter((s) => s.kidId === kidId && s.kind === 'savingsWithdrawal')
    .reduce((sum, s) => sum + s.points, 0)
}

/**
 * Points a kid can spend right now — wallet only, never Savings. With carryOverUnspent on,
 * this is all-time wallet earnings minus wallet spending; otherwise it resets weekly.
 */
export function walletBalance(
  entries: LogEntry[],
  spends: Spend[],
  kidId: string,
  carryOverUnspent: boolean,
  now: Date,
  weekStartsOn: Parameters<typeof getWeekKey>[1],
): number {
  if (carryOverUnspent) {
    return Math.max(0, lifetimeWalletEarned(entries, kidId) - lifetimeWalletSpent(spends, kidId))
  }
  const weekKey = getWeekKey(now, weekStartsOn)
  return Math.max(0, walletEarnedInWeek(entries, kidId, weekKey) - walletSpentInWeek(spends, kidId, weekKey))
}

/** A kid's locked Savings balance — always lifetime, since Savings never resets weekly. */
export function savingsBalance(entries: LogEntry[], spends: Spend[], kidId: string): number {
  return Math.max(0, lifetimeSavingsEarned(entries, kidId) - lifetimeSavingsWithdrawn(spends, kidId))
}

/** Points cost of buying a block of screen time at a given rate per 15 minutes. */
export function screenTimeCost(pointsPer15Min: number, minutes: number): number {
  return Math.round((minutes / 15) * pointsPer15Min)
}
