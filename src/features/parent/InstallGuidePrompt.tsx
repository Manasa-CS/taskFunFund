import { Capacitor } from '@capacitor/core'
import { useIsInstalled } from '@/lib/install'
import { useStore } from '@/store/useStore'
import { InstallGuideModal } from './InstallGuideModal'

/** Auto-shows the install guide once, the first time a web visitor hasn't installed the PWA yet. */
export function InstallGuidePrompt() {
  const installed = useIsInstalled()
  const dismissed = useStore((s) => s.settings.installGuideDismissed)
  const updateSettings = useStore((s) => s.updateSettings)

  if (Capacitor.isNativePlatform()) return null

  const shouldShow = !installed && !dismissed

  return <InstallGuideModal open={shouldShow} onClose={() => updateSettings({ installGuideDismissed: true })} />
}
