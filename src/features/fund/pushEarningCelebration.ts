import { useStore } from '@/store/useStore'
import { useCelebrationQueue } from './celebrationQueue'

interface PushEarningCelebrationArgs {
  kidId: string
  entryId: string
  todayISO: string
  dailyPointsTarget: number
}

/** Reads back a just-logged earning and queues a jar celebration showing today's new progress. */
export function pushEarningCelebration({ kidId, entryId, todayISO, dailyPointsTarget }: PushEarningCelebrationArgs): void {
  const state = useStore.getState()
  const entry = state.logEntries[entryId]
  if (!entry) return

  const pointsToday = Object.values(state.logEntries)
    .filter((l) => l.kidId === kidId && l.dateISO === todayISO && l.approved !== false)
    .reduce((sum, l) => sum + l.points, 0)
  const fillLevel = dailyPointsTarget > 0 ? Math.min(1, pointsToday / dailyPointsTarget) : 0

  useCelebrationQueue.getState().push({
    kidId,
    points: entry.points,
    toSpend: entry.toSpend,
    toSavings: entry.toSavings,
    fillLevel,
    targetReached: fillLevel >= 1,
  })
}
