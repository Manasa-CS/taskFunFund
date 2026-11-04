import { useEffect, useState } from 'react'

export type InstallPlatform = 'ios' | 'android' | 'other'

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
