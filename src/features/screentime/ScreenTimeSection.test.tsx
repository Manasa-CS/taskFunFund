import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import type { Kid } from '@/store/types'
import { ScreenTimeSection } from './ScreenTimeSection'

describe('ScreenTimeSection', () => {
  let kid: Kid

  beforeEach(async () => {
    await resetStores()
    const kidId = useStore.getState().addKid({
      name: 'Mira',
      avatar: 'fox',
      color: 'sunny',
      dailyPointsTarget: 10,
      screenTimeEnabled: true,
    })
    useStore.getState().addScreenTimeOption({ kidId, label: 'TV', icon: '📺', pointsPer15Min: 5 })
    useStore.getState().addLogEntry({
      kidId,
      sourceType: 'task',
      sourceId: 't1',
      points: 20,
      toSpend: 20,
      toSavings: 0,
      dateISO: '2026-01-05',
      weekKey: '2026-W02',
    })
    kid = useStore.getState().kids[kidId]
  })

  it('buying a block starts a running session and deducts points', async () => {
    const user = userEvent.setup()
    render(<ScreenTimeSection kid={kid} />)

    await user.click(screen.getByRole('button', { name: /15 min = 5 pts/ }))

    await waitFor(() => {
      const sessions = Object.values(useStore.getState().screenTimeSessions)
      expect(sessions).toHaveLength(1)
      expect(sessions[0].status).toBe('running')
      expect(sessions[0].minutesBought).toBe(15)
    })
    const spends = Object.values(useStore.getState().spends)
    expect(spends).toHaveLength(1)
    expect(spends[0]).toMatchObject({ kind: 'screenTime', points: 5, minutes: 15 })
  })

  it('pause then resume keeps the session running without re-charging points', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ScreenTimeSection kid={kid} />)
    await user.click(screen.getByRole('button', { name: /15 min = 5 pts/ }))
    await waitFor(() => expect(Object.values(useStore.getState().screenTimeSessions)).toHaveLength(1))

    rerender(<ScreenTimeSection kid={kid} />)
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    await waitFor(() => {
      const session = Object.values(useStore.getState().screenTimeSessions)[0]
      expect(session.status).toBe('paused')
    })

    rerender(<ScreenTimeSection kid={kid} />)
    await user.click(screen.getByRole('button', { name: 'Resume' }))
    await waitFor(() => {
      const session = Object.values(useStore.getState().screenTimeSessions)[0]
      expect(session.status).toBe('running')
    })

    // Only ever charged once, for the original purchase.
    expect(Object.values(useStore.getState().spends)).toHaveLength(1)
  })
})
