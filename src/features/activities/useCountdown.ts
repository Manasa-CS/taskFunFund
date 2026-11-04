import { useEffect, useState } from 'react'

interface Countdown {
  remainingMs: number
  running: boolean
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

/**
 * A countdown that stays accurate when the tab/app is backgrounded, by deriving
 * remaining time from wall-clock timestamps each tick instead of decrementing a counter.
 */
export function useCountdown(totalMs: number): Countdown {
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [pausedRemaining, setPausedRemaining] = useState<number | null>(totalMs)
  const [, forceTick] = useState(0)

  const running = startedAt !== null

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => forceTick((n) => n + 1), 250)
    const onVisible = () => document.visibilityState === 'visible' && forceTick((n) => n + 1)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [running])

  const remainingMs = running
    ? Math.max(0, totalMs - (Date.now() - startedAt))
    : (pausedRemaining ?? totalMs)

  return {
    remainingMs,
    running,
    start: () => {
      setStartedAt(Date.now())
      setPausedRemaining(null)
    },
    pause: () => {
      if (startedAt === null) return
      setPausedRemaining(Math.max(0, totalMs - (Date.now() - startedAt)))
      setStartedAt(null)
    },
    resume: () => {
      const remaining = pausedRemaining ?? totalMs
      setStartedAt(Date.now() - (totalMs - remaining))
      setPausedRemaining(null)
    },
    reset: () => {
      setStartedAt(null)
      setPausedRemaining(totalMs)
    },
  }
}
