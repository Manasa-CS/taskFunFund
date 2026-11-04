import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Logo } from '@/components/Logo'
import { ImportBackupControl } from '@/features/parent/ImportBackupControl'

/** Shown when there's no data on this device yet: start fresh or restore a backup, right away. */
export function GetStartedPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 text-center">
      <div className="flex justify-center pt-6">
        <Logo className="scale-125" />
      </div>
      <p className="text-slate-600">Do tasks. Have fun. Grow your fund.</p>

      <Card className="space-y-3">
        <Button variant="sunny" className="w-full" onClick={() => navigate('/parent')}>
          🚀 Get Started
        </Button>
        <p className="text-xs text-slate-400">New here? Set up a parent PIN and your first kid.</p>

        <div className="pt-1">
          <ImportBackupControl buttonLabel="📂 Import a backup" buttonVariant="ghost" className="w-full" />
        </div>
        <p className="text-xs text-slate-400">Moving from another device? Restore everything from a backup file.</p>
      </Card>
    </div>
  )
}
