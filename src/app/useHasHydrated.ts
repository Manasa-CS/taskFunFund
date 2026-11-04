import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'

/** True once the persisted store has finished loading from storage. */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated())

  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
