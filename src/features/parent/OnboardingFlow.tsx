import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Logo } from '@/components/Logo'
import { AvatarPicker } from '@/features/kids/AvatarPicker'
import { avatars } from '@/features/kids/avatars'
import { ColorPicker } from '@/features/kids/ColorPicker'
import { defaultDailyPointsTarget, defaultRates } from '@/store/defaults'
import { useUiStore } from '@/store/uiStore'
import { useStore } from '@/store/useStore'
import type { DayOfWeek } from '@/store/types'

type Step = 'pin' | 'week' | 'rates' | 'kid'

/** First-launch setup: parent PIN, week start day, rate confirmation, and the first kid. */
export function OnboardingFlow() {
  const navigate = useNavigate()
  const setParentPin = useStore((s) => s.setParentPin)
  const updateSettings = useStore((s) => s.updateSettings)
  const addKid = useStore((s) => s.addKid)
  const setActiveKidId = useUiStore((s) => s.setActiveKidId)
  const unlockParent = useUiStore((s) => s.unlockParent)

  const [step, setStep] = useState<Step>('pin')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [parentName, setParentName] = useState('')
  const [pinError, setPinError] = useState('')
  const [weekStartsOn, setWeekStartsOn] = useState<DayOfWeek>(1)
  const [pointsPerStar, setPointsPerStar] = useState(defaultRates.pointsPerStar)
  const [starsPerMoneyUnit, setStarsPerMoneyUnit] = useState(defaultRates.starsPerMoneyUnit)

  const [kidName, setKidName] = useState('')
  const [kidAvatar, setKidAvatar] = useState(avatars[0].id)
  const [kidColorId, setKidColorId] = useState('sunny')
  const [dailyTarget, setDailyTarget] = useState(defaultDailyPointsTarget)

  function submitPinStep() {
    if (!/^\d{4}$/.test(pin)) {
      setPinError('PIN must be exactly 4 digits.')
      return
    }
    if (pin !== pinConfirm) {
      setPinError("PINs don't match — try again.")
      return
    }
    if (!parentName.trim()) {
      setPinError('Enter your name so kids know who signs their certificates.')
      return
    }
    setPinError('')
    setStep('week')
  }

  async function finish() {
    await setParentPin(pin)
    updateSettings({
      parentName: parentName.trim(),
      weekStartsOn,
      rates: { ...defaultRates, pointsPerStar, starsPerMoneyUnit },
    })
    const kidId = addKid({
      name: kidName.trim(),
      avatar: kidAvatar,
      color: kidColorId,
      dailyPointsTarget: dailyTarget,
    })
    setActiveKidId(kidId)
    unlockParent()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-md space-y-4 px-4">
      <div className="flex justify-center pt-4">
        <Logo className="scale-125" />
      </div>
      <h1 className="font-display text-center text-2xl text-slate-800">Welcome! Let's get set up. 🎉</h1>

      {step === 'pin' && (
        <Card className="space-y-3">
          <h2 className="font-display text-xl text-slate-700">Set up Parent mode</h2>
          <label className="block text-sm font-semibold text-slate-600">
            Your name
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="e.g. Mom, Dad, Grandma"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            4-digit PIN
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 tracking-widest"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Confirm PIN
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 tracking-widest"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          {pinError && <p className="text-sm text-coral-600">{pinError}</p>}
          <Button variant="sunny" className="w-full" onClick={submitPinStep}>
            Next
          </Button>
        </Card>
      )}

      {step === 'week' && (
        <Card className="space-y-3">
          <h2 className="font-display text-xl text-slate-700">When should the week start?</h2>
          <div className="flex gap-2">
            <Button
              variant={weekStartsOn === 1 ? 'sky' : 'ghost'}
              className="flex-1"
              onClick={() => setWeekStartsOn(1)}
            >
              Monday
            </Button>
            <Button
              variant={weekStartsOn === 0 ? 'sky' : 'ghost'}
              className="flex-1"
              onClick={() => setWeekStartsOn(0)}
            >
              Sunday
            </Button>
          </div>
          <Button variant="sunny" className="w-full" onClick={() => setStep('rates')}>
            Next
          </Button>
        </Card>
      )}

      {step === 'rates' && (
        <Card className="space-y-3">
          <h2 className="font-display text-xl text-slate-700">Confirm the fund rates</h2>
          <p className="text-sm text-slate-500">You can change these anytime in Settings.</p>
          <label className="block text-sm font-semibold text-slate-600">
            Points per star
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={pointsPerStar}
              onChange={(e) => setPointsPerStar(Number(e.target.value) || 1)}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Stars per cent
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={starsPerMoneyUnit}
              onChange={(e) => setStarsPerMoneyUnit(Number(e.target.value) || 1)}
            />
          </label>
          <Button variant="sunny" className="w-full" onClick={() => setStep('kid')}>
            Next
          </Button>
        </Card>
      )}

      {step === 'kid' && (
        <Card className="space-y-3">
          <h2 className="font-display text-xl text-slate-700">Add your first kid</h2>
          <label className="block text-sm font-semibold text-slate-600">
            Name
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={kidName}
              onChange={(e) => setKidName(e.target.value)}
            />
          </label>
          <AvatarPicker value={kidAvatar} onChange={setKidAvatar} />
          <ColorPicker value={kidColorId} onChange={setKidColorId} />
          <label className="block text-sm font-semibold text-slate-600">
            Daily points target
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(Number(e.target.value) || 1)}
            />
          </label>
          <Button variant="mint" className="w-full" disabled={!kidName.trim()} onClick={finish}>
            Let's go!
          </Button>
        </Card>
      )}
    </div>
  )
}
