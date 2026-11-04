import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { TasksPage } from './TasksPage'

const allDays = [0, 1, 2, 3, 4, 5, 6] as const

describe('TasksPage', () => {
  beforeEach(async () => {
    await resetStores()
  })

  it('ticking a task awards its points and marks it done, and a second tap does not double-count', async () => {
    const user = userEvent.setup()
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useStore.getState().addTask({
      kidId,
      title: 'Make my bed',
      icon: '🛏️',
      points: 3,
      daysOfWeek: [...allDays],
      timeOfDay: 'morning',
      active: true,
    })
    useUiStore.getState().setActiveKidId(kidId)

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/0 of 10 points/)).toBeInTheDocument()

    const taskButton = screen.getByRole('button', { name: /Make my bed/ })
    await user.click(taskButton)

    await waitFor(() => expect(screen.getByText(/3 of 10 points/)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Make my bed/ })).toBeDisabled()

    // Tapping again should be a no-op since the button is now disabled.
    await user.click(screen.getByRole('button', { name: /Make my bed/ }))
    expect(screen.getByText(/3 of 10 points/)).toBeInTheDocument()

    const logEntries = Object.values(useStore.getState().logEntries).filter((e) => e.sourceType === 'task')
    expect(logEntries).toHaveLength(1)
  })

  it('shows a friendly empty state when nothing is scheduled today', () => {
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useUiStore.getState().setActiveKidId(kidId)

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/No tasks scheduled for this day/)).toBeInTheDocument()
  })
})

describe('TasksPage — catching up on a recent day', () => {
  beforeEach(async () => {
    await resetStores()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 15)) // Sun Mar 15 2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('logs a completed task under the selected past date, not today', () => {
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useStore.getState().addTask({
      kidId,
      title: 'Make my bed',
      icon: '🛏️',
      points: 3,
      daysOfWeek: [...allDays],
      timeOfDay: 'morning',
      active: true,
    })
    useUiStore.getState().setActiveKidId(kidId)

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))
    expect(screen.getByText('Sat, Mar 14')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Make my bed/ }))

    const entries = Object.values(useStore.getState().logEntries).filter((e) => e.sourceType === 'task')
    expect(entries).toHaveLength(1)
    expect(entries[0].dateISO).toBe('2026-03-14')
  })

  it('does not let the kid go back more than two weeks', () => {
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useUiStore.getState().setActiveKidId(kidId)

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>,
    )

    for (let i = 0; i < 14; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))
    }
    expect(screen.getByRole('button', { name: 'Previous day' })).toBeDisabled()

    // One more click should be a no-op, not go past the 14-day limit.
    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))
    expect(screen.getByText('Sun, Mar 1')).toBeInTheDocument()
  })
})
