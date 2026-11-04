import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { IconPicker } from '@/components/IconPicker'
import { KidSelect } from '@/components/KidSelect'
import { Modal } from '@/components/Modal'
import { toDateISO } from '@/lib/dates'
import { useManagedKidId } from '@/lib/useManagedKidId'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import type { DayOfWeek, Task, TimeOfDay } from '@/store/types'
import { taskIconOptions, taskPresets } from './taskLibrary'

const dayLabels: Record<DayOfWeek, string> = { 0: 'Su', 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr', 6: 'Sa' }
const allDays: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6]
const timeOfDayLabels: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afterSchool: 'After School',
  evening: 'Evening',
}

interface TaskFormState {
  title: string
  icon: string
  points: number
  daysOfWeek: DayOfWeek[]
  timeOfDay: TimeOfDay
  active: boolean
}

const emptyForm: TaskFormState = {
  title: '',
  icon: '📌',
  points: 1,
  daysOfWeek: allDays,
  timeOfDay: 'afterSchool',
  active: true,
}

/** Parent screen: build a kid's task schedule from the built-in library or custom tasks. */
export function TaskManagementPage() {
  const [kidId, setKidId] = useManagedKidId()
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const removeTask = useStore((s) => s.removeTask)
  const kid = useStore((s) => (kidId ? s.kids[kidId] : undefined))
  const updateKid = useStore((s) => s.updateKid)
  const logEntries = useStore((s) => s.logEntries)
  const removeLogEntry = useStore((s) => s.removeLogEntry)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TaskFormState>(emptyForm)

  const today = useToday()
  const kidTasks = kidId ? Object.values(tasks).filter((t) => t.kidId === kidId) : []
  const todayISO = toDateISO(today)
  const todaysCompletions = kidId
    ? Object.values(logEntries).filter(
        (l) => l.kidId === kidId && l.sourceType === 'task' && l.dateISO === todayISO,
      )
    : []

  function addFromPreset(presetId: string) {
    if (!kidId) return
    const preset = taskPresets.find((p) => p.id === presetId)
    if (!preset) return
    addTask({
      kidId,
      title: preset.title,
      icon: preset.icon,
      points: preset.defaultPoints,
      daysOfWeek: allDays,
      timeOfDay: preset.timeOfDay,
      active: true,
    })
  }

  function openAdd() {
    setForm(emptyForm)
    setEditingId('new')
  }

  function openEdit(task: Task) {
    setForm({
      title: task.title,
      icon: task.icon,
      points: task.points,
      daysOfWeek: task.daysOfWeek,
      timeOfDay: task.timeOfDay,
      active: task.active,
    })
    setEditingId(task.id)
  }

  function toggleDay(day: DayOfWeek) {
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter((d) => d !== day)
        : [...f.daysOfWeek, day],
    }))
  }

  function save() {
    if (!kidId || !editingId) return
    if (editingId === 'new') {
      addTask({ ...form, kidId })
    } else {
      updateTask(editingId, { ...form })
    }
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl text-slate-800">Tasks</h1>
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
              {taskPresets.map((preset) => (
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
              + Custom Task
            </Button>
          </div>

          {(['morning', 'afterSchool', 'evening'] as TimeOfDay[]).map((tod) => {
            const group = kidTasks.filter((t) => t.timeOfDay === tod)
            if (group.length === 0) return null
            return (
              <div key={tod} className="space-y-2">
                <h3 className="font-display text-sm text-slate-500">{timeOfDayLabels[tod]}</h3>
                {group.map((task) => (
                  <Card key={task.id} className="flex items-center gap-3">
                    <span className="text-2xl">{task.icon}</span>
                    <div className="flex-1">
                      <p className={`font-display text-slate-800 ${!task.active ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {task.points} pts · {task.daysOfWeek.map((d) => dayLabels[d]).join(' ')}
                      </p>
                    </div>
                    <Button variant="ghost" onClick={() => updateTask(task.id, { active: !task.active })}>
                      {task.active ? 'Pause' : 'Resume'}
                    </Button>
                    <Button variant="ghost" onClick={() => openEdit(task)}>
                      Edit
                    </Button>
                    <Button variant="ghost" aria-label={`Remove ${task.title}`} onClick={() => removeTask(task.id)}>
                      🗑️
                    </Button>
                  </Card>
                ))}
              </div>
            )
          })}

          <Card className="space-y-2">
            <h2 className="font-display text-lg text-slate-700">All-tasks-done bonus</h2>
            <p className="text-sm text-slate-500">
              Extra points awarded once on a day {kid?.name ?? 'your kid'} finishes every scheduled task.
            </p>
            <label className="block text-sm font-semibold text-slate-600">
              Bonus points (0 to turn off)
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                value={kid?.allTasksBonusPoints ?? 0}
                onChange={(e) =>
                  kidId && updateKid(kidId, { allTasksBonusPoints: Number(e.target.value) || 0 })
                }
              />
            </label>
          </Card>

          {todaysCompletions.length > 0 && (
            <Card className="space-y-2">
              <h2 className="font-display text-lg text-slate-700">Today's completions</h2>
              <p className="text-sm text-slate-500">Tapped by mistake? Undo removes the points, no judgment.</p>
              {todaysCompletions.map((entry) => {
                const task = tasks[entry.sourceId]
                return (
                  <div key={entry.id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">
                      {task ? `${task.icon} ${task.title}` : entry.note || 'Bonus'} (+{entry.points})
                    </span>
                    <Button variant="ghost" onClick={() => removeLogEntry(entry.id)}>
                      Undo
                    </Button>
                  </div>
                )
              })}
            </Card>
          )}
        </>
      )}

      <Modal open={editingId !== null} onClose={() => setEditingId(null)} title={editingId === 'new' ? 'Add Task' : 'Edit Task'}>
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
            <IconPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} options={taskIconOptions} />
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
            Time of day
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={form.timeOfDay}
              onChange={(e) => setForm((f) => ({ ...f, timeOfDay: e.target.value as TimeOfDay }))}
            >
              <option value="morning">Morning</option>
              <option value="afterSchool">After School</option>
              <option value="evening">Evening</option>
            </select>
          </label>
          <div>
            <span className="block text-sm font-semibold text-slate-600">Days</span>
            <div className="mt-1 flex gap-1">
              {allDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`min-h-12 min-w-12 rounded-full text-sm font-semibold ${
                    form.daysOfWeek.includes(day) ? 'bg-sky-400 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {dayLabels[day]}
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
