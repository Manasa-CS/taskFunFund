import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { HomePage } from './HomePage'

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/parent" element={<p>Parent area</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HomePage landing behavior', () => {
  beforeEach(async () => {
    await resetStores()
  })

  it('shows Get Started with an import option when there is no data at all', () => {
    renderHome()

    expect(screen.getByRole('button', { name: /Get Started/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Import a backup/ })).toBeInTheDocument()
  })

  it('navigates to the parent area to create a new setup', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(screen.getByRole('button', { name: /Get Started/ }))
    expect(screen.getByText('Parent area')).toBeInTheDocument()
  })

  it('goes straight to the dashboard when exactly one kid exists, without asking', async () => {
    useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    renderHome()

    await waitFor(() => expect(screen.getByText(/Welcome back, Mira/)).toBeInTheDocument())
    expect(screen.queryByText(/Who's playing/)).not.toBeInTheDocument()
  })

  it('shows a kid picker when more than one kid exists, and resolves after picking one', async () => {
    useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useStore.getState().addKid({ name: 'Noah', avatar: 'owl', color: 'sky', dailyPointsTarget: 10 })
    const user = userEvent.setup()
    renderHome()

    expect(screen.getByText(/Who's playing/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Noah/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Noah/ }))
    expect(screen.getByText(/Welcome back, Noah/)).toBeInTheDocument()
  })

  it("doesn't re-prompt once a kid has already been chosen this session", () => {
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useStore.getState().addKid({ name: 'Noah', avatar: 'owl', color: 'sky', dailyPointsTarget: 10 })
    useUiStore.getState().setActiveKidId(kidId)
    renderHome()

    expect(screen.getByText(/Welcome back, Mira/)).toBeInTheDocument()
  })
})
