import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { AdjustPointsPage } from './AdjustPointsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <AdjustPointsPage />
    </MemoryRouter>,
  )
}

describe('AdjustPointsPage', () => {
  let kidId: string

  beforeEach(async () => {
    await resetStores()
    kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useUiStore.getState().setActiveKidId(kidId)
  })

  it('awards bonus points for a chosen (backdated) date', async () => {
    const user = userEvent.setup()
    renderPage()

    const [bonusPoints] = screen.getAllByLabelText('Points')
    const [bonusDate] = screen.getAllByLabelText('Date')
    fireEvent.change(bonusPoints, { target: { value: '7' } })
    fireEvent.change(bonusDate, { target: { value: '2026-01-01' } })
    await user.type(screen.getByPlaceholderText(/helped a sibling/), 'Great attitude all week')
    await user.click(screen.getByRole('button', { name: /Award 7 points/ }))

    const entries = Object.values(useStore.getState().logEntries)
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({
      sourceType: 'bonus',
      points: 7,
      dateISO: '2026-01-01',
      note: 'Great attitude all week',
    })
  })

  it('applies a penalty that only reduces the wallet, not locked Savings', async () => {
    useStore.getState().awardBonusPoints({ kidId, points: 20, dateISO: '2026-01-05', weekKey: '2026-W02' })
    const user = userEvent.setup()
    renderPage()

    const [, penaltyPoints] = screen.getAllByLabelText('Points')
    fireEvent.change(penaltyPoints, { target: { value: '5' } })
    await user.click(screen.getByRole('button', { name: /Deduct 5 points/ }))

    const penalty = Object.values(useStore.getState().logEntries).find((e) => e.sourceType === 'penalty')
    expect(penalty).toMatchObject({ points: -5, toSpend: -5, toSavings: 0 })
  })

  it('lists recent adjustments and can remove one', async () => {
    const user = userEvent.setup()
    useStore.getState().awardBonusPoints({ kidId, points: 4, dateISO: '2026-01-05', weekKey: '2026-W02', note: 'Nice job' })
    renderPage()

    expect(screen.getByText(/Nice job/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove this adjustment' }))

    expect(screen.queryByText(/Nice job/)).not.toBeInTheDocument()
    expect(Object.values(useStore.getState().logEntries)).toHaveLength(0)
  })

  it("doesn't let the date be set in the future", () => {
    renderPage()
    const dateInputs = screen.getAllByLabelText('Date')
    const today = new Date().toISOString().slice(0, 10)
    for (const input of dateInputs) {
      expect(input).toHaveAttribute('max', today)
    }
  })
})
