import { useCelebrationQueue } from '@/features/fund/celebrationQueue'
import { defaultSettings } from '@/store/defaults'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'

/** Resets both stores to a clean slate between component tests. */
export async function resetStores(): Promise<void> {
  await useStore.persist.clearStorage()
  useStore.setState(
    {
      kids: {},
      settings: defaultSettings,
      tasks: {},
      activities: {},
      funOptions: {},
      screenTimeOptions: {},
      screenTimeSessions: {},
      rewards: {},
      rewardRequests: {},
      logEntries: {},
      spends: {},
      certificates: {},
      rerollsUsed: {},
      savingsWithdrawalRequests: {},
    },
    false,
  )
  useUiStore.setState({ activeKidId: null, isParentUnlocked: false, modalStack: [] }, false)
  useCelebrationQueue.getState().reset()
}
