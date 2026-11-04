import { beforeEach, describe, expect, it } from 'vitest'
import { resetStores } from '@/test/testStore'
import { walletBalance, savingsBalance } from '@/lib/fund'
import { useStore } from '@/store/useStore'

describe('addEarning — savings percent clamping', () => {
  let kidId: string

  beforeEach(async () => {
    await resetStores()
    kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
  })

  it('clamps a stored savings percent below the minimum up to 10% when splitting', () => {
    useStore.getState().updateKid(kidId, { savingsPercent: 2 })
    const id = useStore
      .getState()
      .addEarning({ kidId, sourceType: 'task', sourceId: 't1', points: 100, dateISO: '2026-01-05', weekKey: '2026-W02' })

    expect(useStore.getState().logEntries[id]).toMatchObject({ toSpend: 90, toSavings: 10 })
  })

  it('clamps a stored savings percent above the maximum down to 100% when splitting', () => {
    useStore.getState().updateKid(kidId, { savingsPercent: 250 })
    const id = useStore
      .getState()
      .addEarning({ kidId, sourceType: 'task', sourceId: 't1', points: 10, dateISO: '2026-01-05', weekKey: '2026-W02' })

    expect(useStore.getState().logEntries[id]).toMatchObject({ toSpend: 0, toSavings: 10 })
  })
})

describe('awardBonusPoints / applyPenalty', () => {
  let kidId: string

  beforeEach(async () => {
    await resetStores()
    kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
  })

  it('awards a bonus that splits into wallet and savings like any other earning', () => {
    const id = useStore
      .getState()
      .awardBonusPoints({ kidId, points: 10, dateISO: '2026-01-05', weekKey: '2026-W02', note: 'Helped out' })

    const entry = useStore.getState().logEntries[id]
    expect(entry).toMatchObject({ sourceType: 'bonus', points: 10, toSpend: 8, toSavings: 2, note: 'Helped out' })
  })

  it('applies a penalty entirely against the wallet, leaving locked Savings untouched', () => {
    useStore.getState().awardBonusPoints({ kidId, points: 20, dateISO: '2026-01-05', weekKey: '2026-W02' })
    const savingsBefore = savingsBalance(Object.values(useStore.getState().logEntries), [], kidId)

    const id = useStore
      .getState()
      .applyPenalty({ kidId, points: 5, dateISO: '2026-01-06', weekKey: '2026-W02', note: 'Broke curfew' })

    const entry = useStore.getState().logEntries[id]
    expect(entry).toMatchObject({ sourceType: 'penalty', points: -5, toSpend: -5, toSavings: 0, note: 'Broke curfew' })

    const entries = Object.values(useStore.getState().logEntries)
    expect(walletBalance(entries, [], kidId, true, new Date('2026-01-06'), 1)).toBe(16 - 5)
    expect(savingsBalance(entries, [], kidId)).toBe(savingsBefore)
  })

  it('never lets the displayed wallet balance go negative even after a large penalty', () => {
    useStore.getState().awardBonusPoints({ kidId, points: 5, dateISO: '2026-01-05', weekKey: '2026-W02' })
    useStore.getState().applyPenalty({ kidId, points: 100, dateISO: '2026-01-06', weekKey: '2026-W02' })

    const entries = Object.values(useStore.getState().logEntries)
    expect(walletBalance(entries, [], kidId, true, new Date('2026-01-06'), 1)).toBe(0)
  })

  it('records the chosen (possibly backdated) date rather than today', () => {
    const id = useStore
      .getState()
      .awardBonusPoints({ kidId, points: 3, dateISO: '2020-06-01', weekKey: '2020-W23' })

    expect(useStore.getState().logEntries[id].dateISO).toBe('2020-06-01')
  })
})
