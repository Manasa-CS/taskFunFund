import { useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { useUiStore } from '@/store/uiStore'
import { useStore } from '@/store/useStore'

/** PIN entry screen that unlocks Parent mode for this session. */
export function ParentPinGate() {
  const checkParentPin = useStore((s) => s.checkParentPin)
  const unlockParent = useUiStore((s) => s.unlockParent)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  async function submit() {
    if (await checkParentPin(pin)) {
      unlockParent()
    } else {
      setError('Wrong PIN — try again.')
      setPin('')
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 px-4">
      <h1 className="font-display text-center text-3xl text-slate-800">🔒 Parent Area</h1>
      <Card className="space-y-3">
        <label className="block text-sm font-semibold text-slate-600">
          Enter your 4-digit PIN
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-center text-2xl tracking-[0.5em]"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            autoFocus
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''))
              setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </label>
        {error && <p className="text-sm text-coral-600">{error}</p>}
        <Button variant="sunny" className="w-full" disabled={pin.length !== 4} onClick={submit}>
          Unlock
        </Button>
      </Card>
    </div>
  )
}
