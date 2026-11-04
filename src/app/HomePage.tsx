import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { JarIllustration } from '@/components/JarIllustration'
import { getWeekKey, toDateISO } from '@/lib/dates'
import { formatMoney, pointsToStars, savingsEarnedInWeek, starsToMoneyUnits, walletEarnedInWeek } from '@/lib/fund'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { ChooseKidPage } from './ChooseKidPage'
import { GetStartedPage } from './GetStartedPage'

const quickLinks = [
  { to: '/tasks', icon: '✅', label: 'Tasks' },
  { to: '/activities', icon: '🎯', label: 'Activities' },
  { to: '/pick', icon: '🎲', label: 'Pick' },
  { to: '/fun', icon: '🎈', label: 'Fun' },
  { to: '/trophies', icon: '🏆', label: 'Trophies' },
]

/** Kid-facing dashboard: this week's wallet/savings split, today's progress, and quick links. */
export function HomePage() {
  const activeKidId = useUiStore((s) => s.activeKidId)
  const setActiveKidId = useUiStore((s) => s.setActiveKidId)
  const kids = useStore((s) => s.kids)
  const logEntries = useStore((s) => s.logEntries)
  const settings = useStore((s) => s.settings)
  const addLogEntry = useStore((s) => s.addLogEntry)
  const today = useToday()

  const kidList = Object.values(kids)
  const onlyKidId = kidList.length === 1 ? kidList[0].id : null
  // With exactly one kid there's nothing to choose — resolve to them immediately, without
  // waiting on AppShell's own effect to sync activeKidId first.
  const kid = (activeKidId ? kids[activeKidId] : undefined) ?? (onlyKidId ? kids[onlyKidId] : undefined)

  useEffect(() => {
    if (!activeKidId && onlyKidId) setActiveKidId(onlyKidId)
  }, [activeKidId, onlyKidId, setActiveKidId])

  const entries = Object.values(logEntries)
  const weekKey = getWeekKey(today, settings.weekStartsOn)

  // Once-per-week savings bonus: credited straight to Savings, bypassing the normal split.
  useEffect(() => {
    if (!kid?.weeklySavingsBonusPoints) return
    const bonusId = `weeklySavingsBonus-${weekKey}`
    const alreadyGiven = Object.values(logEntries).some((e) => e.kidId === kid.id && e.sourceId === bonusId)
    if (alreadyGiven) return
    addLogEntry({
      kidId: kid.id,
      sourceType: 'bonus',
      sourceId: bonusId,
      points: kid.weeklySavingsBonusPoints,
      toSpend: 0,
      toSavings: kid.weeklySavingsBonusPoints,
      dateISO: toDateISO(today),
      weekKey,
      note: 'Weekly savings bonus! 🔒',
    })
  }, [kid?.id, kid?.weeklySavingsBonusPoints, weekKey, today, logEntries, addLogEntry])

  if (kidList.length === 0) return <GetStartedPage />
  if (!kid) return <ChooseKidPage kids={kidList} />

  const pointsToday = entries
    .filter((l) => l.kidId === kid.id && l.dateISO === toDateISO(today) && l.approved !== false)
    .reduce((sum, l) => sum + l.points, 0)

  const rates = kid.rates ?? settings.rates
  const weekWallet = walletEarnedInWeek(entries, kid.id, weekKey)
  const weekSavings = savingsEarnedInWeek(entries, kid.id, weekKey)
  const { stars } = pointsToStars(weekWallet, rates)
  const moneyUnits = starsToMoneyUnits(stars, rates)

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <h1 className="font-display text-3xl text-slate-800">Welcome back, {kid.name}! 👋</h1>

      <Card className="space-y-1">
        <p className="font-display text-sm text-slate-500">This week</p>
        <p className="text-slate-700">
          💰 {weekWallet} to spend · {stars} ⭐ · {formatMoney(moneyUnits, rates)}
        </p>
        <p className="text-sm text-slate-500">🔒 {weekSavings} pts into Savings</p>
      </Card>
      <Card className="flex items-center gap-3">
        <JarIllustration
          fillLevel={kid.dailyPointsTarget > 0 ? pointsToday / kid.dailyPointsTarget : 0}
          coinCount={Math.min(30, pointsToday)}
          size={72}
        />
        <p className="text-slate-600">
          Today: {pointsToday} / {kid.dailyPointsTarget} points — let's get started!
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className="flex flex-col items-center gap-1 py-6 text-center transition-transform hover:scale-[1.02]">
              <span className="text-3xl">{link.icon}</span>
              <span className="font-display text-slate-700">{link.label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
