import { describe, expect, it } from 'vitest'
import type { ScreenTimeSession } from '@/store/types'
import { sessionRemainingMs, sessionUsedMinutes } from './screenTime'

const base: ScreenTimeSession = {
  id: 's1',
  kidId: 'kid-1',
  optionId: 'opt-1',
  minutesBought: 30,
  status: 'ready',
}

describe('sessionRemainingMs', () => {
  it('is the full duration before starting', () => {
    expect(sessionRemainingMs(base, new Date('2026-01-01T12:00:00Z'))).toBe(30 * 60_000)
  })

  it('counts down from startedAt while running', () => {
    const session: ScreenTimeSession = { ...base, status: 'running', startedAt: '2026-01-01T12:00:00Z' }
    expect(sessionRemainingMs(session, new Date('2026-01-01T12:10:00Z'))).toBe(20 * 60_000)
  })

  it('freezes at the paused instant', () => {
    const session: ScreenTimeSession = {
      ...base,
      status: 'paused',
      startedAt: '2026-01-01T12:00:00Z',
      pausedAt: '2026-01-01T12:05:00Z',
    }
    // Even if "now" is much later, paused time doesn't count.
    expect(sessionRemainingMs(session, new Date('2026-01-01T13:00:00Z'))).toBe(25 * 60_000)
  })

  it('is 0 once done, and never negative while running past the end', () => {
    expect(sessionRemainingMs({ ...base, status: 'done' }, new Date())).toBe(0)
    const overrun: ScreenTimeSession = { ...base, status: 'running', startedAt: '2026-01-01T12:00:00Z' }
    expect(sessionRemainingMs(overrun, new Date('2026-01-01T13:00:00Z'))).toBe(0)
  })
})

describe('sessionUsedMinutes', () => {
  it('reports minutes elapsed for refund math on an early end', () => {
    const session: ScreenTimeSession = { ...base, status: 'running', startedAt: '2026-01-01T12:00:00Z' }
    expect(sessionUsedMinutes(session, new Date('2026-01-01T12:12:00Z'))).toBe(12)
  })
})
