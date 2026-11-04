import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts down from the total', () => {
    const { result } = renderHook(() => useCountdown(60_000))
    expect(result.current.remainingMs).toBe(60_000)
  })

  it('derives remaining time from wall-clock time, so backgrounding (no ticks firing) stays accurate', () => {
    const { result } = renderHook(() => useCountdown(60_000))
    act(() => result.current.start())

    // Simulate the tab being backgrounded: 45s pass. advanceTimersByTime both moves
    // the clock forward and fires the interval tick(s) due in that window.
    act(() => vi.advanceTimersByTime(45_000))

    expect(result.current.remainingMs).toBe(15_000)
  })

  it('pause freezes the remaining time and resume continues from there', () => {
    const { result } = renderHook(() => useCountdown(60_000))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(20_000))
    act(() => result.current.pause())
    expect(result.current.remainingMs).toBe(40_000)

    // Time passes while paused — should not count down further.
    act(() => vi.advanceTimersByTime(5 * 60_000))
    expect(result.current.remainingMs).toBe(40_000)

    act(() => result.current.resume())
    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current.remainingMs).toBe(30_000)
  })

  it('never goes below zero', () => {
    const { result } = renderHook(() => useCountdown(10_000))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current.remainingMs).toBe(0)
  })
})
