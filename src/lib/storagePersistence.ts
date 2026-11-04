import { Capacitor } from '@capacitor/core'
import { useEffect, useState } from 'react'

/** Whether the browser has granted persistent storage; null if unknown, unsupported, or native. */
export function useStoragePersisted(): boolean | null {
  const [persisted, setPersisted] = useState<boolean | null>(null)

  useEffect(() => {
    if (Capacitor.isNativePlatform() || !navigator.storage?.persisted) return
    navigator.storage.persisted().then(setPersisted)
  }, [])

  return persisted
}
