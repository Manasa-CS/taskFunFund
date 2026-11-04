import { describe, expect, it } from 'vitest'
import { splitEarning } from './savings'

describe('splitEarning', () => {
  it('splits a clean multiple exactly at the default 20%', () => {
    expect(splitEarning(10, 20, 0)).toEqual({ toSpend: 8, toSavings: 2, newRemainder: 0 })
    expect(splitEarning(5, 20, 0)).toEqual({ toSpend: 4, toSavings: 1, newRemainder: 0 })
  })

  it('always has toSpend + toSavings === points', () => {
    for (const points of [1, 2, 3, 7, 13, 25, 100]) {
      const { toSpend, toSavings } = splitEarning(points, 20, 0)
      expect(toSpend + toSavings).toBe(points)
    }
  })

  it('carries a fractional remainder forward instead of losing it', () => {
    // 3 points at 20% = 0.6 savings each time — rounds down to 0 every single earning
    // unless the remainder is carried, in which case it should eventually promote a point.
    let remainder = 0
    let totalSavings = 0
    let totalPoints = 0
    for (let i = 0; i < 5; i++) {
      const result = splitEarning(3, 20, remainder)
      remainder = result.newRemainder
      totalSavings += result.toSavings
      totalPoints += 3
    }
    // 5 * 3 = 15 points earned; 20% of 15 = exactly 3 — none of it should be lost to rounding.
    expect(totalSavings).toBe(3)
    expect(totalPoints - totalSavings).toBe(12)
  })

  it('converges on the exact percentage over many small earnings, never losing a fraction', () => {
    let remainder = 0
    let totalSavings = 0
    let totalPoints = 0
    for (let i = 0; i < 97; i++) {
      const points = 1
      const result = splitEarning(points, 20, remainder)
      remainder = result.newRemainder
      totalSavings += result.toSavings
      totalPoints += points
    }
    // 97 points at 20% = 19.4 -> whole points captured should be floor(19.4) = 19,
    // with the 0.4 remainder still held (not lost) for the next earning.
    expect(totalSavings).toBe(19)
    expect(remainder).toBeCloseTo(0.4, 9)
  })

  it('handles 0% (everything to spend) and 100% (everything to savings)', () => {
    expect(splitEarning(7, 0, 0)).toEqual({ toSpend: 7, toSavings: 0, newRemainder: 0 })
    expect(splitEarning(7, 100, 0)).toEqual({ toSpend: 0, toSavings: 7, newRemainder: 0 })
  })

  it('is not thrown off by floating-point noise at exact boundaries', () => {
    // 5 * 0.2 is susceptible to float imprecision (0.9999999999999999 in naive JS math).
    expect(splitEarning(5, 20, 0).toSavings).toBe(1)
    expect(splitEarning(25, 20, 0).toSavings).toBe(5)
  })

  it('handles zero points as a true no-op', () => {
    expect(splitEarning(0, 20, 0.4)).toEqual({ toSpend: 0, toSavings: 0, newRemainder: 0.4 })
  })
})
