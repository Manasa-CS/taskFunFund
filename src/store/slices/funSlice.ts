import type { StateCreator } from 'zustand'
import { makeId } from '@/lib/ids'
import type { FunOption } from '../types'

export interface FunSlice {
  funOptions: Record<string, FunOption>
  addFunOption: (option: Omit<FunOption, 'id'>) => string
  updateFunOption: (id: string, patch: Partial<Omit<FunOption, 'id'>>) => void
  removeFunOption: (id: string) => void
}

export const createFunSlice: StateCreator<FunSlice, [], [], FunSlice> = (set) => ({
  funOptions: {},

  addFunOption: (option) => {
    const id = makeId()
    set((state) => ({ funOptions: { ...state.funOptions, [id]: { ...option, id } } }))
    return id
  },

  updateFunOption: (id, patch) =>
    set((state) => {
      const existing = state.funOptions[id]
      if (!existing) return state
      return { funOptions: { ...state.funOptions, [id]: { ...existing, ...patch } } }
    }),

  removeFunOption: (id) =>
    set((state) => {
      const next = { ...state.funOptions }
      delete next[id]
      return { funOptions: next }
    }),
})
