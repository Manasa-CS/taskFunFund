import type { StateCreator } from 'zustand'
import { makeId } from '@/lib/ids'
import type { Task } from '../types'

export interface TasksSlice {
  tasks: Record<string, Task>
  addTask: (task: Omit<Task, 'id'>) => string
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
  removeTask: (id: string) => void
}

export const createTasksSlice: StateCreator<TasksSlice, [], [], TasksSlice> = (set) => ({
  tasks: {},

  addTask: (task) => {
    const id = makeId()
    set((state) => ({ tasks: { ...state.tasks, [id]: { ...task, id } } }))
    return id
  },

  updateTask: (id, patch) =>
    set((state) => {
      const existing = state.tasks[id]
      if (!existing) return state
      return { tasks: { ...state.tasks, [id]: { ...existing, ...patch } } }
    }),

  removeTask: (id) =>
    set((state) => {
      const next = { ...state.tasks }
      delete next[id]
      return { tasks: next }
    }),
})
