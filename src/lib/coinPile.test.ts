import { describe, expect, it } from 'vitest'
import { generateCoinPile } from './coinPile'

describe('generateCoinPile', () => {
  it('returns one entry per coin, up to the requested count', () => {
    expect(generateCoinPile(1, 5)).toHaveLength(5)
    expect(generateCoinPile(1, 0)).toHaveLength(0)
  })

  it('clips to a sane maximum so the pile never overflows the jar', () => {
    expect(generateCoinPile(1, 500)).toHaveLength(40)
  })

  it('is stable for the same seed and count', () => {
    const a = generateCoinPile(42, 12)
    const b = generateCoinPile(42, 12)
    expect(a).toEqual(b)
  })

  it('varies coin position, size, tilt and shade so the pile looks naturally tumbled', () => {
    const coins = generateCoinPile(7, 10)
    const xs = new Set(coins.map((c) => c.x))
    const rotations = new Set(coins.map((c) => c.rotation))
    const shades = new Set(coins.map((c) => c.shade))
    expect(xs.size).toBeGreaterThan(1)
    expect(rotations.size).toBeGreaterThan(1)
    expect(shades.size).toBeGreaterThan(1)
  })

  it('produces a different layout for a different seed', () => {
    const a = generateCoinPile(1, 10)
    const b = generateCoinPile(2, 10)
    expect(a).not.toEqual(b)
  })
})
