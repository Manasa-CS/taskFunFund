import { avatarEmoji, kidColor } from '@/features/kids/avatars'
import { useUiStore } from '@/store/uiStore'
import type { Kid } from '@/store/types'

interface ChooseKidPageProps {
  kids: Kid[]
}

/** Landing screen when more than one kid profile exists: tap a face to continue as that kid. */
export function ChooseKidPage({ kids }: ChooseKidPageProps) {
  const setActiveKidId = useUiStore((s) => s.setActiveKidId)

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 text-center">
      <h1 className="font-display pt-4 text-3xl text-slate-800">Who's playing? 👋</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {kids.map((kid) => {
          const color = kidColor(kid.color)
          return (
            <button
              key={kid.id}
              type="button"
              onClick={() => setActiveKidId(kid.id)}
              className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-transform hover:scale-105 active:scale-95"
            >
              <span className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl ${color.bg}`}>
                {avatarEmoji(kid.avatar)}
              </span>
              <span className="font-display text-lg text-slate-700">{kid.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
