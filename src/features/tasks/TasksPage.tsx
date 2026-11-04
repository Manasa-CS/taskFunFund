import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Card } from '@/components/Card'
import { RecentDatePicker } from '@/components/RecentDatePicker'
import { pushEarningCelebration } from '@/features/fund/pushEarningCelebration'
import { getWeekKey, parseDateISO, toDateISO } from '@/lib/dates'
import { tasksDueOn } from '@/lib/schedule'
import { getStreak } from '@/lib/streaks'
import { useToday } from '@/lib/useToday'
import { useUiStore } from '@/store/uiStore'
import { useStore } from '@/store/useStore'
import type { Task, TimeOfDay } from '@/store/types'

const timeOfDayLabels: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afterSchool: 'After School',
  evening: 'Evening',
}

const BONUS_SOURCE_ID = 'allTasksBonus'

/** Kid-facing "My Tasks Today" checklist, grouped by time of day. */
export function TasksPage() {
  const activeKidId = useUiStore((s) => s.activeKidId)
  const kid = useStore((s) => (activeKidId ? s.kids[activeKidId] : undefined))
  const allTasks = useStore((s) => s.tasks)
  const allLogEntries = useStore((s) => s.logEntries)
  const addEarning = useStore((s) => s.addEarning)
  const weekStartsOn = useStore((s) => s.settings.weekStartsOn)
  const [burst, setBurst] = useState<{ taskId: string; points: number } | null>(null)
  const today = useToday()
  const todayISO = toDateISO(today)
  const [selectedDateISO, setSelectedDateISO] = useState(todayISO)

  if (!kid) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <p className="text-slate-600">No kid selected yet — ask a grown-up to add one in Parent → Kids.</p>
        </Card>
      </div>
    )
  }

  const selectedDate = parseDateISO(selectedDateISO)
  const isToday = selectedDateISO === todayISO
  const kidTasks = Object.values(allTasks).filter((t) => t.kidId === kid.id)
  const dueOnSelected = tasksDueOn(kidTasks, selectedDate)
  const kidLogsOnSelected = Object.values(allLogEntries).filter(
    (l) => l.kidId === kid.id && l.dateISO === selectedDateISO,
  )
  const doneTaskIds = new Set(
    kidLogsOnSelected.filter((l) => l.sourceType === 'task').map((l) => l.sourceId),
  )
  const pointsOnSelected = kidLogsOnSelected
    .filter((l) => l.approved !== false)
    .reduce((sum, l) => sum + l.points, 0)
  const kidLogsAll = Object.values(allLogEntries).filter((l) => l.kidId === kid.id)
  const streak = getStreak(kidTasks, kidLogsAll, kid.id, today)

  function completeTask(task: Task) {
    if (!kid || doneTaskIds.has(task.id)) return
    const entryId = addEarning({
      kidId: kid.id,
      sourceType: 'task',
      sourceId: task.id,
      points: task.points,
      dateISO: selectedDateISO,
      weekKey: getWeekKey(selectedDate, weekStartsOn),
    })
    pushEarningCelebration({ kidId: kid.id, entryId, todayISO: selectedDateISO, dailyPointsTarget: kid.dailyPointsTarget })
    setBurst({ taskId: task.id, points: task.points })

    const nowDoneIds = new Set(doneTaskIds)
    nowDoneIds.add(task.id)
    const allDone = dueOnSelected.every((t) => nowDoneIds.has(t.id))
    const alreadyGotBonus = kidLogsOnSelected.some(
      (l) => l.sourceType === 'bonus' && l.sourceId === BONUS_SOURCE_ID,
    )
    if (allDone && kid.allTasksBonusPoints && !alreadyGotBonus) {
      const bonusId = addEarning({
        kidId: kid.id,
        sourceType: 'bonus',
        sourceId: BONUS_SOURCE_ID,
        points: kid.allTasksBonusPoints,
        dateISO: selectedDateISO,
        weekKey: getWeekKey(selectedDate, weekStartsOn),
        note: 'All tasks done bonus! 🎉',
      })
      pushEarningCelebration({
        kidId: kid.id,
        entryId: bonusId,
        todayISO: selectedDateISO,
        dailyPointsTarget: kid.dailyPointsTarget,
      })
    }
  }

  const remaining = Math.max(0, kid.dailyPointsTarget - pointsOnSelected)
  const groups = (['morning', 'afterSchool', 'evening'] as TimeOfDay[])
    .map((tod) => ({ tod, tasks: dueOnSelected.filter((t) => t.timeOfDay === tod) }))
    .filter((g) => g.tasks.length > 0)

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <h1 className="font-display text-3xl text-slate-800">My Tasks</h1>

      <RecentDatePicker dateISO={selectedDateISO} onChange={setSelectedDateISO} />

      <Card className="space-y-2">
        <p className="font-display text-lg text-slate-700">
          {pointsOnSelected} of {kid.dailyPointsTarget} points
          {remaining > 0 ? ` — ${remaining} more to go!` : ' — target hit! 🎉'}
        </p>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-mint-400 transition-all"
            style={{ width: `${Math.max(0, Math.min(100, (pointsOnSelected / kid.dailyPointsTarget) * 100))}%` }}
          />
        </div>
        {isToday && streak > 1 && <p className="text-sm text-coral-500">🔥 {streak} days in a row!</p>}
      </Card>

      {groups.length === 0 && (
        <Card>
          <p className="text-slate-600">No tasks scheduled for this day — enjoy some free time! 🎈</p>
        </Card>
      )}

      {groups.map(({ tod, tasks }) => (
        <div key={tod} className="space-y-2">
          <h2 className="font-display text-sm text-slate-500">{timeOfDayLabels[tod]}</h2>
          {tasks.map((task) => {
            const done = doneTaskIds.has(task.id)
            return (
              <button
                key={task.id}
                type="button"
                disabled={done}
                onClick={() => completeTask(task)}
                className="relative w-full"
              >
                <Card
                  className={`flex items-center gap-3 text-left transition-colors ${
                    done ? 'bg-mint-50' : 'hover:bg-sunny-50'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-xl ${
                      done ? 'border-mint-400 bg-mint-400 text-white' : 'border-slate-300'
                    }`}
                    aria-hidden="true"
                  >
                    {done ? '✓' : task.icon}
                  </span>
                  <span className={`font-display flex-1 text-slate-800 ${done ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </span>
                  <span className="font-display text-sunny-600">+{task.points}</span>
                </Card>
                <AnimatePresence>
                  {burst?.taskId === task.id && (
                    <motion.span
                      initial={{ opacity: 1, y: 0, scale: 0.8 }}
                      animate={{ opacity: 0, y: -40, scale: 1.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      onAnimationComplete={() => setBurst(null)}
                      className="font-display pointer-events-none absolute right-4 top-1/2 text-xl text-mint-500"
                    >
                      I did it myself! +{burst.points}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
