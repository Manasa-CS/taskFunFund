export type TimeOfDay = 'morning' | 'afterSchool' | 'evening'
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday

export interface Rates {
  pointsPerStar: number
  starsPerMoneyUnit: number
  moneyUnit: string
  currency: string
}

export interface Kid {
  id: string
  name: string
  avatar: string
  color: string
  birthYear?: number
  dailyPointsTarget: number
  rates?: Rates
  /** Bonus points awarded once on a day every scheduled task gets done. Unset/0 disables it. */
  allTasksBonusPoints?: number
  /** When true, activity completions wait in Parent → Approvals before points count. */
  requireActivityApproval?: boolean
  /** How many "Try again" re-rolls a kid gets per day in the pick games. Default 1. */
  maxRerollsPerDay?: number
  /** Whether extra screen time can be bought with points at all. */
  screenTimeEnabled?: boolean
  /** Caps total screen time minutes bought per day. Unset = no cap. */
  screenTimeDailyCapMinutes?: number
  /** Hour-of-day window (0-23, start inclusive, end exclusive) screen time can be bought. Unset = always. */
  screenTimeAllowedHours?: { start: number; end: number }
  /** The reward a kid has pinned as their savings goal — tracked against their locked Savings balance. */
  savingsGoalRewardId?: string
  /** % of every earning that's swept into locked Savings instead of the spend wallet. Default 20. */
  savingsPercent?: number
  /** Fractional savings-points not yet rounded into a whole point; carried forward so none are lost. */
  savingsRemainder?: number
  /** Optional floor — emergency withdrawals can't take Savings below this. */
  minSavingsBalance?: number
  /** Optional bonus points swept straight into Savings once per week, bypassing the normal split. */
  weeklySavingsBonusPoints?: number
  createdAt: string
}

export interface Task {
  id: string
  kidId: string
  title: string
  icon: string
  points: number
  daysOfWeek: DayOfWeek[]
  timeOfDay: TimeOfDay
  active: boolean
}

export type ActivityCategory = 'learning' | 'music' | 'exercise' | 'creative' | 'reading' | 'custom'
export type ActivityGoalType = 'count' | 'minutes' | 'done'

export interface Activity {
  id: string
  kidId: string
  title: string
  icon: string
  category: ActivityCategory
  goalType: ActivityGoalType
  goalValue: number
  points: number
  active: boolean
}

export interface FunOption {
  id: string
  kidId: string
  title: string
  icon: string
  minutes?: number
  active: boolean
}

export type LogSourceType = 'task' | 'activity' | 'bonus' | 'fun' | 'penalty'

export interface LogEntry {
  id: string
  kidId: string
  sourceType: LogSourceType
  sourceId: string
  points: number
  /** Share of `points` that landed in the spend wallet. toSpend + toSavings always equals points. */
  toSpend: number
  /** Share of `points` swept into locked Savings. */
  toSavings: number
  dateISO: string
  weekKey: string
  note?: string
  /** Minutes spent, for fun options tracked in reports — fun itself never costs points. */
  minutes?: number
  /** False while waiting in Parent → Approvals; absent/true means it already counts. */
  approved?: boolean
}

export type SpendKind = 'screenTime' | 'reward' | 'cashOut' | 'savingsWithdrawal'

export interface Spend {
  id: string
  kidId: string
  kind: SpendKind
  refId: string
  points: number
  minutes?: number
  dateISO: string
  weekKey: string
}

export interface ScreenTimeOption {
  id: string
  kidId: string
  label: string
  icon: string
  pointsPer15Min: number
}

export type ScreenTimeStatus = 'ready' | 'running' | 'paused' | 'done'

export interface ScreenTimeSession {
  id: string
  kidId: string
  optionId: string
  minutesBought: number
  startedAt?: string
  pausedAt?: string
  endedAt?: string
  status: ScreenTimeStatus
}

export interface Reward {
  id: string
  title: string
  icon: string
  cost: number
  kidIds: string[]
}

export type RewardRequestStatus = 'pending' | 'approved' | 'declined'

export interface RewardRequest {
  id: string
  kidId: string
  rewardId: string
  status: RewardRequestStatus
  dateISO: string
}

export type SavingsWithdrawalStatus = 'pending' | 'approved' | 'declined'

/** A kid's request to pull points out of locked Savings early, with a reason, for parent review. */
export interface SavingsWithdrawalRequest {
  id: string
  kidId: string
  amount: number
  reason: string
  status: SavingsWithdrawalStatus
  dateISO: string
}

export type CertificateType =
  | 'taskHero'
  | 'fundBuilder'
  | 'superSaver'
  | 'goalGetter'
  | 'superLearner'
  | 'streakMaster'
  | 'custom'

export interface Certificate {
  id: string
  kidId: string
  type: CertificateType
  title: string
  message: string
  /** Week the achievement happened in, if it's a weekly one (unset for lifetime milestones). */
  weekKey?: string
  dateRangeLabel: string
  /** Points/stars/money are snapshotted at issuance — a certificate is a historical record, not a live balance. */
  pointsSnapshot: number
  starsSnapshot: number
  moneyUnitsSnapshot: number
  issuedAt: string
}

export interface Settings {
  parentPinHash: string | null
  parentName: string
  weekStartsOn: DayOfWeek
  rates: Rates
  carryOverUnspent: boolean
  soundOn: boolean
  /** Daily "ready to earn points?" reminder (native only), e.g. after school lets out. */
  afterSchoolReminderEnabled: boolean
  afterSchoolReminderHour: number
  afterSchoolReminderMinute: number
  /** True once the parent has dismissed the "Install TaskFunFund" guide (web only). */
  installGuideDismissed: boolean
  /** ISO timestamp of the last successful backup export/share, if any. */
  lastBackupAt?: string
}
