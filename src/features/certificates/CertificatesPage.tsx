import { useRef, useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { KidSelect } from '@/components/KidSelect'
import { Modal } from '@/components/Modal'
import { suggestCertificates } from '@/lib/certificateSuggestions'
import { getWeekKey, getWeekRange } from '@/lib/dates'
import { exportElementAsPdf, exportElementAsPng } from '@/lib/exportPdf'
import { lifetimeEarned, pointsToStars, savingsBalance, starsToMoneyUnits } from '@/lib/fund'
import { buildWeeklyReport } from '@/lib/reports'
import { playCelebration } from '@/lib/sounds'
import { useManagedKidId } from '@/lib/useManagedKidId'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import { CertificateCard } from './CertificateCard'

/** Parent screen: auto-suggested certificates for the week, a custom-award form, and the issued list. */
export function CertificatesPage() {
  const [kidId, setKidId] = useManagedKidId()
  const kid = useStore((s) => (kidId ? s.kids[kidId] : undefined))
  const tasks = useStore((s) => s.tasks)
  const logEntries = useStore((s) => s.logEntries)
  const spends = useStore((s) => s.spends)
  const settings = useStore((s) => s.settings)
  const certificates = useStore((s) => s.certificates)
  const addCertificate = useStore((s) => s.addCertificate)
  const rewards = useStore((s) => s.rewards)

  const [customOpen, setCustomOpen] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const today = useToday()

  if (!kidId || !kid) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4">
        <BackButton to="/parent" label="Parent" />
        <h1 className="font-display text-3xl text-slate-800">Certificates</h1>
        <Card>
          <p className="text-slate-600">Add a kid first in Parent → Kids.</p>
        </Card>
      </div>
    )
  }

  const rates = kid.rates ?? settings.rates
  const entries = Object.values(logEntries)
  const spendList = Object.values(spends)
  const weekKey = getWeekKey(today, settings.weekStartsOn)
  const { start, end } = getWeekRange(weekKey, settings.weekStartsOn)
  const dateRangeLabel = `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`

  const report = buildWeeklyReport({
    kidId,
    weekKey,
    weekStartsOn: settings.weekStartsOn,
    rates,
    dailyPointsTarget: kid.dailyPointsTarget,
    tasks: Object.values(tasks).filter((t) => t.kidId === kidId),
    logEntries: entries,
    spends: spendList,
  })

  const lifetimeNow = lifetimeEarned(entries, kidId)
  const lifetimeBeforeWeek = lifetimeNow - report.totalEarned
  const moneyUnitsNow = starsToMoneyUnits(pointsToStars(lifetimeNow, rates).stars, rates)
  const moneyUnitsBeforeWeek = starsToMoneyUnits(pointsToStars(lifetimeBeforeWeek, rates).stars, rates)

  const savingsNow = savingsBalance(entries, spendList, kidId)
  const savingsBeforeWeek = savingsNow - report.pointsToSavings + report.savingsWithdrawnThisWeek
  const pinnedGoal = kid.savingsGoalRewardId ? rewards[kid.savingsGoalRewardId] : undefined

  const alreadyIssuedThisWeek = new Set(
    Object.values(certificates)
      .filter((c) => c.kidId === kidId && c.weekKey === weekKey)
      .map((c) => c.type),
  )
  const suggestions = suggestCertificates({
    kidName: kid.name,
    report,
    lifetimeMoneyUnitsBeforeWeek: moneyUnitsBeforeWeek,
    lifetimeMoneyUnitsNow: moneyUnitsNow,
    savingsBalanceBeforeWeek: savingsBeforeWeek,
    savingsBalanceNow: savingsNow,
    savingsGoal: pinnedGoal ? { title: pinnedGoal.title, cost: pinnedGoal.cost } : undefined,
    rates,
  }).filter((s) => !alreadyIssuedThisWeek.has(s.type))

  const issued = Object.values(certificates)
    .filter((c) => c.kidId === kidId)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))

  function issue(type: (typeof suggestions)[number]['type'], title: string, message: string) {
    if (!kidId) return
    addCertificate({
      kidId,
      type,
      title,
      message,
      weekKey,
      dateRangeLabel,
      pointsSnapshot: lifetimeNow,
      starsSnapshot: pointsToStars(lifetimeNow, rates).stars,
      moneyUnitsSnapshot: moneyUnitsNow,
      issuedAt: new Date().toISOString(),
    })
    playCelebration()
  }

  function issueCustom() {
    if (!kidId || !customTitle.trim()) return
    addCertificate({
      kidId,
      type: 'custom',
      title: customTitle.trim(),
      message: customMessage.trim(),
      dateRangeLabel: new Date().toLocaleDateString(),
      pointsSnapshot: lifetimeNow,
      starsSnapshot: pointsToStars(lifetimeNow, rates).stars,
      moneyUnitsSnapshot: moneyUnitsNow,
      issuedAt: new Date().toISOString(),
    })
    playCelebration()
    setCustomTitle('')
    setCustomMessage('')
    setCustomOpen(false)
  }

  const previewCert = previewId ? certificates[previewId] : undefined

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl text-slate-800">Certificates</h1>
        <KidSelect value={kidId} onChange={setKidId} />
      </div>

      {suggestions.length > 0 && (
        <Card className="space-y-2">
          <h2 className="font-display text-lg text-slate-700">Suggested this week</h2>
          {suggestions.map((s) => (
            <div key={s.type} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2">
              <div className="flex-1">
                <p className="font-display text-slate-800">{s.title}</p>
                <p className="text-xs text-slate-500">{s.message}</p>
              </div>
              <Button variant="mint" onClick={() => issue(s.type, s.title, s.message)}>
                Issue
              </Button>
            </div>
          ))}
        </Card>
      )}

      <div className="flex justify-end">
        <Button variant="grape" onClick={() => setCustomOpen(true)}>
          + Custom Certificate
        </Button>
      </div>

      <div className="space-y-2">
        {issued.map((cert) => (
          <button key={cert.id} type="button" className="w-full" onClick={() => setPreviewId(cert.id)}>
            <Card className="flex items-center gap-3 text-left">
              <span className="text-2xl">🏆</span>
              <div className="flex-1">
                <p className="font-display text-slate-800">{cert.title}</p>
                <p className="text-xs text-slate-500">{cert.dateRangeLabel}</p>
              </div>
            </Card>
          </button>
        ))}
      </div>

      <Modal open={customOpen} onClose={() => setCustomOpen(false)} title="Custom Certificate">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-600">
            Title
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Message
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </label>
          <Button variant="sunny" className="w-full" disabled={!customTitle.trim()} onClick={issueCustom}>
            Issue Certificate
          </Button>
        </div>
      </Modal>

      <Modal open={previewCert !== undefined} onClose={() => setPreviewId(null)} title="">
        {previewCert && kid && (
          <div className="space-y-3">
            <div ref={previewRef}>
              <CertificateCard certificate={previewCert} kid={kid} parentName={settings.parentName} rates={rates} />
            </div>
            <div className="flex gap-2">
              <Button
                variant="sky"
                className="flex-1"
                onClick={() => previewRef.current && exportElementAsPng(previewRef.current, previewCert.title)}
              >
                PNG
              </Button>
              <Button
                variant="grape"
                className="flex-1"
                onClick={() => previewRef.current && exportElementAsPdf(previewRef.current, previewCert.title, 'letter')}
              >
                PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
