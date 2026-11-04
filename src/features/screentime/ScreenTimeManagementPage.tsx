import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { IconPicker } from '@/components/IconPicker'
import { KidSelect } from '@/components/KidSelect'
import { Modal } from '@/components/Modal'
import { getWeekKey, toDateISO } from '@/lib/dates'
import { cancelScreenTimeNotifications } from '@/lib/notifications'
import { sessionUsedMinutes } from '@/lib/screenTime'
import { screenTimeCost } from '@/lib/fund'
import { useManagedKidId } from '@/lib/useManagedKidId'
import { useStore } from '@/store/useStore'
import type { ScreenTimeOption } from '@/store/types'

interface OptionFormState {
  label: string
  icon: string
  pointsPer15Min: number
}

const emptyForm: OptionFormState = { label: '', icon: '📺', pointsPer15Min: 5 }

const screenTimeIconOptions: string[] = ['📺', '🎮', '📱', '💻', '🎬', '📹', '🕹️', '🖥️']

/** Parent screen: enable extra screen time, configure its price, caps and hours, and manage live sessions. */
export function ScreenTimeManagementPage() {
  const [kidId, setKidId] = useManagedKidId()
  const kid = useStore((s) => (kidId ? s.kids[kidId] : undefined))
  const updateKid = useStore((s) => s.updateKid)
  const options = useStore((s) => s.screenTimeOptions)
  const addScreenTimeOption = useStore((s) => s.addScreenTimeOption)
  const updateScreenTimeOption = useStore((s) => s.updateScreenTimeOption)
  const removeScreenTimeOption = useStore((s) => s.removeScreenTimeOption)
  const sessions = useStore((s) => s.screenTimeSessions)
  const addScreenTimeSession = useStore((s) => s.addScreenTimeSession)
  const updateScreenTimeSession = useStore((s) => s.updateScreenTimeSession)
  const addLogEntry = useStore((s) => s.addLogEntry)
  const weekStartsOn = useStore((s) => s.settings.weekStartsOn)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<OptionFormState>(emptyForm)

  const kidOptions = kidId ? Object.values(options).filter((o) => o.kidId === kidId) : []
  const activeSession = kidId
    ? Object.values(sessions).find((s) => s.kidId === kidId && (s.status === 'running' || s.status === 'paused'))
    : undefined

  function openAdd() {
    setForm(emptyForm)
    setEditingId('new')
  }

  function openEdit(option: ScreenTimeOption) {
    setForm({ label: option.label, icon: option.icon, pointsPer15Min: option.pointsPer15Min })
    setEditingId(option.id)
  }

  function save() {
    if (!kidId || !editingId) return
    if (editingId === 'new') {
      addScreenTimeOption({ ...form, kidId })
    } else {
      updateScreenTimeOption(editingId, form)
    }
    setEditingId(null)
  }

  function endEarlyWithRefund() {
    if (!activeSession || !kidId) return
    const option = options[activeSession.optionId]
    if (!option) return
    const usedMinutes = sessionUsedMinutes(activeSession, new Date())
    const unusedMinutes = Math.max(0, activeSession.minutesBought - usedMinutes)
    const refund = screenTimeCost(option.pointsPer15Min, unusedMinutes)
    updateScreenTimeSession(activeSession.id, { status: 'done', endedAt: new Date().toISOString() })
    cancelScreenTimeNotifications(activeSession.id)
    if (refund > 0) {
      const now = new Date()
      // A refund undoes a wallet spend, so it goes 100% back to the wallet — never split into savings.
      addLogEntry({
        kidId,
        sourceType: 'bonus',
        sourceId: `screenTimeRefund-${activeSession.id}`,
        points: refund,
        toSpend: refund,
        toSavings: 0,
        dateISO: toDateISO(now),
        weekKey: getWeekKey(now, weekStartsOn),
        note: `Refund for ${unusedMinutes} unused minutes`,
      })
    }
  }

  function giftFreeMinutes(minutes: number) {
    if (!kidId || kidOptions.length === 0) return
    addScreenTimeSession({
      kidId,
      optionId: kidOptions[0].id,
      minutesBought: minutes,
      startedAt: new Date().toISOString(),
      status: 'running',
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl text-slate-800">Screen Time</h1>
        <KidSelect value={kidId} onChange={setKidId} />
      </div>

      {!kidId && (
        <Card>
          <p className="text-slate-600">Add a kid first in Parent → Kids.</p>
        </Card>
      )}

      {kidId && kid && (
        <>
          <Card className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={kid.screenTimeEnabled ?? false}
                onChange={(e) => updateKid(kidId, { screenTimeEnabled: e.target.checked })}
              />
              Let {kid.name} buy extra screen time with points
            </label>
            {kid.screenTimeEnabled && (
              <>
                <label className="block text-sm font-semibold text-slate-600">
                  Daily cap in minutes (blank = no cap)
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    value={kid.screenTimeDailyCapMinutes ?? ''}
                    onChange={(e) =>
                      updateKid(kidId, {
                        screenTimeDailyCapMinutes: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </label>
                <div className="flex gap-3">
                  <label className="block flex-1 text-sm font-semibold text-slate-600">
                    Allowed from (hour)
                    <input
                      type="number"
                      min={0}
                      max={23}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                      value={kid.screenTimeAllowedHours?.start ?? ''}
                      onChange={(e) =>
                        updateKid(kidId, {
                          screenTimeAllowedHours:
                            e.target.value === ''
                              ? undefined
                              : { start: Number(e.target.value), end: kid.screenTimeAllowedHours?.end ?? 20 },
                        })
                      }
                    />
                  </label>
                  <label className="block flex-1 text-sm font-semibold text-slate-600">
                    Until (hour)
                    <input
                      type="number"
                      min={0}
                      max={23}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                      value={kid.screenTimeAllowedHours?.end ?? ''}
                      onChange={(e) =>
                        updateKid(kidId, {
                          screenTimeAllowedHours:
                            e.target.value === ''
                              ? undefined
                              : { start: kid.screenTimeAllowedHours?.start ?? 0, end: Number(e.target.value) },
                        })
                      }
                    />
                  </label>
                </div>
              </>
            )}
          </Card>

          {kid.screenTimeEnabled && (
            <>
              <Card className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg text-slate-700">Options</h2>
                  <Button variant="mint" onClick={openAdd}>
                    + Add Option
                  </Button>
                </div>
                {kidOptions.map((option) => (
                  <div key={option.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <p className="font-display text-slate-800">{option.label}</p>
                      <p className="text-xs text-slate-500">{option.pointsPer15Min} pts / 15 min</p>
                    </div>
                    <Button variant="ghost" onClick={() => openEdit(option)}>
                      Edit
                    </Button>
                    <Button variant="ghost" aria-label={`Remove ${option.label}`} onClick={() => removeScreenTimeOption(option.id)}>
                      🗑️
                    </Button>
                  </div>
                ))}
              </Card>

              {activeSession && (
                <Card className="space-y-2">
                  <h2 className="font-display text-lg text-slate-700">Active session</h2>
                  <p className="text-sm text-slate-600">{options[activeSession.optionId]?.label}</p>
                  <Button variant="coral" onClick={endEarlyWithRefund}>
                    End early & refund unused points
                  </Button>
                </Card>
              )}

              {!activeSession && kidOptions.length > 0 && (
                <Card className="space-y-2">
                  <h2 className="font-display text-lg text-slate-700">Gift free time</h2>
                  <div className="flex gap-2">
                    {[15, 30].map((m) => (
                      <Button key={m} variant="grape" onClick={() => giftFreeMinutes(m)}>
                        Gift {m} min
                      </Button>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}

      <Modal open={editingId !== null} onClose={() => setEditingId(null)} title={editingId === 'new' ? 'Add Option' : 'Edit Option'}>
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-600">
            Label
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
          </label>
          <div>
            <p className="text-sm font-semibold text-slate-600">Icon</p>
            <IconPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} options={screenTimeIconOptions} />
          </div>
          <label className="block text-sm font-semibold text-slate-600">
            Points per 15 min
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.pointsPer15Min}
              onChange={(e) => setForm((f) => ({ ...f, pointsPer15Min: Number(e.target.value) || 1 }))}
            />
          </label>
          <Button variant="sunny" className="w-full" disabled={!form.label.trim()} onClick={save}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  )
}
