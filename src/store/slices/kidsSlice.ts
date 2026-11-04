import type { StateCreator } from 'zustand'
import { makeId } from '@/lib/ids'
import { defaultDailyPointsTarget } from '../defaults'
import type { Kid } from '../types'

export interface KidsSlice {
  kids: Record<string, Kid>
  addKid: (kid: Omit<Kid, 'id' | 'createdAt' | 'dailyPointsTarget'> & { dailyPointsTarget?: number }) => string
  updateKid: (id: string, patch: Partial<Omit<Kid, 'id'>>) => void
  removeKid: (id: string) => void
}

export const createKidsSlice: StateCreator<KidsSlice, [], [], KidsSlice> = (set) => ({
  kids: {},

  addKid: (kid) => {
    const id = makeId()
    const newKid: Kid = {
      ...kid,
      id,
      dailyPointsTarget: kid.dailyPointsTarget ?? defaultDailyPointsTarget,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ kids: { ...state.kids, [id]: newKid } }))
    return id
  },

  updateKid: (id, patch) =>
    set((state) => {
      const existing = state.kids[id]
      if (!existing) return state
      return { kids: { ...state.kids, [id]: { ...existing, ...patch } } }
    }),

  removeKid: (id) =>
    set((state) => {
      const next = { ...state.kids }
      delete next[id]
      return { kids: next }
    }),
})
