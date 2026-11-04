import { defaultSavingsPercent } from './defaults'

/** Bump this whenever the persisted shape changes, and add a case below to migrate old data forward. */
export const CURRENT_SCHEMA_VERSION = 2

interface LegacyKid {
  savingsPercent?: number
  savingsRemainder?: number
  [key: string]: unknown
}

interface LegacyLogEntry {
  points: number
  toSpend?: number
  toSavings?: number
  [key: string]: unknown
}

interface LegacyState {
  kids?: Record<string, LegacyKid>
  logEntries?: Record<string, LegacyLogEntry>
  [key: string]: unknown
}

/** v1 -> v2: adds the locked Savings account. Existing points stay in the wallet; Savings starts at 0. */
function migrateToV2(state: LegacyState): LegacyState {
  const kids = state.kids
    ? Object.fromEntries(
        Object.entries(state.kids).map(([id, kid]) => [
          id,
          { ...kid, savingsPercent: kid.savingsPercent ?? defaultSavingsPercent, savingsRemainder: kid.savingsRemainder ?? 0 },
        ]),
      )
    : state.kids

  const logEntries = state.logEntries
    ? Object.fromEntries(
        Object.entries(state.logEntries).map(([id, entry]) => [
          id,
          { ...entry, toSpend: entry.toSpend ?? entry.points, toSavings: entry.toSavings ?? 0 },
        ]),
      )
    : state.logEntries

  return { ...state, kids, logEntries }
}

/** Upgrades persisted state from an older schema version to the current one. */
export function migrate(persistedState: unknown, version: number): unknown {
  let state = persistedState as LegacyState

  if (version < 2) {
    state = migrateToV2(state)
  }

  return state
}
