import { beforeEach, describe, expect, it } from 'vitest'
import { resetStores } from '@/test/testStore'
import { savingsBalance } from '@/lib/fund'
import { useStore } from '@/store/useStore'

describe('savings withdrawal requests', () => {
  let kidId: string

  beforeEach(async () => {
    await resetStores()
    kidId = useStore.getState().addKid({ name: 'Mira', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    // 20 points at the default 20% split -> toSpend 16, toSavings 4.
    useStore.getState().addEarning({
      kidId,
      sourceType: 'task',
      sourceId: 't1',
      points: 20,
      dateISO: '2026-01-05',
      weekKey: '2026-W02',
    })
  })

  it('requestSavingsWithdrawal creates a pending request and does not touch the balance', () => {
    const before = savingsBalance(Object.values(useStore.getState().logEntries), [], kidId)
    const id = useStore
      .getState()
      .requestSavingsWithdrawal({ kidId, amount: 2, reason: 'new shoes', dateISO: '2026-01-06' })

    const request = useStore.getState().savingsWithdrawalRequests[id]
    expect(request).toMatchObject({ kidId, amount: 2, reason: 'new shoes', status: 'pending' })
    expect(savingsBalance(Object.values(useStore.getState().logEntries), Object.values(useStore.getState().spends), kidId)).toBe(before)
  })

  it('approveSavingsWithdrawal records a Spend and reduces the savings balance', () => {
    const id = useStore
      .getState()
      .requestSavingsWithdrawal({ kidId, amount: 3, reason: 'book', dateISO: '2026-01-06' })

    useStore.getState().approveSavingsWithdrawal(id)

    expect(useStore.getState().savingsWithdrawalRequests[id].status).toBe('approved')
    const spends = Object.values(useStore.getState().spends)
    expect(spends).toHaveLength(1)
    expect(spends[0]).toMatchObject({ kind: 'savingsWithdrawal', kidId, points: 3, refId: id })

    const entries = Object.values(useStore.getState().logEntries)
    expect(savingsBalance(entries, spends, kidId)).toBe(1) // 4 earned - 3 withdrawn
  })

  it('declineSavingsWithdrawal marks the request declined without recording a Spend', () => {
    const id = useStore
      .getState()
      .requestSavingsWithdrawal({ kidId, amount: 3, reason: 'book', dateISO: '2026-01-06' })

    useStore.getState().declineSavingsWithdrawal(id)

    expect(useStore.getState().savingsWithdrawalRequests[id].status).toBe('declined')
    expect(Object.values(useStore.getState().spends)).toHaveLength(0)
    const entries = Object.values(useStore.getState().logEntries)
    expect(savingsBalance(entries, [], kidId)).toBe(4) // untouched
  })

  it('approveSavingsWithdrawal is a no-op on an already-decided request', () => {
    const id = useStore
      .getState()
      .requestSavingsWithdrawal({ kidId, amount: 3, reason: 'book', dateISO: '2026-01-06' })
    useStore.getState().declineSavingsWithdrawal(id)

    useStore.getState().approveSavingsWithdrawal(id)

    expect(useStore.getState().savingsWithdrawalRequests[id].status).toBe('declined')
    expect(Object.values(useStore.getState().spends)).toHaveLength(0)
  })

  it('a wallet-only spend (reward/screenTime/cashOut) never reduces the savings balance', () => {
    useStore.getState().addSpend({
      kidId,
      kind: 'reward',
      refId: 'r1',
      points: 10,
      dateISO: '2026-01-06',
      weekKey: '2026-W02',
    })
    const entries = Object.values(useStore.getState().logEntries)
    const spends = Object.values(useStore.getState().spends)
    expect(savingsBalance(entries, spends, kidId)).toBe(4)
  })
})
