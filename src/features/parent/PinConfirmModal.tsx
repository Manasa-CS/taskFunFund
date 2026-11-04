import { useState } from 'react'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { useStore } from '@/store/useStore'

interface PinConfirmModalProps {
  open: boolean
  title: string
  onClose: () => void
  onConfirmed: () => void
}

/** Re-asks for the parent PIN before a sensitive action (e.g. a savings withdrawal) proceeds. */
export function PinConfirmModal({ open, title, onClose, onConfirmed }: PinConfirmModalProps) {
  const checkParentPin = useStore((s) => s.checkParentPin)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  async function submit() {
    if (await checkParentPin(pin)) {
      setPin('')
      setError('')
      onConfirmed()
    } else {
      setError('Wrong PIN — try again.')
      setPin('')
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setPin('')
        setError('')
        onClose()
      }}
      title={title}
    >
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-600">
          Confirm your PIN
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
          Confirm
        </Button>
      </div>
    </Modal>
  )
}
