import { useEffect, useState } from 'react'

export type InstallPlatform = 'ios' | 'android' | 'other'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const promptListeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    promptListeners.forEach((listen) => listen())
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    promptListeners.forEach((listen) => listen())
  })
}

/** Exposes the browser's native install prompt (Chrome/Edge) as a one-click action, when available. */
export function useInstallPrompt() {
  const [canPromptInstall, setCanPromptInstall] = useState(() => deferredPrompt !== null)

  useEffect(() => {
    const update = () => setCanPromptInstall(deferredPrompt !== null)
    promptListeners.add(update)
    return () => {
      promptListeners.delete(update)
    }
  }, [])

  async function promptInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    deferredPrompt = null
    promptListeners.forEach((listen) => listen())
  }

  return { canPromptInstall, promptInstall }
}

/** Guesses the device platform from the user agent, for picking install instructions. */
export function getInstallPlatform(): InstallPlatform {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'other'
}

function checkStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone
  return Boolean(iosStandalone) || window.matchMedia('(display-mode: standalone)').matches
}

/** True once the PWA is running installed/standalone rather than in a browser tab. */
export function useIsInstalled(): boolean {
  const [installed, setInstalled] = useState(checkStandalone)

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)')
    const update = () => setInstalled(checkStandalone())
    mql.addEventListener('change', update)
    window.addEventListener('appinstalled', update)
    return () => {
      mql.removeEventListener('change', update)
      window.removeEventListener('appinstalled', update)
    }
  }, [])

  return installed
}
