import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppStore, useStore } from './useStore'

describe('persisted store', () => {
  beforeEach(async () => {
    await useStore.persist.clearStorage()
  })

  it('survives a simulated reload (write, then re-create the store from storage)', async () => {
    const kidId = useStore.getState().addKid({
      name: 'Aria',
      avatar: 'fox',
      color: 'coral',
    })

    // Wait for the async storage write triggered by the state change to land.
    await vi.waitFor(async () => {
      const persisted = await useStore.persist.getOptions().storage?.getItem('taskfunfund-store')
      expect(JSON.stringify(persisted)).toContain('Aria')
    })

    // Simulate the app being closed and reopened: a brand new store instance
    // reading the same underlying storage, as if the page had just loaded.
    const reopened = createAppStore()
    await vi.waitFor(() => expect(reopened.persist.hasHydrated()).toBe(true))

    expect(reopened.getState().kids[kidId]?.name).toBe('Aria')
  })

  it('never corrupts history when rates change — stars/money are derived, not stored', () => {
    const kidId = useStore.getState().addKid({ name: 'Zoe', avatar: 'owl', color: 'mint' })
    useStore.getState().addLogEntry({
      kidId,
      sourceType: 'task',
      sourceId: 'task-1',
      points: 10,
      toSpend: 10,
      toSavings: 0,
      dateISO: '2026-01-05',
      weekKey: '2026-W02',
    })

    const entry = Object.values(useStore.getState().logEntries)[0]
    expect(entry.points).toBe(10)
    // The log only ever stores raw points — stars/money come from lib/fund.ts at read time.
    expect(entry).not.toHaveProperty('stars')
    expect(entry).not.toHaveProperty('money')
  })
})
