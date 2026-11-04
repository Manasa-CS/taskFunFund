import { create } from 'zustand'

export interface CelebrationEvent {
  id: string
  kidId: string
  points: number
  toSpend: number
  toSavings: number
  /** Today's points / daily target, capped at 1, as of this event. */
  fillLevel: number
  targetReached: boolean
  at: number
}

interface CelebrationQueueState {
  queue: CelebrationEvent[]
  push: (event: Omit<CelebrationEvent, 'id' | 'at'>) => void
  shift: () => void
  reset: () => void
}

const MERGE_WINDOW_MS = 1000

/** Queues "task done" celebration events; ones landing within 1s of the last queued one merge together. */
export const useCelebrationQueue = create<CelebrationQueueState>((set) => ({
  queue: [],

  push: (event) =>
    set((state) => {
      const now = Date.now()
      const last = state.queue[state.queue.length - 1]
      if (last && now - last.at < MERGE_WINDOW_MS) {
        const merged: CelebrationEvent = {
          ...last,
          points: last.points + event.points,
          toSpend: last.toSpend + event.toSpend,
          toSavings: last.toSavings + event.toSavings,
          fillLevel: event.fillLevel,
          targetReached: event.targetReached,
          at: now,
        }
        return { queue: [...state.queue.slice(0, -1), merged] }
      }
      return { queue: [...state.queue, { ...event, id: `${now}-${Math.random().toString(36).slice(2)}`, at: now }] }
    }),

  shift: () => set((state) => ({ queue: state.queue.slice(1) })),

  reset: () => set({ queue: [] }),
}))
