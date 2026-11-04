import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { IconPicker } from '@/components/IconPicker'
import { KidSelect } from '@/components/KidSelect'
import { Modal } from '@/components/Modal'
import { useManagedKidId } from '@/lib/useManagedKidId'
import { useStore } from '@/store/useStore'
import type { FunOption } from '@/store/types'

interface FunFormState {
  title: string
  icon: string
  minutes: number | ''
  active: boolean
}

const emptyForm: FunFormState = { title: '', icon: '🎈', minutes: '', active: true }

const funIconOptions: string[] = [
  '🎈', '🧸', '💃', '🧱', '🌳', '🎲', '🎮', '🎤', '🚲', '🧃', '🪁', '🎪',
]

const presets = [
  { title: '15 min free play', icon: '🧸', minutes: 15 },
  { title: 'Dance party', icon: '💃', minutes: undefined },
  { title: 'Lego time', icon: '🧱', minutes: 20 },
  { title: 'Play outside', icon: '🌳', minutes: 30 },
  { title: 'Board game', icon: '🎲', minutes: 30 },
]

/** Parent screen for the free, always-available fun options a kid can choose. */
export function FunManagementPage() {
  const [kidId, setKidId] = useManagedKidId()
  const funOptions = useStore((s) => s.funOptions)
  const addFunOption = useStore((s) => s.addFunOption)
  const updateFunOption = useStore((s) => s.updateFunOption)
  const removeFunOption = useStore((s) => s.removeFunOption)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FunFormState>(emptyForm)

  const kidFunOptions = kidId ? Object.values(funOptions).filter((f) => f.kidId === kidId) : []

  function addFromPreset(preset: (typeof presets)[number]) {
    if (!kidId) return
    addFunOption({ kidId, title: preset.title, icon: preset.icon, minutes: preset.minutes, active: true })
  }

  function openAdd() {
    setForm(emptyForm)
    setEditingId('new')
  }

  function openEdit(option: FunOption) {
    setForm({ title: option.title, icon: option.icon, minutes: option.minutes ?? '', active: option.active })
    setEditingId(option.id)
  }

  function save() {
    if (!kidId || !editingId) return
    const payload = {
      title: form.title,
      icon: form.icon,
      minutes: form.minutes === '' ? undefined : form.minutes,
      active: form.active,
    }
    if (editingId === 'new') {
      addFunOption({ ...payload, kidId })
    } else {
      updateFunOption(editingId, payload)
    }
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl text-slate-800">Fun Options</h1>
        <KidSelect value={kidId} onChange={setKidId} />
      </div>
      <p className="text-sm text-slate-500">
        Fun is always free — no points needed, and finishing a task never unlocks it.
      </p>

      {!kidId && (
        <Card>
          <p className="text-slate-600">Add a kid first in Parent → Kids.</p>
        </Card>
      )}

      {kidId && (
        <>
          <Card className="space-y-2">
            <h2 className="font-display text-lg text-slate-700">Quick-add</h2>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => addFromPreset(preset)}
                  className="flex min-h-12 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-sunny-50"
                >
                  <span>{preset.icon}</span>
                  {preset.title}
                </button>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="mint" onClick={openAdd}>
              + Custom Fun Option
            </Button>
          </div>

          <div className="space-y-2">
            {kidFunOptions.map((option) => (
              <Card key={option.id} className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <p className={`font-display text-slate-800 ${!option.active ? 'line-through opacity-50' : ''}`}>
                    {option.title}
                  </p>
                  {option.minutes && <p className="text-xs text-slate-500">{option.minutes} min</p>}
                </div>
                <Button variant="ghost" onClick={() => updateFunOption(option.id, { active: !option.active })}>
                  {option.active ? 'Pause' : 'Resume'}
                </Button>
                <Button variant="ghost" onClick={() => openEdit(option)}>
                  Edit
                </Button>
                <Button variant="ghost" aria-label={`Remove ${option.title}`} onClick={() => removeFunOption(option.id)}>
                  🗑️
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal open={editingId !== null} onClose={() => setEditingId(null)} title={editingId === 'new' ? 'Add Fun Option' : 'Edit Fun Option'}>
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-600">
            Title
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <div>
            <p className="text-sm font-semibold text-slate-600">Icon</p>
            <IconPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} options={funIconOptions} />
          </div>
          <label className="block text-sm font-semibold text-slate-600">
            Minutes (optional)
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.minutes}
              onChange={(e) =>
                setForm((f) => ({ ...f, minutes: e.target.value === '' ? '' : Number(e.target.value) }))
              }
            />
          </label>
          <Button variant="sunny" className="w-full" disabled={!form.title.trim()} onClick={save}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  )
}
