import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { getWeekKey, toDateISO } from '@/lib/dates'
import { savingsBalance } from '@/lib/fund'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import { PinConfirmModal } from './PinConfirmModal'

/** Parent screen for activity completions, reward requests, and savings withdrawals waiting on a decision. */
export function ApprovalsPage() {
  const logEntries = useStore((s) => s.logEntries)
  const kids = useStore((s) => s.kids)
  const activities = useStore((s) => s.activities)
  const approveLogEntry = useStore((s) => s.approveLogEntry)
  const removeLogEntry = useStore((s) => s.removeLogEntry)
  const rewardRequests = useStore((s) => s.rewardRequests)
  const rewards = useStore((s) => s.rewards)
  const updateRewardRequest = useStore((s) => s.updateRewardRequest)
  const addSpend = useStore((s) => s.addSpend)
  const settings = useStore((s) => s.settings)
  const savingsWithdrawalRequests = useStore((s) => s.savingsWithdrawalRequests)
  const approveSavingsWithdrawal = useStore((s) => s.approveSavingsWithdrawal)
  const declineSavingsWithdrawal = useStore((s) => s.declineSavingsWithdrawal)
  const spends = useStore((s) => s.spends)
  const today = useToday()

  const [pinConfirmRequestId, setPinConfirmRequestId] = useState<string | null>(null)

  const pendingActivities = Object.values(logEntries).filter((l) => l.approved === false)
  const pendingRewards = Object.values(rewardRequests).filter((r) => r.status === 'pending')
  const pendingWithdrawals = Object.values(savingsWithdrawalRequests).filter((r) => r.status === 'pending')

  function approveReward(requestId: string) {
    const request = rewardRequests[requestId]
    const reward = request ? rewards[request.rewardId] : undefined
    if (!request || !reward) return
    addSpend({
      kidId: request.kidId,
      kind: 'reward',
      refId: reward.id,
      points: reward.cost,
      dateISO: toDateISO(today),
      weekKey: getWeekKey(today, settings.weekStartsOn),
    })
    updateRewardRequest(requestId, { status: 'approved' })
  }

  const entries = Object.values(logEntries)
  const spendList = Object.values(spends)

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <h1 className="font-display text-3xl text-slate-800">Approvals</h1>

      {pendingActivities.length === 0 && pendingRewards.length === 0 && pendingWithdrawals.length === 0 && (
        <Card>
          <p className="text-slate-600">Nothing waiting — all caught up! 🎉</p>
        </Card>
      )}

      {pendingActivities.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-display text-sm text-slate-500">Activities</h2>
          {pendingActivities.map((entry) => {
            const kid = kids[entry.kidId]
            const activity = activities[entry.sourceId]
            return (
              <Card key={entry.id} className="flex items-center gap-3">
                <span className="text-2xl">{activity?.icon ?? '⭐'}</span>
                <div className="flex-1">
                  <p className="font-display text-slate-800">
                    {kid?.name ?? 'Kid'} · {activity?.title ?? entry.note ?? 'Activity'}
                  </p>
                  {entry.note && <p className="text-xs text-slate-500">"{entry.note}"</p>}
                  <p className="text-xs text-slate-500">
                    +{entry.points} points · {entry.dateISO}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="mint" onClick={() => approveLogEntry(entry.id)}>
                    Approve
                  </Button>
                  <Button variant="ghost" onClick={() => removeLogEntry(entry.id)}>
                    Decline
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {pendingRewards.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-display text-sm text-slate-500">Reward Requests</h2>
          {pendingRewards.map((request) => {
            const kid = kids[request.kidId]
            const reward = rewards[request.rewardId]
            return (
              <Card key={request.id} className="flex items-center gap-3">
                <span className="text-2xl">{reward?.icon ?? '🎁'}</span>
                <div className="flex-1">
                  <p className="font-display text-slate-800">
                    {kid?.name ?? 'Kid'} wants {reward?.title ?? 'a reward'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {reward?.cost ?? 0} points · {request.dateISO}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="mint" onClick={() => approveReward(request.id)}>
                    Approve
                  </Button>
                  <Button variant="ghost" onClick={() => updateRewardRequest(request.id, { status: 'declined' })}>
                    Decline
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {pendingWithdrawals.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-display text-sm text-slate-500">🔒 Savings Withdrawals</h2>
          {pendingWithdrawals.map((request) => {
            const kid = kids[request.kidId]
            const currentSavings = savingsBalance(entries, spendList, request.kidId)
            const minBalance = kid?.minSavingsBalance ?? 0
            const wouldBreachFloor = currentSavings - request.amount < minBalance
            return (
              <Card key={request.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔓</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-slate-800">
                      {kid?.name ?? 'Kid'} wants {request.amount} points
                    </p>
                    <p className="text-xs text-slate-500">"{request.reason}" · {request.dateISO}</p>
                    <p className="text-xs text-slate-500">Savings balance: {currentSavings} pts</p>
                    {wouldBreachFloor && (
                      <p className="text-xs font-semibold text-coral-600">
                        ⚠️ This would drop Savings below the {minBalance}-point minimum.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="mint"
                    className="flex-1"
                    disabled={wouldBreachFloor}
                    onClick={() => setPinConfirmRequestId(request.id)}
                  >
                    Approve
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={() => declineSavingsWithdrawal(request.id)}>
                    Decline
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <PinConfirmModal
        open={pinConfirmRequestId !== null}
        title="Confirm Savings Withdrawal"
        onClose={() => setPinConfirmRequestId(null)}
        onConfirmed={() => {
          if (pinConfirmRequestId) approveSavingsWithdrawal(pinConfirmRequestId)
          setPinConfirmRequestId(null)
        }}
      />
    </div>
  )
}
