import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toDateISO } from '@/lib/dates'
import { RecentDatePicker } from './RecentDatePicker'

const today = new Date(2026, 2, 15) // Sun Mar 15 2026
const todayISO = toDateISO(today)

describe('RecentDatePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(today)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows "Today" and disables going further forward when on today', () => {
    render(<RecentDatePicker dateISO={todayISO} onChange={() => {}} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next day' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous day' })).toBeEnabled()
  })

  it('steps one day back and calls onChange with that date', () => {
    const onChange = vi.fn()
    render(<RecentDatePicker dateISO={todayISO} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))
    expect(onChange).toHaveBeenCalledWith('2026-03-14')
  })

  it('disables going further back once the maxDaysBack limit is reached', () => {
    const oldest = '2026-03-01' // exactly 14 days before 2026-03-15
    render(<RecentDatePicker dateISO={oldest} onChange={() => {}} maxDaysBack={14} />)
    expect(screen.getByRole('button', { name: 'Previous day' })).toBeDisabled()
  })

  it('never calls onChange with a date before the limit even if clicked', () => {
    const onChange = vi.fn()
    render(<RecentDatePicker dateISO="2026-03-01" onChange={onChange} maxDaysBack={14} />)

    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('offers a quick jump back to today when viewing a past date', () => {
    const onChange = vi.fn()
    render(<RecentDatePicker dateISO="2026-03-10" onChange={onChange} />)

    expect(screen.queryByText('Today')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Back to today'))
    expect(onChange).toHaveBeenCalledWith(todayISO)
  })
})
