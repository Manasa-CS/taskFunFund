import { Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { useStore } from '@/store/useStore'
import { BackupReminderCard } from './BackupReminderCard'

const links = [
  { to: '/parent/kids', icon: '🧒', label: 'Kids', desc: 'Profiles, avatars, daily targets' },
  { to: '/parent/tasks', icon: '✅', label: 'Tasks', desc: 'Build each kid’s task schedule' },
  { to: '/parent/activities', icon: '🎯', label: 'Activities', desc: 'Learning, music, exercise & more' },
  { to: '/parent/fun', icon: '🎈', label: 'Fun Options', desc: 'Free play, always available' },
  { to: '/parent/screentime', icon: '📺', label: 'Screen Time', desc: 'Prices, caps and live sessions' },
  { to: '/parent/rewards', icon: '🎁', label: 'Rewards', desc: 'Catalog and cash-out' },
  { to: '/parent/adjustments', icon: '⚖️', label: 'Bonus & Penalty', desc: 'Reward good behavior or deduct points' },
  { to: '/parent/approvals', icon: '🕒', label: 'Approvals', desc: 'Activities & reward requests' },
  { to: '/parent/reports', icon: '📊', label: 'Weekly Report', desc: 'Pick a week, export as PDF' },
  { to: '/parent/reports/overall', icon: '📈', label: 'Overall', desc: 'Lifetime totals, week by week' },
  { to: '/parent/certificates', icon: '🏆', label: 'Certificates', desc: 'Suggested awards & custom ones' },
  { to: '/parent/settings', icon: '⚙️', label: 'Settings', desc: 'Rates, week start, backup, PIN' },
]

/** Landing page for the unlocked Parent area, linking out to each management screen. */
export function ParentDashboard() {
  const parentName = useStore((s) => s.settings.parentName)

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <h1 className="font-display text-3xl text-slate-800">Hi, {parentName || 'there'}! 👋</h1>
      <BackupReminderCard />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className="h-full transition-transform hover:scale-[1.02]">
              <p className="text-3xl">{link.icon}</p>
              <p className="font-display mt-2 text-lg text-slate-800">{link.label}</p>
              <p className="text-sm text-slate-500">{link.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
