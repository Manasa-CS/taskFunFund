import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Celebration } from '@/components/Celebration'
import { pushEarningCelebration } from '@/features/fund/pushEarningCelebration'
import { getWeekKey, parseDateISO, toDateISO } from '@/lib/dates'
import { playSuccessChime } from '@/lib/sounds'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { useCountdown } from './useCountdown'

const PICK_BONUS_POINTS = 1

function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Kid-facing activity screen: a timer, a tap counter, or a single "I did it!" button, by goal type. */
export function ActivityRunPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const navState = location.state as { fromPick?: boolean; dateISO?: string } | null
  const fromPick = Boolean(navState?.fromPick)
  const activeKidId = useUiStore((s) => s.activeKidId)
  const kid = useStore((s) => (activeKidId ? s.kids[activeKidId] : undefined))
  const activity = useStore((s) => (id ? s.activities[id] : undefined))
  const addEarning = useStore((s) => s.addEarning)
  const weekStartsOn = useStore((s) => s.settings.weekStartsOn)
  const today = useToday()
  const todayISO = toDateISO(today)
  const logDateISO = navState?.dateISO ?? todayISO
  const isBackdated = logDateISO !== todayISO

  const [count, setCount] = useState(0)
  const [note, setNote] = useState('')
  const [celebrating, setCelebrating] = useState(false)

  const goalMs = (activity?.goalValue ?? 0) * 60_000
  const countdown = useCountdown(goalMs)

  if (!kid || !activity) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <p className="text-slate-600">This activity isn't available anymore.</p>
        </Card>
      </div>
    )
  }

  function finish() {
    if (!kid || !activity) return
    const needsApproval = Boolean(kid.requireActivityApproval)
    const dateISO = logDateISO
    const weekKey = getWeekKey(parseDateISO(logDateISO), weekStartsOn)
    const entryId = addEarning({
      kidId: kid.id,
      sourceType: 'activity',
      sourceId: activity.id,
      points: activity.points,
      dateISO,
      weekKey,
      note: note.trim() || undefined,
      approved: needsApproval ? false : undefined,
    })
    let bonusId: string | undefined
    if (fromPick) {
      bonusId = addEarning({
        kidId: kid.id,
        sourceType: 'bonus',
        sourceId: `pickBonus-${activity.id}-${dateISO}`,
        points: PICK_BONUS_POINTS,
        dateISO,
        weekKey,
        note: 'Picked it in a game! 🎲',
        approved: needsApproval ? false : undefined,
      })
    }
    if (needsApproval) {
      setCelebrating(true)
      playSuccessChime()
      return
    }
    pushEarningCelebration({ kidId: kid.id, entryId, todayISO: dateISO, dailyPointsTarget: kid.dailyPointsTarget })
    if (bonusId) {
      pushEarningCelebration({ kidId: kid.id, entryId: bonusId, todayISO: dateISO, dailyPointsTarget: kid.dailyPointsTarget })
    }
    navigate('/activities')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/activities" label="Activities" />
      <h1 className="font-display text-3xl text-slate-800">
        {activity.icon} {activity.title}
      </h1>
      {fromPick && <p className="text-sm text-sunny-600">🎲 Picked in a game — finish it for a bonus point!</p>}
      {isBackdated && (
        <p className="text-sm text-sky-600">
          📅 Logging this for {parseDateISO(logDateISO).toLocaleDateString()}, not today.
        </p>
      )}

      {activity.goalType === 'minutes' && (
        <Card className="space-y-4 text-center">
          <p className="font-display text-6xl text-slate-800">{formatClock(countdown.remainingMs)}</p>
          <div className="flex justify-center gap-2">
            {!countdown.running && countdown.remainingMs === goalMs && (
              <Button variant="mint" onClick={countdown.start}>
                Start
              </Button>
            )}
            {countdown.running && (
              <Button variant="sky" onClick={countdown.pause}>
                Pause
              </Button>
            )}
            {!countdown.running && countdown.remainingMs > 0 && countdown.remainingMs < goalMs && (
              <Button variant="mint" onClick={countdown.resume}>
                Resume
              </Button>
            )}
          </div>
          {countdown.remainingMs === 0 && (
            <Button variant="sunny" className="w-full" onClick={finish}>
              I did it myself! 🎉
            </Button>
          )}
        </Card>
      )}

      {activity.goalType === 'count' && (
        <Card className="space-y-4 text-center">
          <p className="font-display text-6xl text-slate-800">
            {count} <span className="text-2xl text-slate-400">/ {activity.goalValue}</span>
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="ghost" onClick={() => setCount((c) => Math.max(0, c - 1))}>
              −1
            </Button>
            <Button variant="sky" onClick={() => setCount((c) => c + 1)}>
              +1
            </Button>
          </div>
          <label className="block text-left text-sm font-semibold text-slate-600">
            Notes (optional)
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="e.g. the words you learned"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <Button variant="sunny" className="w-full" disabled={count < activity.goalValue} onClick={finish}>
            I did it myself! 🎉
          </Button>
        </Card>
      )}

      {activity.goalType === 'done' && (
        <Card className="text-center">
          <Button variant="sunny" className="w-full py-8 text-2xl" onClick={finish}>
            I did it myself! 🎉
          </Button>
        </Card>
      )}

      <Celebration
        open={celebrating}
        emoji="🕒"
        message="Nice work! Waiting for a grown-up to check it."
        onDone={() => {
          setCelebrating(false)
          navigate('/activities')
        }}
      />
    </div>
  )
}
