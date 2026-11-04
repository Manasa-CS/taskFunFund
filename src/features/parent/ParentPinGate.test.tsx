import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { ParentPinGate } from './ParentPinGate'

describe('ParentPinGate', () => {
  beforeEach(async () => {
    await resetStores()
    await useStore.getState().setParentPin('1234')
  })

  it('rejects the wrong PIN and keeps the app locked', async () => {
    const user = userEvent.setup()
    render(<ParentPinGate />)

    await user.type(screen.getByLabelText(/Enter your 4-digit PIN/), '0000')
    await user.click(screen.getByRole('button', { name: 'Unlock' }))

    await waitFor(() => expect(screen.getByText(/Wrong PIN/)).toBeInTheDocument())
    expect(useUiStore.getState().isParentUnlocked).toBe(false)
  })

  it('unlocks parent mode with the correct PIN', async () => {
    const user = userEvent.setup()
    render(<ParentPinGate />)

    await user.type(screen.getByLabelText(/Enter your 4-digit PIN/), '1234')
    await user.click(screen.getByRole('button', { name: 'Unlock' }))

    await waitFor(() => expect(useUiStore.getState().isParentUnlocked).toBe(true))
  })
})
