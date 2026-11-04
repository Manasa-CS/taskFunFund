import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { ActivityRunPage } from './ActivityRunPage'

describe('ActivityRunPage', () => {
  beforeEach(async () => {
    await resetStores()
  })

  it('finishing a "done"-type activity logs its points immediately', async () => {
    const user = userEvent.setup()
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    const activityId = useStore.getState().addActivity({
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
      <MemoryRouter initialEntries={[`/activities/${activityId}`]}>
        <Routes>
          <Route path="/activities/:id" element={<ActivityRunPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /I did it myself/ }))

    await waitFor(() => {
      const entries = Object.values(useStore.getState().logEntries)
      expect(entries).toHaveLength(1)
      expect(entries[0]).toMatchObject({ sourceType: 'activity', sourceId: activityId, points: 2 })
    })
  })

  it('withholds points when the kid requires activity approval', async () => {
    const user = userEvent.setup()
    const kidId = useStore.getState().addKid({
      name: 'Mira',
      avatar: 'fox',
      color: 'sunny',
      dailyPointsTarget: 10,
      requireActivityApproval: true,
    })
    const activityId = useStore.getState().addActivity({
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
      <MemoryRouter initialEntries={[`/activities/${activityId}`]}>
        <Routes>
          <Route path="/activities/:id" element={<ActivityRunPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /I did it myself/ }))

    await waitFor(() => {
      const entries = Object.values(useStore.getState().logEntries)
      expect(entries).toHaveLength(1)
      expect(entries[0].approved).toBe(false)
    })
    expect(screen.getByText(/Waiting for a grown-up/)).toBeInTheDocument()
  })

  it('logs a catch-up completion under the date passed from the Activities list, not today', async () => {
    const user = userEvent.setup()
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    const activityId = useStore.getState().addActivity({
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
      <MemoryRouter
        initialEntries={[{ pathname: `/activities/${activityId}`, state: { dateISO: '2026-03-10' } }]}
      >
        <Routes>
          <Route path="/activities/:id" element={<ActivityRunPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText(/Logging this for/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /I did it myself/ }))

    await waitFor(() => {
      const entries = Object.values(useStore.getState().logEntries)
      expect(entries).toHaveLength(1)
      expect(entries[0]).toMatchObject({ sourceType: 'activity', sourceId: activityId, dateISO: '2026-03-10' })
    })
  })
})
