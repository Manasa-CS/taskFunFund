import type { StateCreator } from 'zustand'
import { hashPin, verifyPin } from '@/lib/pin'
import { defaultSettings } from '../defaults'
import type { Settings } from '../types'

export interface SettingsSlice {
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
  setParentPin: (pin: string) => Promise<void>
  checkParentPin: (pin: string) => Promise<boolean>
}

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (
  set,
  get,
) => ({
  settings: defaultSettings,

  updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

  setParentPin: async (pin) => {
    const parentPinHash = await hashPin(pin)
    set((state) => ({ settings: { ...state.settings, parentPinHash } }))
  },

  checkParentPin: async (pin) => {
    const { parentPinHash } = get().settings
    if (!parentPinHash) return false
    return verifyPin(pin, parentPinHash)
  },
})
