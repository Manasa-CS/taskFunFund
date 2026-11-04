import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IconPicker } from './IconPicker'

describe('IconPicker', () => {
  it('offers more than one default icon instead of a single fixed one', () => {
    render(<IconPicker value="⭐" onChange={() => {}} options={['⭐', '🎵', '🏃', '📖']} />)
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })

  it('marks the current value as selected', () => {
    render(<IconPicker value="🏃" onChange={() => {}} options={['⭐', '🎵', '🏃', '📖']} />)
    expect(screen.getByRole('radio', { name: '🏃' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: '⭐' })).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange when a grid option is picked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<IconPicker value="⭐" onChange={onChange} options={['⭐', '🎵', '🏃', '📖']} />)

    await user.click(screen.getByRole('radio', { name: '🎵' }))
    expect(onChange).toHaveBeenCalledWith('🎵')
  })

  it('still allows entering a custom icon outside the preset grid', () => {
    const onChange = vi.fn()
    render(<IconPicker value="" onChange={onChange} options={['⭐', '🎵']} />)

    fireEvent.change(screen.getByLabelText('Custom icon'), { target: { value: '🦄' } })
    expect(onChange).toHaveBeenCalledWith('🦄')
  })
})
