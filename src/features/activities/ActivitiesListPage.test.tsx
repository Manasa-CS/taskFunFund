import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { ActivitiesListPage } from './ActivitiesListPage'

function ShowNavState() {
  const location = useLocation()
  return <p>Nav state: {JSON.stringify(location.state)}</p>
}

describe('ActivitiesListPage — catching up on a recent day', () => {
  beforeEach(async () => {
    await resetStores()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 15)) // Sun Mar 15 2026
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('an activity already done on the selected past date drops off the list for that date', () => {
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
    useStore.getState().addEarning({
      kidId,
      sourceType: 'activity',
      sourceId: activityId,
      points: 2,
      dateISO: '2026-03-14',
      weekKey: '2026-W11',
    })
    useUiStore.getState().setActiveKidId(kidId)

    render(
      <MemoryRouter>
        <ActivitiesListPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Puzzle')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))
    expect(screen.queryByText('Puzzle')).not.toBeInTheDocument()
  })

  it('links into the activity carrying the selected date so the completion logs under it', () => {
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
        <Routes>
          <Route path="/" element={<ActivitiesListPage />} />
          <Route path="/activities/:id" element={<ShowNavState />} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))
    fireEvent.click(screen.getByRole('link', { name: /Puzzle/ }))

    expect(screen.getByText(/"dateISO":"2026-03-14"/)).toBeInTheDocument()
  })
})
