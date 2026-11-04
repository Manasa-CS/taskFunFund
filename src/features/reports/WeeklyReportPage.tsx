import { addDays } from 'date-fns'
import { useRef, useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { KidSelect } from '@/components/KidSelect'
import { getWeekKey, getWeekRange } from '@/lib/dates'
import { exportElementAsPdf } from '@/lib/exportPdf'
import { formatMoney } from '@/lib/fund'
import { buildWeeklyReport, listWeeklyTotals, summarizeWeek } from '@/lib/reports'
import { useManagedKidId } from '@/lib/useManagedKidId'
import { useStore } from '@/store/useStore'
import { DailyPointsChart } from './DailyPointsChart'

/** Parent screen: a detailed report for any past week, exportable as a PDF. */
export function WeeklyReportPage() {
  const [kidId, setKidId] = useManagedKidId()
  const kid = useStore((s) => (kidId ? s.kids[kidId] : undefined))
  const tasks = useStore((s) => s.tasks)
  const logEntries = useStore((s) => s.logEntries)
  const spends = useStore((s) => s.spends)
  const settings = useStore((s) => s.settings)
  const reportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const [weekKey, setWeekKey] = useState(() => getWeekKey(new Date(), settings.weekStartsOn))

  if (!kidId || !kid) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4">
        <BackButton to="/parent" label="Parent" />
        <h1 className="font-display text-3xl text-slate-800">Weekly Report</h1>
        <Card>
          <p className="text-slate-600">Add a kid first in Parent → Kids.</p>
        </Card>
      </div>
    )
  }

  const rates = kid.rates ?? settings.rates
  const weekList = listWeeklyTotals(Object.values(logEntries), Object.values(spends), kidId, rates)
  const { start, end } = getWeekRange(weekKey, settings.weekStartsOn)

  const report = buildWeeklyReport({
    kidId,
    weekKey,
    weekStartsOn: settings.weekStartsOn,
    rates,
    dailyPointsTarget: kid.dailyPointsTarget,
    tasks: Object.values(tasks).filter((t) => t.kidId === kidId),
    logEntries: Object.values(logEntries),
    spends: Object.values(spends),
  })

  function shiftWeek(days: number) {
    setWeekKey(getWeekKey(addDays(start, days), settings.weekStartsOn))
  }

  async function handleExport() {
    if (!reportRef.current) return
    setExporting(true)
    try {
      await exportElementAsPdf(reportRef.current, `${kid?.name ?? 'kid'}-week-${weekKey}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl text-slate-800">Weekly Report</h1>
        <KidSelect value={kidId} onChange={setKidId} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => shiftWeek(-7)}>
          ← Prev
        </Button>
        {weekList.length > 0 && (
          <select
            className="rounded-xl border border-slate-200 px-3 py-2"
            value={weekKey}
            onChange={(e) => setWeekKey(e.target.value)}
          >
            {!weekList.some((w) => w.weekKey === weekKey) && <option value={weekKey}>{weekKey}</option>}
            {weekList.map((w) => (
              <option key={w.weekKey} value={w.weekKey}>
                {w.weekKey}
              </option>
            ))}
          </select>
        )}
        <Button variant="ghost" onClick={() => shiftWeek(7)}>
          Next →
        </Button>
      </div>

      <div ref={reportRef} className="space-y-4 bg-sunny-50 p-1">
        <Card className="space-y-1">
          <p className="text-xs text-slate-500">
            {start.toLocaleDateString()} – {end.toLocaleDateString()}
          </p>
          <p className="font-display text-lg text-slate-700">{summarizeWeek(kid.name, report, rates)}</p>
        </Card>

        <Card className="space-y-2">
          <h2 className="font-display text-sm text-slate-500">Points by day</h2>
          <DailyPointsChart days={report.dailyBreakdown} />
        </Card>

        <Card className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">From tasks</p>
            <p className="font-display text-lg text-slate-800">{report.pointsFromTasks} pts</p>
          </div>
          <div>
            <p className="text-slate-500">From activities</p>
            <p className="font-display text-lg text-slate-800">{report.pointsFromActivities} pts</p>
          </div>
          <div>
            <p className="text-slate-500">🌟 Bonus points</p>
            <p className="font-display text-lg text-slate-800">{report.pointsFromBonus} pts</p>
          </div>
          <div>
            <p className="text-slate-500">⚠️ Penalties</p>
            <p className="font-display text-lg text-slate-800">{report.pointsFromPenalties} pts</p>
          </div>
          <div>
            <p className="text-slate-500">Total earned</p>
            <p className="font-display text-lg text-slate-800">
              {report.totalEarned} pts · {report.stars} ⭐ · {formatMoney(report.moneyUnits, rates)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Target hit</p>
            <p className="font-display text-lg text-slate-800">
              {report.daysTargetHit} of {report.taskDayCount} days
            </p>
          </div>
          <div>
            <p className="text-slate-500">Task completion</p>
            <p className="font-display text-lg text-slate-800">{report.taskCompletionPct}%</p>
          </div>
          <div>
            <p className="text-slate-500">Best streak</p>
            <p className="font-display text-lg text-slate-800">🔥 {report.bestStreakInWeek} days</p>
          </div>
          <div>
            <p className="text-slate-500">Fun time</p>
            <p className="font-display text-lg text-slate-800">
              {report.funSessionsCount} times · {report.funMinutes} min
            </p>
          </div>
          <div>
            <p className="text-slate-500">Screen time bought</p>
            <p className="font-display text-lg text-slate-800">{report.screenTimeMinutesBought} min</p>
          </div>
          <div>
            <p className="text-slate-500">Spent</p>
            <p className="font-display text-lg text-slate-800">{report.totalSpent} pts</p>
          </div>
          <div>
            <p className="text-slate-500">Net (earned − spent)</p>
            <p className="font-display text-lg text-slate-800">{report.netSavedPoints} pts</p>
          </div>
        </Card>

        <Card className="grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2">
            <h2 className="font-display text-sm text-slate-500">🔒 Locked Savings</h2>
          </div>
          <div>
            <p className="text-slate-500">Into Savings</p>
            <p className="font-display text-lg text-slate-800">{report.pointsToSavings} pts</p>
          </div>
          <div>
            <p className="text-slate-500">Into wallet</p>
            <p className="font-display text-lg text-slate-800">{report.pointsToWallet} pts</p>
          </div>
          <div>
            <p className="text-slate-500">Withdrawn from Savings</p>
            <p className="font-display text-lg text-slate-800">{report.savingsWithdrawnThisWeek} pts</p>
          </div>
        </Card>
      </div>

      <Button variant="sky" className="w-full" disabled={exporting} onClick={handleExport}>
        {exporting ? 'Preparing PDF...' : '📄 Export / Share PDF'}
      </Button>
    </div>
  )
}
