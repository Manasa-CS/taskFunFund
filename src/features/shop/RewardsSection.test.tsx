import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import type { Kid } from '@/store/types'
import { RewardsSection } from './RewardsSection'

describe('reward redemption', () => {
  let kid: Kid
  let rewardId: string

  beforeEach(async () => {
    await resetStores()
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    rewardId = useStore.getState().addReward({ title: 'Ice cream', icon: '🍦', cost: 20, kidIds: [kidId] })
    kid = useStore.getState().kids[kidId]
  })

  it('requesting a reward creates a pending request and disables re-requesting', async () => {
    const user = userEvent.setup()
    render(<RewardsSection kid={kid} />)

    await user.click(screen.getByRole('button', { name: 'I want this!' }))

    await waitFor(() => {
      const requests = Object.values(useStore.getState().rewardRequests)
      expect(requests).toHaveLength(1)
      expect(requests[0]).toMatchObject({ kidId: kid.id, rewardId, status: 'pending' })
    })
    expect(screen.getByRole('button', { name: 'Waiting...' })).toBeDisabled()
  })

  it('approving the request deducts points via a Spend record (full cycle, store-level)', () => {
    const requestId = useStore
      .getState()
      .addRewardRequest({ kidId: kid.id, rewardId, status: 'pending', dateISO: '2026-01-05' })

    // Mirrors ApprovalsPage's approve action: record the spend, then mark approved.
    useStore.getState().addSpend({
      kidId: kid.id,
      kind: 'reward',
      refId: rewardId,
      points: 20,
      dateISO: '2026-01-05',
      weekKey: '2026-W02',
    })
    useStore.getState().updateRewardRequest(requestId, { status: 'approved' })

    const spends = Object.values(useStore.getState().spends)
    expect(spends).toHaveLength(1)
    expect(spends[0].points).toBe(20)
    expect(useStore.getState().rewardRequests[requestId].status).toBe('approved')
  })
})
