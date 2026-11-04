import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Card } from '@/components/Card'
import { Celebration } from '@/components/Celebration'
import { getWeekKey, toDateISO } from '@/lib/dates'
import { playTick } from '@/lib/sounds'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import type { FunOption } from '@/store/types'

/** Kid-facing list of free fun options — always available, never gated behind tasks. */
export function FunListPage() {
  const activeKidId = useUiStore((s) => s.activeKidId)
  const kid = useStore((s) => (activeKidId ? s.kids[activeKidId] : undefined))
  const funOptions = useStore((s) => s.funOptions)
  const addEarning = useStore((s) => s.addEarning)
  const weekStartsOn = useStore((s) => s.settings.weekStartsOn)
  const today = useToday()
  const [celebrating, setCelebrating] = useState<FunOption | null>(null)

  if (!kid) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <p className="text-slate-600">No kid selected yet.</p>
        </Card>
      </div>
    )
  }

  const options = Object.values(funOptions).filter((f) => f.kidId === kid.id && f.active)

  function enjoy(option: FunOption) {
    if (!kid) return
    addEarning({
      kidId: kid.id,
      sourceType: 'fun',
      sourceId: option.id,
      points: 0,
      minutes: option.minutes,
      dateISO: toDateISO(today),
      weekKey: getWeekKey(today, weekStartsOn),
    })
    playTick()
    setCelebrating(option)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/" label="Home" />
      <h1 className="font-display text-3xl text-slate-800">Fun!</h1>
      {options.length === 0 && (
        <Card>
          <p className="text-slate-600">No fun options yet — ask a grown-up to add some!</p>
        </Card>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <button key={option.id} type="button" className="w-full" onClick={() => enjoy(option)}>
            <Card className="flex items-center gap-3 text-left transition-transform hover:scale-[1.01]">
              <span className="text-2xl">{option.icon}</span>
              <div className="flex-1">
                <p className="font-display text-slate-800">{option.title}</p>
                {option.minutes && <p className="text-xs text-slate-500">{option.minutes} min</p>}
              </div>
            </Card>
          </button>
        ))}
      </div>

      <Celebration
        open={celebrating !== null}
        emoji={celebrating?.icon ?? '🎈'}
        message="Hope that was fun!"
        onDone={() => setCelebrating(null)}
      />
    </div>
  )
}
