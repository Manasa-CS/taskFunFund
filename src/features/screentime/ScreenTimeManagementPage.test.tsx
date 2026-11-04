import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { ScreenTimeManagementPage } from './ScreenTimeManagementPage'

describe('ScreenTimeManagementPage — end early with refund', () => {
  beforeEach(async () => {
    await resetStores()
  })

  it('refunds points for unused minutes when a parent ends a session early', async () => {
    const user = userEvent.setup()
    const kidId = useStore.getState().addKid({
      name: 'Mira',
      avatar: 'fox',
      color: 'sunny',
      dailyPointsTarget: 10,
      screenTimeEnabled: true,
    })
    const optionId = useStore.getState().addScreenTimeOption({ kidId, label: 'TV', icon: '📺', pointsPer15Min: 5 })
    // A 60-minute session that just started — effectively all of it is unused.
    useStore.getState().addScreenTimeSession({
      kidId,
      optionId,
      minutesBought: 60,
      startedAt: new Date().toISOString(),
      status: 'running',
    })
    useUiStore.getState().setActiveKidId(kidId)

    render(
      <MemoryRouter>
        <ScreenTimeManagementPage />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: /End early & refund/ }))

    await waitFor(() => {
      const session = Object.values(useStore.getState().screenTimeSessions)[0]
      expect(session.status).toBe('done')
    })

    const refundEntry = Object.values(useStore.getState().logEntries).find((e) =>
      e.sourceId.startsWith('screenTimeRefund-'),
    )
    expect(refundEntry).toBeDefined()
    // ~60 unused minutes at 5 pts/15min ≈ 20 points refunded.
    expect(refundEntry!.points).toBeGreaterThanOrEqual(15)
  })
})
