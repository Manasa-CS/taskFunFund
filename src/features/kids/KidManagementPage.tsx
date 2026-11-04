import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Modal } from '@/components/Modal'
import { clampSavingsPercent, maxSavingsPercent, minSavingsPercent } from '@/store/defaults'
import { useStore } from '@/store/useStore'
import type { Kid } from '@/store/types'
import { AvatarPicker } from './AvatarPicker'
import { avatarEmoji, avatars, kidColor } from './avatars'
import { ColorPicker } from './ColorPicker'
import { copyKidSetup } from './copySetup'

interface KidFormState {
  name: string
  avatar: string
  color: string
  dailyPointsTarget: number
  maxRerollsPerDay: number
  savingsPercent: number
  minSavingsBalance: number
  weeklySavingsBonusPoints: number
}

const emptyForm: KidFormState = {
  name: '',
  avatar: avatars[0].id,
  color: 'sunny',
  dailyPointsTarget: 10,
  maxRerollsPerDay: 1,
  savingsPercent: 20,
  minSavingsBalance: 0,
  weeklySavingsBonusPoints: 0,
}

/** Parent screen for adding, editing and removing kid profiles. */
export function KidManagementPage() {
  const kids = useStore((s) => s.kids)
  const addKid = useStore((s) => s.addKid)
  const updateKid = useStore((s) => s.updateKid)
  const removeKid = useStore((s) => s.removeKid)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<KidFormState>(emptyForm)
  const [copyFromId, setCopyFromId] = useState<string | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  const kidList = Object.values(kids)
  const isAdding = editingId === 'new'

  function openAdd() {
    setForm(emptyForm)
    setCopyFromId(null)
    setEditingId('new')
  }

  function openEdit(kid: Kid) {
    setForm({
      name: kid.name,
      avatar: kid.avatar,
      color: kid.color,
      dailyPointsTarget: kid.dailyPointsTarget,
      maxRerollsPerDay: kid.maxRerollsPerDay ?? 1,
      savingsPercent: clampSavingsPercent(kid.savingsPercent ?? 20),
      minSavingsBalance: kid.minSavingsBalance ?? 0,
      weeklySavingsBonusPoints: kid.weeklySavingsBonusPoints ?? 0,
    })
    setEditingId(kid.id)
  }

  function save() {
    if (!editingId) return
    const cleanForm = { ...form, savingsPercent: clampSavingsPercent(form.savingsPercent) }
    if (editingId === 'new') {
      const newId = addKid(cleanForm)
      if (copyFromId) copyKidSetup(copyFromId, newId)
    } else {
      updateKid(editingId, cleanForm)
    }
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-slate-800">Kids</h1>
        <Button variant="mint" onClick={openAdd}>
          + Add Kid
        </Button>
      </div>

      {kidList.length === 0 && (
        <Card>
          <p className="text-slate-600">No kids yet — add your first one!</p>
        </Card>
      )}

      <div className="space-y-2">
        {kidList.map((kid) => {
          const color = kidColor(kid.color)
          return (
            <Card key={kid.id} className="flex items-center gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${color.bg}`}>
                {avatarEmoji(kid.avatar)}
              </span>
              <div className="flex-1">
                <p className="font-display text-lg text-slate-800">{kid.name}</p>
                <p className="text-sm text-slate-500">Target: {kid.dailyPointsTarget} points/day</p>
              </div>
              <Button variant="ghost" onClick={() => openEdit(kid)}>
                Edit
              </Button>
              <Button variant="ghost" onClick={() => setConfirmRemoveId(kid.id)} aria-label={`Remove ${kid.name}`}>
                🗑️
              </Button>
            </Card>
          )
        })}
      </div>

      <Modal open={editingId !== null} onClose={() => setEditingId(null)} title={isAdding ? 'Add Kid' : 'Edit Kid'}>
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-600">
            Name
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <AvatarPicker value={form.avatar} onChange={(avatar) => setForm((f) => ({ ...f, avatar }))} />
          <ColorPicker value={form.color} onChange={(color) => setForm((f) => ({ ...f, color }))} />
          <label className="block text-sm font-semibold text-slate-600">
            Daily points target
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.dailyPointsTarget}
              onChange={(e) =>
                setForm((f) => ({ ...f, dailyPointsTarget: Number(e.target.value) || 1 }))
              }
            />
          </label>

          <label className="block text-sm font-semibold text-slate-600">
            "Try again" rerolls/day
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.maxRerollsPerDay}
              onChange={(e) => setForm((f) => ({ ...f, maxRerollsPerDay: Number(e.target.value) || 0 }))}
            />
          </label>

          <div className="space-y-3 rounded-xl border border-slate-100 p-3">
            <p className="font-display text-sm text-slate-700">🔒 Locked Savings</p>
            <label className="block text-sm font-semibold text-slate-600">
              % of every earning swept into Savings ({minSavingsPercent}–{maxSavingsPercent}%)
              <input
                type="number"
                min={minSavingsPercent}
                max={maxSavingsPercent}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.savingsPercent}
                onChange={(e) => setForm((f) => ({ ...f, savingsPercent: Number(e.target.value) || 0 }))}
                onBlur={(e) =>
                  setForm((f) => ({ ...f, savingsPercent: clampSavingsPercent(Number(e.target.value) || minSavingsPercent) }))
                }
              />
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Minimum Savings balance (blocks withdrawals below this)
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.minSavingsBalance}
                onChange={(e) => setForm((f) => ({ ...f, minSavingsBalance: Number(e.target.value) || 0 }))}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Weekly Savings bonus (0 to turn off)
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.weeklySavingsBonusPoints}
                onChange={(e) => setForm((f) => ({ ...f, weeklySavingsBonusPoints: Number(e.target.value) || 0 }))}
              />
            </label>
          </div>

          {isAdding && kidList.length > 0 && (
            <label className="block text-sm font-semibold text-slate-600">
              Copy setup from another kid (optional)
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                value={copyFromId ?? ''}
                onChange={(e) => setCopyFromId(e.target.value || null)}
              >
                <option value="">Start from scratch</option>
                {kidList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <Button variant="sunny" className="w-full" disabled={!form.name.trim()} onClick={save}>
            Save
          </Button>
        </div>
      </Modal>

      <Modal open={confirmRemoveId !== null} onClose={() => setConfirmRemoveId(null)} title="Remove this kid?">
        <p className="mb-4 text-slate-600">
          This removes {confirmRemoveId ? kids[confirmRemoveId]?.name : 'this kid'}'s profile. Their
          history stays on their tasks and logs, but they won't appear in kid screens anymore.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmRemoveId(null)}>
            Cancel
          </Button>
          <Button
            variant="coral"
            className="flex-1"
            onClick={() => {
              if (confirmRemoveId) removeKid(confirmRemoveId)
              setConfirmRemoveId(null)
            }}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  )
}
