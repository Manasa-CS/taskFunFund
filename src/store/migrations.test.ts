import { describe, expect, it } from 'vitest'
import { defaultSavingsPercent } from './defaults'
import { CURRENT_SCHEMA_VERSION, migrate } from './migrations'

describe('migrate', () => {
  it('passes state through unchanged when already at the current version', () => {
    const state = { kids: { k1: { name: 'Aria' } } }
    expect(migrate(state, CURRENT_SCHEMA_VERSION)).toBe(state)
  })

  it('returns a value for an older version too, so loading old data never throws', () => {
    const state = { kids: {} }
    expect(() => migrate(state, 0)).not.toThrow()
  })

  interface MigratedState {
    kids: Record<string, { name: string; savingsPercent: number; savingsRemainder: number }>
    logEntries: Record<string, { points: number; toSpend: number; toSavings: number }>
  }

  it('v1 -> v2: gives existing kids a default savings rate and zero remainder', () => {
    const state = { kids: { k1: { name: 'Aria' } } }
    const migrated = migrate(state, 1) as unknown as MigratedState
    expect(migrated.kids.k1.savingsPercent).toBe(defaultSavingsPercent)
    expect(migrated.kids.k1.savingsRemainder).toBe(0)
  })

  it('v1 -> v2: sends all of every existing LogEntry\'s points to the wallet, savings at 0', () => {
    const state = { logEntries: { e1: { points: 25 }, e2: { points: 10 } } }
    const migrated = migrate(state, 1) as unknown as MigratedState
    expect(migrated.logEntries.e1).toMatchObject({ toSpend: 25, toSavings: 0 })
    expect(migrated.logEntries.e2).toMatchObject({ toSpend: 10, toSavings: 0 })
  })

  it('v1 -> v2 does not clobber a kid/entry that somehow already has the new fields', () => {
    const state = {
      kids: { k1: { name: 'Aria', savingsPercent: 50, savingsRemainder: 0.3 } },
      logEntries: { e1: { points: 10, toSpend: 7, toSavings: 3 } },
    }
    const migrated = migrate(state, 1) as unknown as MigratedState
    expect(migrated.kids.k1.savingsPercent).toBe(50)
    expect(migrated.kids.k1.savingsRemainder).toBe(0.3)
    expect(migrated.logEntries.e1).toEqual({ points: 10, toSpend: 7, toSavings: 3 })
  })
})
