import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { ApprovalsPage } from './ApprovalsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <ApprovalsPage />
    </MemoryRouter>,
  )
}

describe('ApprovalsPage — savings withdrawal approval', () => {
  let kidId: string

  beforeEach(async () => {
    await resetStores()
    kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    await useStore.getState().setParentPin('1234')
    // 20 points at the default 20% split -> 4 points land in Savings.
    useStore.getState().addEarning({
      kidId,
      sourceType: 'task',
      sourceId: 't1',
      points: 20,
      dateISO: '2026-01-05',
      weekKey: '2026-W02',
    })
    useStore.getState().requestSavingsWithdrawal({ kidId, amount: 3, reason: 'new book', dateISO: '2026-01-06' })
  })

  it('rejects approval with the wrong PIN, leaving the request pending', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Approve' }))
    await user.type(screen.getByLabelText(/Confirm your PIN/), '0000')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(screen.getByText(/Wrong PIN/)).toBeInTheDocument())
    expect(Object.values(useStore.getState().savingsWithdrawalRequests)[0].status).toBe('pending')
    expect(Object.values(useStore.getState().spends)).toHaveLength(0)
  })

  it('approves the withdrawal once the correct PIN is confirmed, recording a Spend', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Approve' }))
    await user.type(screen.getByLabelText(/Confirm your PIN/), '1234')
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(Object.values(useStore.getState().savingsWithdrawalRequests)[0].status).toBe('approved')
    })
    const spends = Object.values(useStore.getState().spends)
    expect(spends).toHaveLength(1)
    expect(spends[0]).toMatchObject({ kind: 'savingsWithdrawal', kidId, points: 3 })
  })

  it('declining needs no PIN and leaves no Spend behind', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Decline' }))

    await waitFor(() => {
      expect(Object.values(useStore.getState().savingsWithdrawalRequests)[0].status).toBe('declined')
    })
    expect(Object.values(useStore.getState().spends)).toHaveLength(0)
  })

  it('disables Approve when it would breach the kid\'s minimum savings balance', async () => {
    useStore.getState().updateKid(kidId, { minSavingsBalance: 2 })
    // Current savings = 4; withdrawing 3 would leave 1, below the 2-point floor.
    renderPage()

    expect(screen.getByText(/below the 2-point minimum/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled()
  })
})
