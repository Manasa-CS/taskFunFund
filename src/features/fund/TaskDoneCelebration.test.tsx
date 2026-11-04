import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CelebrationEvent } from './celebrationQueue'
import { useCelebrationQueue } from './celebrationQueue'
import { TaskDoneCelebration } from './TaskDoneCelebration'

function push(overrides: Partial<Omit<CelebrationEvent, 'id' | 'at'>> = {}) {
  useCelebrationQueue.getState().push({
    kidId: 'kid-1',
    points: 2,
    toSpend: 1,
    toSavings: 1,
    fillLevel: 0.2,
    targetReached: false,
    ...overrides,
  })
}

describe('TaskDoneCelebration', () => {
  beforeEach(() => {
    useCelebrationQueue.getState().reset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the points earned and the real savings split', () => {
    render(<TaskDoneCelebration />)
    act(() => push({ points: 10, toSpend: 8, toSavings: 2 }))

    expect(screen.getByText('+10 points')).toBeInTheDocument()
    expect(screen.getByText('8 to spend · 2 saved 🐷')).toBeInTheDocument()
  })

  it('merges events that are queued within 1 second into a single celebration', () => {
    render(<TaskDoneCelebration />)
    act(() => {
      push({ points: 2, toSpend: 2, toSavings: 0 })
      push({ points: 4, toSpend: 4, toSavings: 0 })
    })

    expect(screen.getByText('+6 points')).toBeInTheDocument()
    expect(useCelebrationQueue.getState().queue).toHaveLength(1)
  })

  it('queues events more than 1 second apart to play one after another instead of merging', () => {
    vi.useFakeTimers()
    render(<TaskDoneCelebration />)
    act(() => push({ points: 1 }))
    act(() => {
      vi.advanceTimersByTime(1500)
      push({ points: 9 })
    })

    expect(useCelebrationQueue.getState().queue).toHaveLength(2)
  })

  it('shows the daily-target version when the fill level reaches 100%', () => {
    render(<TaskDoneCelebration />)
    act(() => push({ points: 5, fillLevel: 1, targetReached: true }))

    expect(screen.getByText('All done for today! 🎉')).toBeInTheDocument()
  })

  it('does not show the big finish message below the daily target', () => {
    render(<TaskDoneCelebration />)
    act(() => push({ points: 5, fillLevel: 0.5, targetReached: false }))

    expect(screen.queryByText('All done for today! 🎉')).not.toBeInTheDocument()
  })

  it('auto-dismisses and advances to the next queued event', () => {
    vi.useFakeTimers()
    render(<TaskDoneCelebration />)
    act(() => {
      push({ points: 1 })
    })
    act(() => {
      vi.advanceTimersByTime(1100)
      push({ points: 2 })
    })

    expect(useCelebrationQueue.getState().queue).toHaveLength(2)

    act(() => {
      vi.advanceTimersByTime(2100)
    })

    expect(useCelebrationQueue.getState().queue).toHaveLength(1)
    expect(useCelebrationQueue.getState().queue[0].points).toBe(2)
  })

  it('renders the reduced-motion path as a static points card at the new jar level', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia

    render(<TaskDoneCelebration />)
    act(() => push({ points: 3, toSpend: 2, toSavings: 1 }))

    expect(screen.getByText('+3 points')).toBeInTheDocument()
    expect(screen.getByText('2 to spend · 1 saved 🐷')).toBeInTheDocument()

    window.matchMedia = original
  })
})
