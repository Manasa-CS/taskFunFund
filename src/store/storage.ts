import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import type { StateStorage } from 'zustand/middleware'

/**
 * One storage interface backed by Capacitor Preferences on native apps
 * and IndexedDB on web, so the same persisted store works everywhere.
 */
export const storage: StateStorage = Capacitor.isNativePlatform()
  ? {
      getItem: async (name) => (await Preferences.get({ key: name })).value,
      setItem: async (name, value) => {
        await Preferences.set({ key: name, value })
      },
      removeItem: async (name) => {
        await Preferences.remove({ key: name })
      },
    }
  : {
      getItem: async (name) => (await idbGet(name)) ?? null,
      setItem: async (name, value) => {
        await idbSet(name, value)
      },
      removeItem: async (name) => {
        await idbDel(name)
      },
    }

/** Asks the browser not to evict our data under storage pressure (web only). */
export async function requestPersistentStorage(): Promise<void> {
  if (!Capacitor.isNativePlatform() && navigator.storage?.persist) {
    await navigator.storage.persist()
  }
}
