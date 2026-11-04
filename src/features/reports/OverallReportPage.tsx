import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Card } from '@/components/Card'
import { formatMoney, lifetimeEarned, lifetimeSpent, pointsToStars, savingsBalance, starsToMoneyUnits } from '@/lib/fund'
import { listWeeklyTotals } from '@/lib/reports'
import { useStore } from '@/store/useStore'
import type { Kid } from '@/store/types'

function KidOverall({ kid }: { kid: Kid }) {
  const logEntries = useStore((s) => s.logEntries)
  const spends = useStore((s) => s.spends)
  const settings = useStore((s) => s.settings)
  const rates = kid.rates ?? settings.rates

  const entries = Object.values(logEntries)
  const spendList = Object.values(spends)
  const weeks = listWeeklyTotals(entries, spendList, kid.id, rates)
  const totalEarned = lifetimeEarned(entries, kid.id)
  const totalSpent = lifetimeSpent(spendList, kid.id)
  const { stars } = pointsToStars(totalEarned, rates)
  const moneyUnits = starsToMoneyUnits(stars, rates)
  const savingsPts = savingsBalance(entries, spendList, kid.id)

  return (
    <Card className="space-y-3">
      <h2 className="font-display text-lg text-slate-700">{kid.name}</h2>
      <p className="text-sm text-slate-600">
        Lifetime: {totalEarned} pts earned · {stars} ⭐ · {formatMoney(moneyUnits, rates)} · {totalSpent} pts spent
      </p>
      <p className="text-sm text-slate-600">🔒 Savings balance: {savingsPts} pts</p>
      {weeks.length === 0 ? (
        <p className="text-sm text-slate-400">No weeks yet.</p>
      ) : (
        <div className="space-y-1">
          {weeks
            .slice()
            .reverse()
            .map((w) => (
              <div key={w.weekKey} className="flex justify-between text-sm">
                <span className="text-slate-500">{w.weekKey}</span>
                <span className="text-slate-700">
                  {w.earned} pts · {w.stars} ⭐ · {formatMoney(w.moneyUnits, rates)} · 🔒 {w.savingsEarned} pts
                </span>
              </div>
            ))}
        </div>
      )}
    </Card>
  )
}

/** Parent screen: lifetime totals and a week-by-week history, with an optional side-by-side compare. */
export function OverallReportPage() {
  const kids = useStore((s) => s.kids)
  const kidList = Object.values(kids)
  const [compare, setCompare] = useState(false)

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl text-slate-800">Overall</h1>
        {kidList.length > 1 && (
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
            Compare kids
          </label>
        )}
      </div>

      {kidList.length === 0 && (
        <Card>
          <p className="text-slate-600">Add a kid first in Parent → Kids.</p>
        </Card>
      )}

      <div className={compare ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : 'space-y-4'}>
        {kidList.map((kid) => (
          <KidOverall key={kid.id} kid={kid} />
        ))}
      </div>
    </div>
  )
}
