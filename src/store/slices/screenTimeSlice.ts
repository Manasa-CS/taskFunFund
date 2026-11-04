import type { StateCreator } from 'zustand'
import { makeId } from '@/lib/ids'
import type { ScreenTimeOption, ScreenTimeSession } from '../types'

export interface ScreenTimeSlice {
  screenTimeOptions: Record<string, ScreenTimeOption>
  screenTimeSessions: Record<string, ScreenTimeSession>
  addScreenTimeOption: (option: Omit<ScreenTimeOption, 'id'>) => string
  updateScreenTimeOption: (id: string, patch: Partial<Omit<ScreenTimeOption, 'id'>>) => void
  removeScreenTimeOption: (id: string) => void
  addScreenTimeSession: (session: Omit<ScreenTimeSession, 'id'>) => string
  updateScreenTimeSession: (id: string, patch: Partial<Omit<ScreenTimeSession, 'id'>>) => void
}

export const createScreenTimeSlice: StateCreator<ScreenTimeSlice, [], [], ScreenTimeSlice> = (
  set,
) => ({
  screenTimeOptions: {},
  screenTimeSessions: {},

  addScreenTimeOption: (option) => {
    const id = makeId()
    set((state) => ({
      screenTimeOptions: { ...state.screenTimeOptions, [id]: { ...option, id } },
    }))
    return id
  },

  updateScreenTimeOption: (id, patch) =>
    set((state) => {
      const existing = state.screenTimeOptions[id]
      if (!existing) return state
      return {
        screenTimeOptions: { ...state.screenTimeOptions, [id]: { ...existing, ...patch } },
      }
    }),

  removeScreenTimeOption: (id) =>
    set((state) => {
      const next = { ...state.screenTimeOptions }
      delete next[id]
      return { screenTimeOptions: next }
    }),

  addScreenTimeSession: (session) => {
    const id = makeId()
    set((state) => ({
      screenTimeSessions: { ...state.screenTimeSessions, [id]: { ...session, id } },
    }))
    return id
  },

  updateScreenTimeSession: (id, patch) =>
    set((state) => {
      const existing = state.screenTimeSessions[id]
      if (!existing) return state
      return {
        screenTimeSessions: { ...state.screenTimeSessions, [id]: { ...existing, ...patch } },
      }
    }),
})
