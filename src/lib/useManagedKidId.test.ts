import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { useManagedKidId } from './useManagedKidId'

describe('useManagedKidId', () => {
  beforeEach(async () => {
    await resetStores()
  })

  it('starts from the globally active kid when one is set', () => {
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useUiStore.getState().setActiveKidId(kidId)

    const { result } = renderHook(() => useManagedKidId())
    expect(result.current[0]).toBe(kidId)
  })

  it('falls back to the first kid when no global kid is active yet, even with several kids', async () => {
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useStore.getState().addKid({ name: 'Noah', avatar: 'owl', color: 'sky', dailyPointsTarget: 10 })
    // No setActiveKidId call — this is the "navigated straight to a parent page" scenario.

    const { result } = renderHook(() => useManagedKidId())
    await waitFor(() => expect(result.current[0]).toBe(kidId))
  })

  it('stays on null when there are no kids at all', () => {
    const { result } = renderHook(() => useManagedKidId())
    expect(result.current[0]).toBeNull()
  })

  it('respects an explicit manual selection and does not override it', async () => {
    useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    const noahId = useStore.getState().addKid({ name: 'Noah', avatar: 'owl', color: 'sky', dailyPointsTarget: 10 })

    const { result } = renderHook(() => useManagedKidId())
    act(() => result.current[1](noahId))

    expect(result.current[0]).toBe(noahId)
  })

  it('self-heals if the selected kid is removed while the page is open', async () => {
    const kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useUiStore.getState().setActiveKidId(kidId)
    const { result } = renderHook(() => useManagedKidId())
    expect(result.current[0]).toBe(kidId)

    let noahId = ''
    act(() => {
      useStore.getState().removeKid(kidId)
      noahId = useStore.getState().addKid({ name: 'Noah', avatar: 'owl', color: 'sky', dailyPointsTarget: 10 })
    })

    await waitFor(() => expect(result.current[0]).toBe(noahId))
  })
})
