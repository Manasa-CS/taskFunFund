import type { StateCreator } from 'zustand'

export interface PickSlice {
  /** Re-roll counts used so far, keyed by `${kidId}:${dateISO}`. */
  rerollsUsed: Record<string, number>
  spendReroll: (kidId: string, dateISO: string) => void
  getRerollsUsed: (kidId: string, dateISO: string) => number
}

export const createPickSlice: StateCreator<PickSlice, [], [], PickSlice> = (set, get) => ({
  rerollsUsed: {},

  spendReroll: (kidId, dateISO) => {
    const key = `${kidId}:${dateISO}`
    set((state) => ({ rerollsUsed: { ...state.rerollsUsed, [key]: (state.rerollsUsed[key] ?? 0) + 1 } }))
  },

  getRerollsUsed: (kidId, dateISO) => get().rerollsUsed[`${kidId}:${dateISO}`] ?? 0,
})
