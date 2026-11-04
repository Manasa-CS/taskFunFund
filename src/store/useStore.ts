import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { CURRENT_SCHEMA_VERSION, migrate } from './migrations'
import { type ActivitiesSlice, createActivitiesSlice } from './slices/activitiesSlice'
import { type CertificatesSlice, createCertificatesSlice } from './slices/certificatesSlice'
import { createFunSlice, type FunSlice } from './slices/funSlice'
import { createKidsSlice, type KidsSlice } from './slices/kidsSlice'
import { createLogSlice, type LogSlice } from './slices/logSlice'
import { createPickSlice, type PickSlice } from './slices/pickSlice'
import { createRewardsSlice, type RewardsSlice } from './slices/rewardsSlice'
import { createSavingsSlice, type SavingsSlice } from './slices/savingsSlice'
import { createScreenTimeSlice, type ScreenTimeSlice } from './slices/screenTimeSlice'
import { createSettingsSlice, type SettingsSlice } from './slices/settingsSlice'
import { createTasksSlice, type TasksSlice } from './slices/tasksSlice'
import { storage } from './storage'

export type AppState = KidsSlice &
  SettingsSlice &
  TasksSlice &
  ActivitiesSlice &
  FunSlice &
  ScreenTimeSlice &
  RewardsSlice &
  LogSlice &
  CertificatesSlice &
  PickSlice &
  SavingsSlice

/** Builds a fresh persisted store instance, assembled from one slice per data domain. */
export function createAppStore() {
  return create<AppState>()(
    persist(
      (...a) => ({
        ...createKidsSlice(...a),
        ...createSettingsSlice(...a),
        ...createTasksSlice(...a),
        ...createActivitiesSlice(...a),
        ...createFunSlice(...a),
        ...createScreenTimeSlice(...a),
        ...createRewardsSlice(...a),
        ...createLogSlice(...a),
        ...createCertificatesSlice(...a),
        ...createPickSlice(...a),
        ...createSavingsSlice(...a),
      }),
      {
        name: 'taskfunfund-store',
        storage: createJSONStorage(() => storage),
        version: CURRENT_SCHEMA_VERSION,
        migrate,
      },
    ),
  )
}

/** The single persisted app store used throughout the app. */
export const useStore = createAppStore()
