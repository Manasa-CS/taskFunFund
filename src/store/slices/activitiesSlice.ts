import type { StateCreator } from 'zustand'
import { makeId } from '@/lib/ids'
import type { Activity } from '../types'

export interface ActivitiesSlice {
  activities: Record<string, Activity>
  addActivity: (activity: Omit<Activity, 'id'>) => string
  updateActivity: (id: string, patch: Partial<Omit<Activity, 'id'>>) => void
  removeActivity: (id: string) => void
}

export const createActivitiesSlice: StateCreator<ActivitiesSlice, [], [], ActivitiesSlice> = (
  set,
) => ({
  activities: {},

  addActivity: (activity) => {
    const id = makeId()
    set((state) => ({ activities: { ...state.activities, [id]: { ...activity, id } } }))
    return id
  },

  updateActivity: (id, patch) =>
    set((state) => {
      const existing = state.activities[id]
      if (!existing) return state
      return { activities: { ...state.activities, [id]: { ...existing, ...patch } } }
    }),

  removeActivity: (id) =>
    set((state) => {
      const next = { ...state.activities }
      delete next[id]
      return { activities: next }
    }),
})
