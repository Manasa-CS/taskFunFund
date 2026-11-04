import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BackButton } from '@/components/BackButton'
import { Card } from '@/components/Card'
import { RecentDatePicker } from '@/components/RecentDatePicker'
import { toDateISO } from '@/lib/dates'
import { useToday } from '@/lib/useToday'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'

/** Kid-facing list of a day's available activities — already-finished ones drop off until the next day. */
export function ActivitiesListPage() {
  const activeKidId = useUiStore((s) => s.activeKidId)
  const kid = useStore((s) => (activeKidId ? s.kids[activeKidId] : undefined))
  const activities = useStore((s) => s.activities)
  const logEntries = useStore((s) => s.logEntries)
  const today = useToday()
  const todayISO = toDateISO(today)
  const [selectedDateISO, setSelectedDateISO] = useState(todayISO)

  if (!kid) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <p className="text-slate-600">No kid selected yet.</p>
        </Card>
      </div>
    )
  }

  const doneIds = new Set(
    Object.values(logEntries)
      .filter((l) => l.kidId === kid.id && l.sourceType === 'activity' && l.dateISO === selectedDateISO)
      .map((l) => l.sourceId),
  )
  const available = Object.values(activities).filter(
    (a) => a.kidId === kid.id && a.active && !doneIds.has(a.id),
  )

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/" label="Home" />
      <h1 className="font-display text-3xl text-slate-800">Activities</h1>

      <RecentDatePicker dateISO={selectedDateISO} onChange={setSelectedDateISO} />

      {available.length === 0 && (
        <Card>
          <p className="text-slate-600">No activities yet — ask a grown-up to add some!</p>
        </Card>
      )}
      <div className="space-y-2">
        {available.map((activity) => (
          <Link key={activity.id} to={`/activities/${activity.id}`} state={{ dateISO: selectedDateISO }}>
            <Card className="flex items-center gap-3 transition-transform hover:scale-[1.01]">
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="font-display text-slate-800">{activity.title}</p>
                <p className="text-xs text-slate-500">
                  {activity.goalType === 'minutes' && `${activity.goalValue} minutes`}
                  {activity.goalType === 'count' && `${activity.goalValue} to count`}
                  {activity.goalType === 'done' && 'One tap to finish'}
                </p>
              </div>
              <span className="font-display text-sunny-600">+{activity.points}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
