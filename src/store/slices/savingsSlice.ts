import type { StateCreator } from 'zustand'
import { getWeekKey, toDateISO } from '@/lib/dates'
import { makeId } from '@/lib/ids'
import type { SavingsWithdrawalRequest } from '../types'
import type { AppState } from '../useStore'

export interface SavingsSlice {
  savingsWithdrawalRequests: Record<string, SavingsWithdrawalRequest>
  requestSavingsWithdrawal: (request: Omit<SavingsWithdrawalRequest, 'id' | 'status'>) => string
  /** Approves a pending withdrawal: records a wallet-exempt Spend and marks the request approved. */
  approveSavingsWithdrawal: (id: string) => void
  declineSavingsWithdrawal: (id: string) => void
}

export const createSavingsSlice: StateCreator<AppState, [], [], SavingsSlice> = (set, get) => ({
  savingsWithdrawalRequests: {},

  requestSavingsWithdrawal: (request) => {
    const id = makeId()
    const full: SavingsWithdrawalRequest = { ...request, id, status: 'pending' }
    set((state) => ({ savingsWithdrawalRequests: { ...state.savingsWithdrawalRequests, [id]: full } }))
    return id
  },

  approveSavingsWithdrawal: (id) => {
    const request = get().savingsWithdrawalRequests[id]
    if (!request || request.status !== 'pending') return
    const now = new Date()
    get().addSpend({
      kidId: request.kidId,
      kind: 'savingsWithdrawal',
      refId: id,
      points: request.amount,
      dateISO: toDateISO(now),
      weekKey: getWeekKey(now, get().settings.weekStartsOn),
    })
    set((state) => ({
      savingsWithdrawalRequests: {
        ...state.savingsWithdrawalRequests,
        [id]: { ...request, status: 'approved' },
      },
    }))
  },

  declineSavingsWithdrawal: (id) =>
    set((state) => {
      const request = state.savingsWithdrawalRequests[id]
      if (!request) return state
      return {
        savingsWithdrawalRequests: { ...state.savingsWithdrawalRequests, [id]: { ...request, status: 'declined' } },
      }
    }),
})
