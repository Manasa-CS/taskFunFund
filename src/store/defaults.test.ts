import { describe, expect, it } from 'vitest'
import { clampSavingsPercent, maxSavingsPercent, minSavingsPercent } from './defaults'

describe('clampSavingsPercent', () => {
  it('passes through values already in range', () => {
    expect(clampSavingsPercent(20)).toBe(20)
    expect(clampSavingsPercent(minSavingsPercent)).toBe(minSavingsPercent)
    expect(clampSavingsPercent(maxSavingsPercent)).toBe(maxSavingsPercent)
  })

  it('raises values below the minimum up to it', () => {
    expect(clampSavingsPercent(0)).toBe(10)
    expect(clampSavingsPercent(5)).toBe(10)
  })

  it('caps values above the maximum', () => {
    expect(clampSavingsPercent(150)).toBe(100)
  })
})
