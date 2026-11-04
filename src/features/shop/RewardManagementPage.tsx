import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { IconPicker } from '@/components/IconPicker'
import { Modal } from '@/components/Modal'
import { getWeekKey, toDateISO } from '@/lib/dates'
import { formatMoney, pointsToMoneyUnits, walletBalance } from '@/lib/fund'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import type { Reward } from '@/store/types'

interface RewardFormState {
  title: string
  icon: string
  cost: number
  kidIds: string[]
}

const emptyForm: RewardFormState = { title: '', icon: '🎁', cost: 10, kidIds: [] }

const rewardIconOptions: string[] = [
  '🎁', '🍦', '🎮', '🍿', '🧸', '🚴', '🎟️', '📱', '🕹️', '🛍️', '🍕', '🎨',
]

/** Parent screen: build the rewards catalog (shared across kids) and cash points out to real money. */
export function RewardManagementPage() {
  const kids = useStore((s) => s.kids)
  const rewards = useStore((s) => s.rewards)
  const addReward = useStore((s) => s.addReward)
  const updateReward = useStore((s) => s.updateReward)
  const removeReward = useStore((s) => s.removeReward)
  const logEntries = useStore((s) => s.logEntries)
  const spends = useStore((s) => s.spends)
  const addSpend = useStore((s) => s.addSpend)
  const settings = useStore((s) => s.settings)
  const today = useToday()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RewardFormState>(emptyForm)
  const [cashOutKidId, setCashOutKidId] = useState<string | null>(null)
  const [cashOutPoints, setCashOutPoints] = useState(0)

  const kidList = Object.values(kids)
  const rewardList = Object.values(rewards)

  function openAdd() {
    setForm(emptyForm)
    setEditingId('new')
  }

  function openEdit(reward: Reward) {
    setForm({ title: reward.title, icon: reward.icon, cost: reward.cost, kidIds: reward.kidIds })
    setEditingId(reward.id)
  }

  function toggleKid(kidId: string) {
    setForm((f) => ({
      ...f,
      kidIds: f.kidIds.includes(kidId) ? f.kidIds.filter((id) => id !== kidId) : [...f.kidIds, kidId],
    }))
  }

  function save() {
    if (!editingId) return
    if (editingId === 'new') {
      addReward({ ...form })
    } else {
      updateReward(editingId, { ...form })
    }
    setEditingId(null)
  }

  function cashOutKidBalance(kidId: string): number {
    const kid = kids[kidId]
    if (!kid) return 0
    return walletBalance(
      Object.values(logEntries),
      Object.values(spends),
      kidId,
      settings.carryOverUnspent,
      today,
      settings.weekStartsOn,
    )
  }

  function doCashOut() {
    if (!cashOutKidId || cashOutPoints <= 0) return
    addSpend({
      kidId: cashOutKidId,
      kind: 'cashOut',
      refId: 'cashOut',
      points: cashOutPoints,
      dateISO: toDateISO(today),
      weekKey: getWeekKey(today, settings.weekStartsOn),
    })
    setCashOutKidId(null)
    setCashOutPoints(0)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <h1 className="font-display text-3xl text-slate-800">Rewards</h1>

      <div className="flex justify-end">
        <Button variant="mint" onClick={openAdd}>
          + Add Reward
        </Button>
      </div>

      <div className="space-y-2">
        {rewardList.map((reward) => (
          <Card key={reward.id} className="flex items-center gap-3">
            <span className="text-2xl">{reward.icon}</span>
            <div className="flex-1">
              <p className="font-display text-slate-800">{reward.title}</p>
              <p className="text-xs text-slate-500">
                {reward.cost} pts · {reward.kidIds.map((id) => kids[id]?.name).filter(Boolean).join(', ') || 'No kids assigned'}
              </p>
            </div>
            <Button variant="ghost" onClick={() => openEdit(reward)}>
              Edit
            </Button>
            <Button variant="ghost" aria-label={`Remove ${reward.title}`} onClick={() => removeReward(reward.id)}>
              🗑️
            </Button>
          </Card>
        ))}
      </div>

      <Card className="space-y-3">
        <h2 className="font-display text-lg text-slate-700">Cash Out</h2>
        <p className="text-sm text-slate-500">Convert a kid's points to real money at today's rate.</p>
        <select
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
          value={cashOutKidId ?? ''}
          onChange={(e) => setCashOutKidId(e.target.value || null)}
        >
          <option value="">Choose a kid</option>
          {kidList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name} ({cashOutKidBalance(k.id)} pts available)
            </option>
          ))}
        </select>
        {cashOutKidId && (
          <>
            <label className="block text-sm font-semibold text-slate-600">
              Points to cash out
              <input
                type="number"
                min={1}
                max={cashOutKidBalance(cashOutKidId)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                value={cashOutPoints}
                onChange={(e) => setCashOutPoints(Number(e.target.value) || 0)}
              />
            </label>
            <p className="text-sm text-slate-500">
              = {formatMoney(pointsToMoneyUnits(cashOutPoints, kids[cashOutKidId]?.rates ?? settings.rates), kids[cashOutKidId]?.rates ?? settings.rates)}
            </p>
            <Button
              variant="sunny"
              disabled={cashOutPoints <= 0 || cashOutPoints > cashOutKidBalance(cashOutKidId)}
              onClick={doCashOut}
            >
              Record payout
            </Button>
          </>
        )}
      </Card>

      <Modal open={editingId !== null} onClose={() => setEditingId(null)} title={editingId === 'new' ? 'Add Reward' : 'Edit Reward'}>
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
            <IconPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} options={rewardIconOptions} />
          </div>
          <label className="block text-sm font-semibold text-slate-600">
            Cost in points
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.cost}
              onChange={(e) => setForm((f) => ({ ...f, cost: Number(e.target.value) || 1 }))}
            />
          </label>
          <div>
            <span className="block text-sm font-semibold text-slate-600">Available to</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {kidList.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => toggleKid(k.id)}
                  className={`min-h-12 rounded-xl border px-3 py-2 text-sm ${
                    form.kidIds.includes(k.id) ? 'border-coral-400 bg-coral-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  {k.name}
                </button>
              ))}
            </div>
          </div>
          <Button variant="sunny" className="w-full" disabled={!form.title.trim()} onClick={save}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  )
}
