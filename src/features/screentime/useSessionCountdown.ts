import { useEffect, useState } from 'react'
import { sessionRemainingMs } from '@/lib/screenTime'
import type { ScreenTimeSession } from '@/store/types'

/** Ticking remaining-time for a screen-time session, derived from its persisted timestamps. */
export function useSessionCountdown(session: ScreenTimeSession | undefined): number {
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (!session || session.status !== 'running') return
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    const onVisible = () => document.visibilityState === 'visible' && forceTick((n) => n + 1)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [session])

  if (!session) return 0
  return sessionRemainingMs(session, new Date())
}
