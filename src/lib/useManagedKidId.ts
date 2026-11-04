import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'

/**
 * A parent management page's own kid selection — starts from the globally active kid, but
 * self-heals to the first available kid whenever it's unset or points at a kid that no
 * longer exists (e.g. no kid has been chosen globally yet, or the selected kid was removed).
 */
export function useManagedKidId(): [string | null, (id: string) => void] {
  const activeKidId = useUiStore((s) => s.activeKidId)
  const kids = useStore((s) => s.kids)
  const [kidId, setKidId] = useState<string | null>(activeKidId)

  useEffect(() => {
    if (kidId && kids[kidId]) return
    const fallback = activeKidId && kids[activeKidId] ? activeKidId : Object.values(kids)[0]?.id
    if (fallback) setKidId(fallback)
  }, [kidId, activeKidId, kids])

  return [kidId, setKidId]
}
