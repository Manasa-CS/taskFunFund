import type { StateCreator } from 'zustand'
import { makeId } from '@/lib/ids'
import type { Reward, RewardRequest } from '../types'

export interface RewardsSlice {
  rewards: Record<string, Reward>
  rewardRequests: Record<string, RewardRequest>
  addReward: (reward: Omit<Reward, 'id'>) => string
  updateReward: (id: string, patch: Partial<Omit<Reward, 'id'>>) => void
  removeReward: (id: string) => void
  addRewardRequest: (request: Omit<RewardRequest, 'id'>) => string
  updateRewardRequest: (id: string, patch: Partial<Omit<RewardRequest, 'id'>>) => void
}

export const createRewardsSlice: StateCreator<RewardsSlice, [], [], RewardsSlice> = (set) => ({
  rewards: {},
  rewardRequests: {},

  addReward: (reward) => {
    const id = makeId()
    set((state) => ({ rewards: { ...state.rewards, [id]: { ...reward, id } } }))
    return id
  },

  updateReward: (id, patch) =>
    set((state) => {
      const existing = state.rewards[id]
      if (!existing) return state
      return { rewards: { ...state.rewards, [id]: { ...existing, ...patch } } }
    }),

  removeReward: (id) =>
    set((state) => {
      const next = { ...state.rewards }
      delete next[id]
      return { rewards: next }
    }),

  addRewardRequest: (request) => {
    const id = makeId()
    set((state) => ({ rewardRequests: { ...state.rewardRequests, [id]: { ...request, id } } }))
    return id
  },

  updateRewardRequest: (id, patch) =>
    set((state) => {
      const existing = state.rewardRequests[id]
      if (!existing) return state
      return { rewardRequests: { ...state.rewardRequests, [id]: { ...existing, ...patch } } }
    }),
})
