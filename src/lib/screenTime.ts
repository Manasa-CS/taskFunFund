import type { ScreenTimeSession } from '@/store/types'

/** Milliseconds left in a screen-time session, derived from its persisted timestamps. */
export function sessionRemainingMs(session: ScreenTimeSession, now: Date): number {
  const totalMs = session.minutesBought * 60_000
  if (session.status === 'ready') return totalMs
  if (session.status === 'done') return 0

  const startedAtMs = new Date(session.startedAt ?? now).getTime()
  if (session.status === 'paused') {
    const pausedAtMs = new Date(session.pausedAt ?? now).getTime()
    return Math.max(0, totalMs - (pausedAtMs - startedAtMs))
  }
  // running
  return Math.max(0, totalMs - (now.getTime() - startedAtMs))
}

/** Minutes actually used so far (for refund math when a parent ends a session early). */
export function sessionUsedMinutes(session: ScreenTimeSession, now: Date): number {
  const remainingMs = sessionRemainingMs(session, now)
  const totalMs = session.minutesBought * 60_000
  return Math.round((totalMs - remainingMs) / 60_000)
}
