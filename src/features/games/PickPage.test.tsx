import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { PickPage } from './PickPage'

describe('PickPage', () => {
  beforeEach(async () => {
    await resetStores()
  })

  it('a game picks an activity and reveals it with a "Let\'s go!" action', async () => {
    const user = userEvent.setup()
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useStore.getState().addActivity({
      kidId,
      title: 'Puzzle',
      icon: '🧩',
      category: 'creative',
      goalType: 'done',
      goalValue: 1,
      points: 2,
      active: true,
    })
    useUiStore.getState().setActiveKidId(kidId)

    render(
      <MemoryRouter>
        <PickPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByText('Mystery Box'))
    const box = await screen.findByText('🎁')
    await user.click(box)

    await waitFor(() => expect(screen.getByRole('button', { name: "Let's go!" })).toBeInTheDocument(), {
      timeout: 3000,
    })
    expect(screen.getByText('Puzzle')).toBeInTheDocument()
  })

  it('shows an all-done message once the pool is empty', () => {
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useUiStore.getState().setActiveKidId(kidId)

    render(
      <MemoryRouter>
        <PickPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/All done today/)).toBeInTheDocument()
  })
})
