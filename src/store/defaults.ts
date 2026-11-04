import type { Rates, Settings } from './types'

export const defaultRates: Rates = {
  pointsPerStar: 5,
  starsPerMoneyUnit: 5,
  moneyUnit: 'cent',
  currency: 'USD',
}

export const defaultSettings: Settings = {
  parentPinHash: null,
  parentName: '',
  weekStartsOn: 1, // Monday
  rates: defaultRates,
  carryOverUnspent: true,
  soundOn: true,
  afterSchoolReminderEnabled: false,
  afterSchoolReminderHour: 15,
  afterSchoolReminderMinute: 30,
  installGuideDismissed: false,
}

export const defaultDailyPointsTarget = 10

/** Share of every earning swept into locked Savings by default. */
export const defaultSavingsPercent = 20

/** Allowed range for a kid's customizable savings percent. */
export const minSavingsPercent = 10
export const maxSavingsPercent = 100

/** Clamps a savings percent into the allowed [min, max] range. */
export function clampSavingsPercent(value: number): number {
  return Math.min(maxSavingsPercent, Math.max(minSavingsPercent, value))
}
