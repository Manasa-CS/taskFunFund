import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Celebration } from '@/components/Celebration'
import { getWeekKey, toDateISO } from '@/lib/dates'
import { screenTimeCost, walletBalance } from '@/lib/fund'
import { cancelScreenTimeNotifications, scheduleScreenTimeNotifications } from '@/lib/notifications'
import { playTimesUpChime, playWarningChime } from '@/lib/sounds'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import type { Kid, ScreenTimeOption } from '@/store/types'
import { useSessionCountdown } from './useSessionCountdown'

const DURATIONS = [15, 30, 45, 60]
const FIVE_MIN_MS = 5 * 60_000

function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface ScreenTimeSectionProps {
  kid: Kid
}

/** Kid-facing extra-screen-time shop: pick an option and duration, or watch the active countdown. */
export function ScreenTimeSection({ kid }: ScreenTimeSectionProps) {
  const screenTimeOptions = useStore((s) => s.screenTimeOptions)
  const sessions = useStore((s) => s.screenTimeSessions)
  const addScreenTimeSession = useStore((s) => s.addScreenTimeSession)
  const updateScreenTimeSession = useStore((s) => s.updateScreenTimeSession)
  const addSpend = useStore((s) => s.addSpend)
  const logEntries = useStore((s) => s.logEntries)
  const spends = useStore((s) => s.spends)
  const settings = useStore((s) => s.settings)
  const today = useToday()

  const [warned, setWarned] = useState(false)
  const [timeUp, setTimeUp] = useState(false)

  const options = Object.values(screenTimeOptions).filter((o) => o.kidId === kid.id)
  const activeSession = Object.values(sessions).find(
    (s) => s.kidId === kid.id && (s.status === 'running' || s.status === 'paused'),
  )
  const remainingMs = useSessionCountdown(activeSession)

  useEffect(() => {
    if (!activeSession || activeSession.status !== 'running') return
    if (remainingMs <= 0 && !timeUp) {
      setTimeUp(true)
      updateScreenTimeSession(activeSession.id, { status: 'done', endedAt: new Date().toISOString() })
      cancelScreenTimeNotifications(activeSession.id)
      playTimesUpChime()
    } else if (remainingMs <= FIVE_MIN_MS && !warned) {
      setWarned(true)
      playWarningChime()
    }
  }, [remainingMs, activeSession, timeUp, warned, updateScreenTimeSession])

  if (!kid.screenTimeEnabled) return null

  const balance = walletBalance(
    Object.values(logEntries),
    Object.values(spends),
    kid.id,
    settings.carryOverUnspent,
    today,
    settings.weekStartsOn,
  )

  const todayISO = toDateISO(today)
  const minutesBoughtToday = Object.values(sessions)
    .filter((s) => s.kidId === kid.id && s.startedAt && s.startedAt.slice(0, 10) === todayISO)
    .reduce((sum, s) => sum + s.minutesBought, 0)
  const capMinutes = kid.screenTimeDailyCapMinutes
  const capReached = capMinutes !== undefined && minutesBoughtToday >= capMinutes

  const hours = kid.screenTimeAllowedHours
  const currentHour = today.getHours()
  const withinAllowedHours = !hours || (currentHour >= hours.start && currentHour < hours.end)

  function buy(option: ScreenTimeOption, minutes: number) {
    const cost = screenTimeCost(option.pointsPer15Min, minutes)
    if (cost > balance) return
    const sessionId = addScreenTimeSession({
      kidId: kid.id,
      optionId: option.id,
      minutesBought: minutes,
      startedAt: new Date().toISOString(),
      status: 'running',
    })
    addSpend({
      kidId: kid.id,
      kind: 'screenTime',
      refId: sessionId,
      points: cost,
      minutes,
      dateISO: todayISO,
      weekKey: getWeekKey(today, settings.weekStartsOn),
    })
    setWarned(false)
    setTimeUp(false)
    const now = Date.now()
    scheduleScreenTimeNotifications(
      sessionId,
      new Date(now + Math.max(0, minutes - 5) * 60_000),
      new Date(now + minutes * 60_000),
    )
  }

  if (options.length === 0) return null

  if (activeSession) {
    const option = screenTimeOptions[activeSession.optionId]
    return (
      <Card className="space-y-3 text-center">
        <h2 className="font-display text-lg text-slate-700">
          {option?.icon} {option?.label}
        </h2>
        <p className="font-display text-5xl text-slate-800">{formatClock(remainingMs)}</p>
        <div className="flex justify-center gap-2">
          {activeSession.status === 'running' && (
            <Button
              variant="sky"
              onClick={() => {
                updateScreenTimeSession(activeSession.id, { status: 'paused', pausedAt: new Date().toISOString() })
                cancelScreenTimeNotifications(activeSession.id)
              }}
            >
              Pause
            </Button>
          )}
          {activeSession.status === 'paused' && (
            <Button
              variant="mint"
              onClick={() => {
                const pausedMs = new Date(activeSession.pausedAt ?? Date.now()).getTime()
                const startedMs = new Date(activeSession.startedAt ?? Date.now()).getTime()
                const elapsed = pausedMs - startedMs
                const newStart = new Date(Date.now() - elapsed).toISOString()
                updateScreenTimeSession(activeSession.id, { status: 'running', startedAt: newStart, pausedAt: undefined })
                const remainingMinutes = Math.max(0, activeSession.minutesBought - Math.round(elapsed / 60_000))
                const now = Date.now()
                scheduleScreenTimeNotifications(
                  activeSession.id,
                  new Date(now + Math.max(0, remainingMinutes - 5) * 60_000),
                  new Date(now + remainingMinutes * 60_000),
                )
              }}
            >
              Resume
            </Button>
          )}
        </div>
        <Celebration
          open={timeUp}
          emoji="⏰"
          message="Time's up! Great job today."
          onDone={() => setTimeUp(false)}
        />
        {warned && remainingMs > 0 && (
          <p className="text-sm text-coral-500">⏰ 5 minutes left!</p>
        )}
      </Card>
    )
  }

  return (
    <Card className="space-y-3">
      <h2 className="font-display text-lg text-slate-700">Extra Screen Time</h2>
      {capReached && <p className="text-sm text-coral-500">You've used today's screen time — see you tomorrow!</p>}
      {!withinAllowedHours && <p className="text-sm text-coral-500">Screen time isn't available right now.</p>}
      {!capReached &&
        withinAllowedHours &&
        options.map((option) => (
          <div key={option.id} className="space-y-2">
            <p className="font-display text-slate-700">
              {option.icon} {option.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((minutes) => {
                const cost = screenTimeCost(option.pointsPer15Min, minutes)
                const affordable = cost <= balance
                return (
                  <button
                    key={minutes}
                    type="button"
                    disabled={!affordable}
                    onClick={() => buy(option, minutes)}
                    className={`min-h-12 rounded-xl border px-3 py-2 text-sm ${
                      affordable ? 'border-sky-300 bg-white hover:bg-sky-50' : 'border-slate-100 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {minutes} min = {cost} pts
                    <br />
                    {affordable ? `${balance - cost} left` : 'Not enough'}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
    </Card>
  )
}
