import { avatarEmoji, kidColor } from '@/features/kids/avatars'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'

/** Big avatar bubbles at the top of kid screens — tap a face to switch kids. */
export function KidSwitcher() {
  const kids = useStore((s) => s.kids)
  const activeKidId = useUiStore((s) => s.activeKidId)
  const setActiveKidId = useUiStore((s) => s.setActiveKidId)
  const kidList = Object.values(kids)

  if (kidList.length === 0) return null
  if (!activeKidId || !kids[activeKidId]) return null

  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-2" role="tablist" aria-label="Switch kid">
      {kidList.map((kid) => {
        const color = kidColor(kid.color)
        const isActive = kid.id === activeKidId
        return (
          <button
            key={kid.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveKidId(kid.id)}
            className="flex min-w-16 flex-col items-center gap-1"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl transition-transform ${color.bg} ${
                isActive ? 'scale-110 ring-2 ring-slate-700 ring-offset-2' : 'opacity-70'
              }`}
            >
              {avatarEmoji(kid.avatar)}
            </span>
            <span className="font-display max-w-16 truncate text-xs text-slate-600">
              {kid.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
