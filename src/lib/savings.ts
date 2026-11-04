export interface SplitResult {
  toSpend: number
  toSavings: number
  newRemainder: number
}

// Guards against float noise (e.g. 5 * 0.2 landing on 0.9999999999998) before flooring.
const EPSILON_SCALE = 1e9

/**
 * Splits earned points into spend/savings shares at a kid's rate, carrying the rounding
 * remainder forward so repeated small earnings still converge on the exact percentage.
 */
export function splitEarning(points: number, savingsPercent: number, remainder: number): SplitResult {
  const rawIdealSavings = points * (savingsPercent / 100) + remainder
  const idealSavings = Math.round(rawIdealSavings * EPSILON_SCALE) / EPSILON_SCALE
  const toSavings = Math.floor(idealSavings)
  const newRemainder = idealSavings - toSavings
  const toSpend = points - toSavings
  return { toSpend, toSavings, newRemainder }
}
