import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { getInstallPlatform } from '@/lib/install'

interface InstallGuideModalProps {
  open: boolean
  onClose: () => void
}

/** Platform-specific step-by-step instructions for adding TaskFunFund to the home screen. */
export function InstallGuideModal({ open, onClose }: InstallGuideModalProps) {
  const platform = getInstallPlatform()

  return (
    <Modal open={open} onClose={onClose} title="📲 Install TaskFunFund">
      <div className="space-y-3 text-slate-700">
        <p className="text-sm text-slate-500">
          Installing adds TaskFunFund to your home screen so it opens like a regular app — and keeps your
          family's data safer from the browser clearing it.
        </p>

        {platform === 'ios' && (
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>
              Tap the <strong>Share</strong> button (⬆️ the square with an arrow) in Safari's toolbar.
            </li>
            <li>
              Scroll down and tap <strong>Add to Home Screen</strong>.
            </li>
            <li>
              Tap <strong>Add</strong> in the top corner.
            </li>
          </ol>
        )}

        {platform === 'android' && (
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>
              Tap the <strong>⋮</strong> menu in the top corner of your browser.
            </li>
            <li>
              Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>).
            </li>
            <li>Confirm by tapping Install.</li>
          </ol>
        )}

        {platform === 'other' && (
          <p className="text-sm">
            Look for an install icon in your browser's address bar, or check its menu for an
            "Install TaskFunFund" or "Add to Home Screen" option.
          </p>
        )}

        <Button variant="sunny" className="w-full" onClick={onClose}>
          Got it!
        </Button>
      </div>
    </Modal>
  )
}
