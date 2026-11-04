import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { KidSwitcher } from '@/components/KidSwitcher'
import { Logo } from '@/components/Logo'
import { InstallGuidePrompt } from '@/features/parent/InstallGuidePrompt'
import { TaskDoneCelebration } from '@/features/fund/TaskDoneCelebration'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'
import { navItems } from './navItems'
import { useAndroidBackButton } from './useAndroidBackButton'

const linkBase =
  'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 min-h-12 min-w-12 font-display text-xs transition-colors'
const linkActive = 'text-coral-500 bg-coral-50'
const linkInactive = 'text-slate-500 hover:text-coral-500'

/**
 * App frame: bottom tab bar on phones, a side rail on tablets and up (≥768px).
 * Pads for the device's safe-area insets so content clears notches and home indicators.
 */
export function AppShell() {
  const location = useLocation()
  const kids = useStore((s) => s.kids)
  const activeKidId = useUiStore((s) => s.activeKidId)
  const setActiveKidId = useUiStore((s) => s.setActiveKidId)
  const isParentRoute = location.pathname.startsWith('/parent')

  useAndroidBackButton()

  // Only one kid ever needs no choosing — with two or more, the Home landing page asks instead.
  useEffect(() => {
    if (activeKidId && kids[activeKidId]) return
    const kidList = Object.values(kids)
    if (kidList.length === 1) setActiveKidId(kidList[0].id)
  }, [kids, activeKidId, setActiveKidId])

  return (
    <div className="flex min-h-svh flex-col bg-sunny-50 md:flex-row">
      <nav
        className="order-last flex justify-around border-t border-slate-100 bg-white px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:order-first md:w-24 md:flex-col md:justify-start md:gap-2 md:border-t-0 md:border-r md:px-2 md:pt-[max(1.5rem,env(safe-area-inset-top))] md:pb-4"
        style={{ paddingLeft: 'max(0.25rem, env(safe-area-inset-left))' }}
        aria-label="Primary"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}
          >
            <span className="text-2xl" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center border-b border-slate-100 bg-white px-6 py-3 md:flex">
          <Logo />
        </header>
        <header className="flex items-center justify-center border-b border-slate-100 bg-white py-2 md:hidden">
          <Logo iconOnly />
        </header>
        <main className="flex-1 overflow-y-auto pt-[max(0.5rem,env(safe-area-inset-top))] pr-[env(safe-area-inset-right)] pb-4">
          {!isParentRoute && <KidSwitcher />}
          <Outlet />
        </main>
      </div>
      <InstallGuidePrompt />
      <TaskDoneCelebration />
    </div>
  )
}
