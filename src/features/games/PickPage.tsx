import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { toDateISO } from '@/lib/dates'
import { getPickPool, type PickOption } from '@/lib/pickPool'
import { playSuccessChime } from '@/lib/sounds'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { slotColor } from './gameTypes'
import { MysteryBox } from './MysteryBox'
import { PickCards } from './PickCards'
import { RollDice } from './RollDice'
import { SpinWheel } from './SpinWheel'

type GameId = 'wheel' | 'cards' | 'dice' | 'box'
type Phase = 'choosingGame' | 'playing' | 'revealed'

const games: { id: GameId; label: string; icon: string }[] = [
  { id: 'wheel', label: 'Spin the Wheel', icon: '🎡' },
  { id: 'cards', label: 'Pick a Card', icon: '🃏' },
  { id: 'dice', label: 'Roll the Dice', icon: '🎲' },
  { id: 'box', label: 'Mystery Box', icon: '🎁' },
]

/** Entry point for the pick games: a kid chooses a game, it lands on one of today's activities. */
export function PickPage() {
  const navigate = useNavigate()
  const activeKidId = useUiStore((s) => s.activeKidId)
  const kid = useStore((s) => (activeKidId ? s.kids[activeKidId] : undefined))
  const activities = useStore((s) => s.activities)
  const logEntries = useStore((s) => s.logEntries)
  const getRerollsUsed = useStore((s) => s.getRerollsUsed)
  const spendReroll = useStore((s) => s.spendReroll)
  const today = useToday()

  const [gameId, setGameId] = useState<GameId | null>(null)
  const [phase, setPhase] = useState<Phase>('choosingGame')
  const [result, setResult] = useState<PickOption | null>(null)

  const pool = useMemo(() => {
    if (!kid) return []
    return getPickPool({
      kidId: kid.id,
      date: today,
      activities: Object.values(activities),
      logEntries: Object.values(logEntries),
    })
  }, [kid, today, activities, logEntries])

  if (!kid) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <p className="text-slate-600">No kid selected yet.</p>
        </Card>
      </div>
    )
  }

  const kidId = kid.id
  const dateISO = toDateISO(today)
  const rerollsUsed = getRerollsUsed(kidId, dateISO)
  const maxRerolls = kid.maxRerollsPerDay ?? 1
  const rerollsLeft = Math.max(0, maxRerolls - rerollsUsed)

  function pickGame(id: GameId) {
    setGameId(id)
    setResult(null)
    setPhase('playing')
  }

  function handlePicked(picked: PickOption) {
    setResult(picked)
    setPhase('revealed')
    playSuccessChime()
  }

  function tryAgain() {
    if (rerollsLeft <= 0) return
    spendReroll(kidId, dateISO)
    setResult(null)
    setPhase('playing')
  }

  function letsGo() {
    if (!result) return
    navigate(`/activities/${result.id}`, { state: { fromPick: true } })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <h1 className="font-display text-3xl text-slate-800">Pick Something to Do!</h1>

      {pool.length === 0 && (
        <Card>
          <p className="text-slate-600">
            All done today! 🎉 Ask a grown-up to add some activities so you always have something to play.
          </p>
        </Card>
      )}

      {pool.length > 0 && phase === 'choosingGame' && (
        <div className="grid grid-cols-2 gap-3">
          {games.map((g) => (
            <button key={g.id} type="button" onClick={() => pickGame(g.id)}>
              <Card className="flex flex-col items-center gap-2 py-6 transition-transform hover:scale-[1.02]">
                <span className="text-4xl">{g.icon}</span>
                <span className="font-display text-slate-700">{g.label}</span>
              </Card>
            </button>
          ))}
        </div>
      )}

      {pool.length > 0 && phase === 'playing' && gameId && (
        <Card className="space-y-4 py-6">
          {gameId === 'wheel' && <SpinWheel pool={pool} onPicked={handlePicked} />}
          {gameId === 'cards' && <PickCards pool={pool} onPicked={handlePicked} />}
          {gameId === 'dice' && <RollDice pool={pool} onPicked={handlePicked} />}
          {gameId === 'box' && <MysteryBox pool={pool} onPicked={handlePicked} />}
        </Card>
      )}

      {phase === 'revealed' && result && (
        <Card className="space-y-3 text-center">
          <span
            className={`mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full text-4xl ${slotColor(0)}`}
          >
            {result.icon}
          </span>
          <p className="font-display text-xl text-slate-800">{result.title}</p>
          <p className="text-sunny-600">+{result.points} points</p>
          <div className="flex justify-center gap-2">
            <Button variant="mint" onClick={letsGo}>
              Let's go!
            </Button>
            <Button variant="ghost" disabled={rerollsLeft <= 0} onClick={tryAgain}>
              Try again {rerollsLeft > 0 ? `(${rerollsLeft} left)` : ''}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
