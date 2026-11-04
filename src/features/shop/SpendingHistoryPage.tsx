import { BackButton } from '@/components/BackButton'
import { Card } from '@/components/Card'
import { formatMoney, pointsToMoneyUnits } from '@/lib/fund'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import type { Spend } from '@/store/types'

const kindLabels: Record<Spend['kind'], string> = {
  screenTime: '📺 Screen time',
  reward: '🎁 Reward',
  cashOut: '💵 Cash out',
  savingsWithdrawal: '🔓 Savings withdrawal',
}

/** Kid-facing spending history: every purchase, with dates and its money value. */
export function SpendingHistoryPage() {
  const activeKidId = useUiStore((s) => s.activeKidId)
  const kid = useStore((s) => (activeKidId ? s.kids[activeKidId] : undefined))
  const spends = useStore((s) => s.spends)
  const settings = useStore((s) => s.settings)
  const rewards = useStore((s) => s.rewards)
  const screenTimeOptions = useStore((s) => s.screenTimeOptions)
  const screenTimeSessions = useStore((s) => s.screenTimeSessions)
  const savingsWithdrawalRequests = useStore((s) => s.savingsWithdrawalRequests)

  if (!kid) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <p className="text-slate-600">No kid selected yet.</p>
        </Card>
      </div>
    )
  }

  const rates = kid.rates ?? settings.rates
  const history = Object.values(spends)
    .filter((s) => s.kidId === kid.id)
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))

  function describe(spend: Spend): string {
    if (spend.kind === 'reward') return rewards[spend.refId]?.title ?? 'Reward'
    if (spend.kind === 'screenTime') {
      const session = screenTimeSessions[spend.refId]
      const option = session ? screenTimeOptions[session.optionId] : undefined
      return option ? `${option.label} · ${spend.minutes} min` : `${spend.minutes} min`
    }
    if (spend.kind === 'savingsWithdrawal') return savingsWithdrawalRequests[spend.refId]?.reason || 'Savings withdrawal'
    return 'Cash out'
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/shop" label="Shop" />
      <h1 className="font-display text-3xl text-slate-800">Spending History</h1>
      {history.length === 0 && (
        <Card>
          <p className="text-slate-600">Nothing spent yet — your fund is all yours!</p>
        </Card>
      )}
      <div className="space-y-2">
        {history.map((spend) => (
          <Card key={spend.id} className="flex items-center gap-3">
            <div className="flex-1">
              <p className="font-display text-slate-800">{kindLabels[spend.kind]}</p>
              <p className="text-xs text-slate-500">
                {describe(spend)} · {spend.dateISO}
              </p>
            </div>
            <p className="font-display text-coral-500">
              -{spend.points} pts ({formatMoney(pointsToMoneyUnits(spend.points, rates), rates)})
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
