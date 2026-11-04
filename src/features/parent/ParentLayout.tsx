import { Outlet } from 'react-router-dom'
import { Button } from '@/components/Button'
import { useUiStore } from '@/store/uiStore'
import { useStore } from '@/store/useStore'
import { OnboardingFlow } from './OnboardingFlow'
import { ParentPinGate } from './ParentPinGate'

/** Gates the whole /parent subtree: onboarding on first launch, a PIN gate after that. */
export function ParentLayout() {
  const hasPin = useStore((s) => s.settings.parentPinHash !== null)
  const isParentUnlocked = useUiStore((s) => s.isParentUnlocked)
  const lockParent = useUiStore((s) => s.lockParent)

  if (!hasPin) return <OnboardingFlow />
  if (!isParentUnlocked) return <ParentPinGate />

  return (
    <div className="space-y-4">
      <div className="flex justify-end px-4">
        <Button variant="ghost" onClick={lockParent}>
          🔒 Lock
        </Button>
      </div>
      <Outlet />
    </div>
  )
}
