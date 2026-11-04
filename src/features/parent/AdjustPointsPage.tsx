import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { KidSelect } from '@/components/KidSelect'
import { getWeekKey, parseDateISO, toDateISO } from '@/lib/dates'
import { useManagedKidId } from '@/lib/useManagedKidId'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'

/** Parent screen: award one-off bonus points or apply a penalty, for today or any past date. */
export function AdjustPointsPage() {
  const kids = useStore((s) => s.kids)
  const logEntries = useStore((s) => s.logEntries)
  const settings = useStore((s) => s.settings)
  const awardBonusPoints = useStore((s) => s.awardBonusPoints)
  const applyPenalty = useStore((s) => s.applyPenalty)
  const removeLogEntry = useStore((s) => s.removeLogEntry)
  const today = useToday()
  const todayISO = toDateISO(today)

  const [kidId, setKidId] = useManagedKidId()
  const [bonusPoints, setBonusPoints] = useState(1)
  const [bonusDate, setBonusDate] = useState(todayISO)
  const [bonusNote, setBonusNote] = useState('')
  const [penaltyPoints, setPenaltyPoints] = useState(1)
  const [penaltyDate, setPenaltyDate] = useState(todayISO)
  const [penaltyNote, setPenaltyNote] = useState('')

  const kid = kidId ? kids[kidId] : undefined

  function submitBonus() {
    if (!kidId || bonusPoints <= 0) return
    const weekKey = getWeekKey(parseDateISO(bonusDate), settings.weekStartsOn)
    awardBonusPoints({ kidId, points: bonusPoints, dateISO: bonusDate, weekKey, note: bonusNote.trim() || undefined })
    setBonusPoints(1)
    setBonusNote('')
  }

  function submitPenalty() {
    if (!kidId || penaltyPoints <= 0) return
    const weekKey = getWeekKey(parseDateISO(penaltyDate), settings.weekStartsOn)
    applyPenalty({ kidId, points: penaltyPoints, dateISO: penaltyDate, weekKey, note: penaltyNote.trim() || undefined })
    setPenaltyPoints(1)
    setPenaltyNote('')
  }

  const recentAdjustments = kidId
    ? Object.values(logEntries)
        .filter(
          (e) =>
            e.kidId === kidId &&
            (e.sourceType === 'penalty' || (e.sourceType === 'bonus' && e.sourceId.startsWith('manualBonus-'))),
        )
        .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
        .slice(0, 20)
    : []

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl text-slate-800">Bonus & Penalty</h1>
        <KidSelect value={kidId} onChange={setKidId} />
      </div>

      {!kid && (
        <Card>
          <p className="text-slate-600">Add a kid first in Parent → Kids.</p>
        </Card>
      )}

      {kid && (
        <>
          <Card className="space-y-3">
            <h2 className="font-display text-lg text-slate-700">🌟 Award Bonus Points</h2>
            <p className="text-sm text-slate-500">
              For good behavior or extra effort — splits into {kid.name}'s wallet and Savings like any
              other earning.
            </p>
            <div className="flex gap-3">
              <label className="block w-24 text-sm font-semibold text-slate-600">
                Points
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(Number(e.target.value) || 1)}
                />
              </label>
              <label className="block flex-1 text-sm font-semibold text-slate-600">
                Date
                <input
                  type="date"
                  max={todayISO}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  value={bonusDate}
                  onChange={(e) => setBonusDate(e.target.value)}
                />
              </label>
            </div>
            <label className="block text-sm font-semibold text-slate-600">
              Reason (optional)
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder="e.g. helped a sibling with homework"
                value={bonusNote}
                onChange={(e) => setBonusNote(e.target.value)}
              />
            </label>
            <Button variant="mint" className="w-full" onClick={submitBonus}>
              Award {bonusPoints} point{bonusPoints === 1 ? '' : 's'}
            </Button>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg text-slate-700">⚠️ Apply a Penalty</h2>
            <p className="text-sm text-slate-500">
              For misbehavior — comes out of {kid.name}'s spend wallet only; locked Savings is never
              touched.
            </p>
            <div className="flex gap-3">
              <label className="block w-24 text-sm font-semibold text-slate-600">
                Points
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  value={penaltyPoints}
                  onChange={(e) => setPenaltyPoints(Number(e.target.value) || 1)}
                />
              </label>
              <label className="block flex-1 text-sm font-semibold text-slate-600">
                Date
                <input
                  type="date"
                  max={todayISO}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  value={penaltyDate}
                  onChange={(e) => setPenaltyDate(e.target.value)}
                />
              </label>
            </div>
            <label className="block text-sm font-semibold text-slate-600">
              Reason (optional)
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder="e.g. didn't listen at bedtime"
                value={penaltyNote}
                onChange={(e) => setPenaltyNote(e.target.value)}
              />
            </label>
            <Button variant="coral" className="w-full" onClick={submitPenalty}>
              Deduct {penaltyPoints} point{penaltyPoints === 1 ? '' : 's'}
            </Button>
          </Card>

          {recentAdjustments.length > 0 && (
            <Card className="space-y-2">
              <h2 className="font-display text-lg text-slate-700">Recent adjustments</h2>
              {recentAdjustments.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 border-t border-slate-100 pt-2 first:border-t-0 first:pt-0">
                  <span className="text-xl">{entry.sourceType === 'penalty' ? '⚠️' : '🌟'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-slate-800">
                      {entry.points > 0 ? '+' : ''}
                      {entry.points} points · {entry.dateISO}
                    </p>
                    {entry.note && <p className="text-xs text-slate-500">{entry.note}</p>}
                  </div>
                  <Button variant="ghost" aria-label="Remove this adjustment" onClick={() => removeLogEntry(entry.id)}>
                    🗑️
                  </Button>
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  )
}
