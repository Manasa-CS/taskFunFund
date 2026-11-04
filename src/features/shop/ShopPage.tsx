import { BackButton } from '@/components/BackButton'
import { Card } from '@/components/Card'
import { ScreenTimeSection } from '@/features/screentime/ScreenTimeSection'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { RewardsSection } from './RewardsSection'

/** Kid-facing shop hub: extra screen time and the rewards catalog. */
export function ShopPage() {
  const activeKidId = useUiStore((s) => s.activeKidId)
  const kid = useStore((s) => (activeKidId ? s.kids[activeKidId] : undefined))

  if (!kid) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <p className="text-slate-600">No kid selected yet.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/fund" label="My Fund" />
      <h1 className="font-display text-3xl text-slate-800">Shop</h1>
      <ScreenTimeSection kid={kid} />
      <RewardsSection kid={kid} />
    </div>
  )
}
