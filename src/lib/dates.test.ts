import { describe, expect, it } from 'vitest'
import { getWeekKey, getWeekRange, parseDateISO, toDateISO } from './dates'

describe('getWeekKey / getWeekRange', () => {
  it('round-trips through getWeekRange for a Monday-start week', () => {
    const date = new Date(2026, 2, 18) // Wed Mar 18 2026
    const key = getWeekKey(date, 1)
    const { start, end } = getWeekRange(key, 1)
    expect(toDateISO(start)).toBe('2026-03-16') // Monday
    expect(toDateISO(end)).toBe('2026-03-22') // Sunday
    expect(getWeekKey(start, 1)).toBe(key)
    expect(getWeekKey(end, 1)).toBe(key)
  })

  it('gives a different key for Sunday-start vs Monday-start weeks', () => {
    // A Sunday: under a Monday-start week it belongs to the PREVIOUS week,
    // under a Sunday-start week it begins a NEW week.
    const sunday = new Date(2026, 2, 22) // Sun Mar 22 2026
    const mondayStartKey = getWeekKey(sunday, 1)
    const sundayStartKey = getWeekKey(sunday, 0)

    const mondayRange = getWeekRange(mondayStartKey, 1)
    const sundayRange = getWeekRange(sundayStartKey, 0)

    expect(toDateISO(mondayRange.start)).toBe('2026-03-16')
    expect(toDateISO(sundayRange.start)).toBe('2026-03-22')
  })

  it('handles the year boundary: Dec 31 2025 and Jan 1 2026 share the same ISO week', () => {
    // Dec 31 2025 is a Wednesday; Jan 1 2026 is a Thursday — same Mon-Sun week.
    const dec31 = new Date(2025, 11, 31)
    const jan1 = new Date(2026, 0, 1)
    const key = getWeekKey(dec31, 1)
    expect(getWeekKey(jan1, 1)).toBe(key)
    expect(key).toBe('2026-W01') // ISO: the week containing Jan 1 2026's Thursday is week 1 of 2026
  })

  it('rolls week 52/53 of one year into week 1 of the next without gaps', () => {
    // Dec 28 2026 (Monday) starts the last ISO week of 2026 (week 53).
    const lastWeekStart = new Date(2026, 11, 28)
    const key = getWeekKey(lastWeekStart, 1)
    const { end } = getWeekRange(key, 1)

    const nextWeekStart = new Date(end)
    nextWeekStart.setDate(end.getDate() + 1)
    const nextKey = getWeekKey(nextWeekStart, 1)

    expect(key).not.toBe(nextKey)
    expect(nextKey).toBe('2027-W01')
  })

  it('stays stable across a DST transition within the same week (US spring-forward, Mar 8 2026)', () => {
    // Mon Mar 2 – Sun Mar 8 2026 is one Monday-start week; DST starts 2am Mar 8,
    // shortening that day to 23 hours. Both ends of the week should still resolve
    // to the same key, and the range should still span calendar Mon–Sun.
    const tuesday = new Date(2026, 2, 3) // before DST
    const sunday = new Date(2026, 2, 8) // the short day itself
    const key = getWeekKey(tuesday, 1)
    expect(getWeekKey(sunday, 1)).toBe(key)

    const { start, end } = getWeekRange(key, 1)
    expect(toDateISO(start)).toBe('2026-03-02')
    expect(toDateISO(end)).toBe('2026-03-08')
  })

  it('carries LogEntry/Spend weeks forward automatically — no stored week needs deleting', () => {
    const thisWeekKey = getWeekKey(new Date(2026, 2, 18), 1)
    const nextWeekDate = new Date(2026, 2, 25)
    const nextWeekKey = getWeekKey(nextWeekDate, 1)
    expect(nextWeekKey).not.toBe(thisWeekKey)
  })
})

describe('parseDateISO', () => {
  it('round-trips with toDateISO regardless of local timezone', () => {
    expect(toDateISO(parseDateISO('2026-01-05'))).toBe('2026-01-05')
    expect(toDateISO(parseDateISO('2026-12-31'))).toBe('2026-12-31')
  })

  it('resolves to the intended local calendar day, not a UTC-shifted one', () => {
    const date = parseDateISO('2026-03-01')
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(2) // March, 0-indexed
    expect(date.getDate()).toBe(1)
  })
})
