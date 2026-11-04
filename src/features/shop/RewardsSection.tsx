import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { formatMoney, pointsToStars } from '@/lib/fund'
import { toDateISO } from '@/lib/dates'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import type { Kid } from '@/store/types'

interface RewardsSectionProps {
  kid: Kid
}

/** Kid-facing rewards catalog: request a treat, or pin one as the savings-goal jar. */
export function RewardsSection({ kid }: RewardsSectionProps) {
  const rewards = useStore((s) => s.rewards)
  const rewardRequests = useStore((s) => s.rewardRequests)
  const addRewardRequest = useStore((s) => s.addRewardRequest)
  const updateKid = useStore((s) => s.updateKid)
  const settings = useStore((s) => s.settings)
  const today = useToday()

  const rates = kid.rates ?? settings.rates
  const kidRewards = Object.values(rewards).filter((r) => r.kidIds.includes(kid.id))
  const pendingRewardIds = new Set(
    Object.values(rewardRequests)
      .filter((r) => r.kidId === kid.id && r.status === 'pending')
      .map((r) => r.rewardId),
  )

  if (kidRewards.length === 0) return null

  return (
    <Card className="space-y-3">
      <h2 className="font-display text-lg text-slate-700">Treats & Rewards</h2>
      <div className="space-y-2">
        {kidRewards.map((reward) => {
          const { stars } = pointsToStars(reward.cost, rates)
          const pending = pendingRewardIds.has(reward.id)
          const isGoal = kid.savingsGoalRewardId === reward.id
          return (
            <div key={reward.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <span className="text-2xl">{reward.icon}</span>
              <div className="flex-1">
                <p className="font-display text-slate-800">{reward.title}</p>
                <p className="text-xs text-slate-500">
                  {reward.cost} pts · {stars} ⭐ · {formatMoney(Math.floor(stars / rates.starsPerMoneyUnit), rates)}
                </p>
              </div>
              <button
                type="button"
                className={`text-xs font-semibold ${isGoal ? 'text-grape-500' : 'text-slate-400'}`}
                onClick={() => updateKid(kid.id, { savingsGoalRewardId: isGoal ? undefined : reward.id })}
              >
                {isGoal ? '★ Goal' : '☆ Set goal'}
              </button>
              <Button
                variant={pending ? 'ghost' : 'coral'}
                disabled={pending}
                onClick={() =>
                  addRewardRequest({ kidId: kid.id, rewardId: reward.id, status: 'pending', dateISO: toDateISO(today) })
                }
              >
                {pending ? 'Waiting...' : 'I want this!'}
              </Button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
