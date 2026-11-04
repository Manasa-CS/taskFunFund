import { SplashScreen } from '@capacitor/splash-screen'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { useHasHydrated } from '@/app/useHasHydrated'

export default function App() {
  const hydrated = useHasHydrated()

  useEffect(() => {
    if (hydrated) SplashScreen.hide()
  }, [hydrated])

  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-sunny-50">
        <span className="font-display text-2xl text-slate-400">Loading…</span>
      </div>
    )
  }

  return <RouterProvider router={router} />
}
