import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { IconPicker } from '@/components/IconPicker'
import { KidSelect } from '@/components/KidSelect'
import { Modal } from '@/components/Modal'
import { useManagedKidId } from '@/lib/useManagedKidId'
import { useStore } from '@/store/useStore'
import type { Activity, ActivityCategory, ActivityGoalType } from '@/store/types'
import { activityIconOptions, activityPresets, goalTypeLabels } from './activityLibrary'

interface ActivityFormState {
  title: string
  icon: string
  category: ActivityCategory
  goalType: ActivityGoalType
  goalValue: number
  points: number
  active: boolean
}

const emptyForm: ActivityFormState = {
  title: '',
  icon: '⭐',
  category: 'custom',
  goalType: 'done',
  goalValue: 1,
  points: 1,
  active: true,
}

/** Parent screen: build a kid's list of point-earning activities from the library or from scratch. */
export function ActivityManagementPage() {
  const [kidId, setKidId] = useManagedKidId()
  const activities = useStore((s) => s.activities)
  const addActivity = useStore((s) => s.addActivity)
  const updateActivity = useStore((s) => s.updateActivity)
  const removeActivity = useStore((s) => s.removeActivity)
  const kid = useStore((s) => (kidId ? s.kids[kidId] : undefined))
  const updateKid = useStore((s) => s.updateKid)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ActivityFormState>(emptyForm)

  const kidActivities = kidId ? Object.values(activities).filter((a) => a.kidId === kidId) : []

  function addFromPreset(presetId: string) {
    if (!kidId) return
    const preset = activityPresets.find((p) => p.id === presetId)
    if (!preset) return
    addActivity({
      kidId,
      title: preset.title,
      icon: preset.icon,
      category: preset.category,
      goalType: preset.goalType,
      goalValue: preset.goalValue,
      points: preset.defaultPoints,
      active: true,
    })
  }

  function openAdd() {
    setForm(emptyForm)
    setEditingId('new')
  }

  function openEdit(activity: Activity) {
    setForm({
      title: activity.title,
      icon: activity.icon,
      category: activity.category,
      goalType: activity.goalType,
      goalValue: activity.goalValue,
      points: activity.points,
      active: activity.active,
    })
    setEditingId(activity.id)
  }

  function save() {
    if (!kidId || !editingId) return
    if (editingId === 'new') {
      addActivity({ ...form, kidId })
    } else {
      updateActivity(editingId, { ...form })
    }
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl text-slate-800">Activities</h1>
        <KidSelect value={kidId} onChange={setKidId} />
      </div>

      {!kidId && (
        <Card>
          <p className="text-slate-600">Add a kid first in Parent → Kids.</p>
        </Card>
      )}

      {kidId && (
        <>
          <Card className="space-y-2">
            <h2 className="font-display text-lg text-slate-700">Quick-add from the library</h2>
            <div className="flex flex-wrap gap-2">
              {activityPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => addFromPreset(preset.id)}
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
              + Custom Activity
            </Button>
          </div>

          <div className="space-y-2">
            {kidActivities.map((activity) => (
              <Card key={activity.id} className="flex items-center gap-3">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className={`font-display text-slate-800 ${!activity.active ? 'line-through opacity-50' : ''}`}>
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {activity.points} pts · {activity.goalValue} {goalTypeLabels[activity.goalType].toLowerCase()}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => updateActivity(activity.id, { active: !activity.active })}>
                  {activity.active ? 'Pause' : 'Resume'}
                </Button>
                <Button variant="ghost" onClick={() => openEdit(activity)}>
                  Edit
                </Button>
                <Button variant="ghost" aria-label={`Remove ${activity.title}`} onClick={() => removeActivity(activity.id)}>
                  🗑️
                </Button>
              </Card>
            ))}
          </div>

          <Card className="space-y-2">
            <h2 className="font-display text-lg text-slate-700">Approvals</h2>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={kid?.requireActivityApproval ?? false}
                onChange={(e) => kidId && updateKid(kidId, { requireActivityApproval: e.target.checked })}
              />
              Require my approval before activity points count
            </label>
          </Card>
        </>
      )}

      <Modal open={editingId !== null} onClose={() => setEditingId(null)} title={editingId === 'new' ? 'Add Activity' : 'Edit Activity'}>
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
            <IconPicker
              value={form.icon}
              onChange={(icon) => setForm((f) => ({ ...f, icon }))}
              options={activityIconOptions}
            />
          </div>
          <label className="block text-sm font-semibold text-slate-600">
            Points
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.points}
              onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) || 1 }))}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Goal type
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.goalType}
              onChange={(e) => setForm((f) => ({ ...f, goalType: e.target.value as ActivityGoalType }))}
            >
              <option value="minutes">Minutes (timer)</option>
              <option value="count">Count (tap to add)</option>
              <option value="done">One-time ("I did it!" button)</option>
            </select>
          </label>
          {form.goalType !== 'done' && (
            <label className="block text-sm font-semibold text-slate-600">
              Goal value ({form.goalType === 'minutes' ? 'minutes' : 'count'})
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.goalValue}
                onChange={(e) => setForm((f) => ({ ...f, goalValue: Number(e.target.value) || 1 }))}
              />
            </label>
          )}
          <Button variant="sunny" className="w-full" disabled={!form.title.trim()} onClick={save}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  )
}
