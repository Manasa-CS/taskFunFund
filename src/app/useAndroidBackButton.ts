import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUiStore } from '@/store/uiStore'

/**
 * Android hardware back button: close the topmost modal, else go back in app
 * history, else confirm before exiting — never silently quits mid-task.
 */
export function useAndroidBackButton(): void {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const sub = CapacitorApp.addListener('backButton', () => {
      const { modalStack } = useUiStore.getState()
      if (modalStack.length > 0) {
        modalStack[modalStack.length - 1]()
        return
      }
      if (location.pathname !== '/') {
        navigate(-1)
        return
      }
      if (window.confirm('Exit TaskFunFund?')) {
        CapacitorApp.exitApp()
      }
    })

    return () => {
      sub.then((s) => s.remove())
    }
  }, [navigate, location.pathname])
}
