import type { StateCreator } from 'zustand'
import { makeId } from '@/lib/ids'
import { splitEarning } from '@/lib/savings'
import { clampSavingsPercent, defaultSavingsPercent } from '../defaults'
import type { LogEntry, Spend } from '../types'
import type { AppState } from '../useStore'

export interface ManualAdjustment {
  kidId: string
  points: number
  dateISO: string
  weekKey: string
  note?: string
}

export interface LogSlice {
  logEntries: Record<string, LogEntry>
  spends: Record<string, Spend>
  addLogEntry: (entry: Omit<LogEntry, 'id'>) => string
  addEarning: (entry: Omit<LogEntry, 'id' | 'toSpend' | 'toSavings'>) => string
  removeLogEntry: (id: string) => void
  approveLogEntry: (id: string) => void
  addSpend: (spend: Omit<Spend, 'id'>) => string
  removeSpend: (id: string) => void
  /** A parent's one-off reward for good behavior — splits into wallet/savings like any other earning. */
  awardBonusPoints: (adjustment: ManualAdjustment) => string
  /** A parent's point deduction for misbehavior — comes entirely out of the wallet, never locked Savings. */
  applyPenalty: (adjustment: ManualAdjustment) => string
}

export const createLogSlice: StateCreator<AppState, [], [], LogSlice> = (set, get) => ({
  logEntries: {},
  spends: {},

  addLogEntry: (entry) => {
    const id = makeId()
    set((state) => ({ logEntries: { ...state.logEntries, [id]: { ...entry, id } } }))
    return id
  },

  /** Logs an earning, automatically splitting it into wallet/savings shares at the kid's rate. */
  addEarning: (entry) => {
    const kid = get().kids[entry.kidId]
    const savingsPercent = clampSavingsPercent(kid?.savingsPercent ?? defaultSavingsPercent)
    const remainder = kid?.savingsRemainder ?? 0
    const { toSpend, toSavings, newRemainder } = splitEarning(entry.points, savingsPercent, remainder)
    if (kid) get().updateKid(kid.id, { savingsRemainder: newRemainder })
    return get().addLogEntry({ ...entry, toSpend, toSavings })
  },

  removeLogEntry: (id) =>
    set((state) => {
      const next = { ...state.logEntries }
      delete next[id]
      return { logEntries: next }
    }),

  approveLogEntry: (id) =>
    set((state) => {
      const existing = state.logEntries[id]
      if (!existing) return state
      return { logEntries: { ...state.logEntries, [id]: { ...existing, approved: true } } }
    }),

  addSpend: (spend) => {
    const id = makeId()
    set((state) => ({ spends: { ...state.spends, [id]: { ...spend, id } } }))
    return id
  },

  removeSpend: (id) =>
    set((state) => {
      const next = { ...state.spends }
      delete next[id]
      return { spends: next }
    }),

  awardBonusPoints: (adjustment) =>
    get().addEarning({
      kidId: adjustment.kidId,
      sourceType: 'bonus',
      sourceId: `manualBonus-${makeId()}`,
      points: Math.abs(adjustment.points),
      dateISO: adjustment.dateISO,
      weekKey: adjustment.weekKey,
      note: adjustment.note,
    }),

  applyPenalty: (adjustment) => {
    const amount = Math.abs(adjustment.points)
    return get().addLogEntry({
      kidId: adjustment.kidId,
      sourceType: 'penalty',
      sourceId: `manualPenalty-${makeId()}`,
      points: -amount,
      toSpend: -amount,
      toSavings: 0,
      dateISO: adjustment.dateISO,
      weekKey: adjustment.weekKey,
      note: adjustment.note,
    })
  },
})
