import { Capacitor } from '@capacitor/core'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { formatLastBackup, isBackupDue } from '@/lib/backupReminder'
import { useToday } from '@/lib/useToday'
import { shareBackup } from '@/store/backup'
import { useStore } from '@/store/useStore'

/** Web-only weekly reminder to back up, shown once a week has passed since the last one. */
export function BackupReminderCard() {
  const lastBackupAt = useStore((s) => s.settings.lastBackupAt)
  const today = useToday()
  const [busy, setBusy] = useState(false)

  if (Capacitor.isNativePlatform() || !isBackupDue(lastBackupAt, today)) return null

  async function handleBackup() {
    setBusy(true)
    try {
      await shareBackup()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="space-y-2 bg-sky-50">
      <p className="font-display text-slate-700">💾 Save a backup of your family's progress</p>
      <p className="text-sm text-slate-500">{formatLastBackup(lastBackupAt, today)}</p>
      <Button variant="sky" disabled={busy} onClick={handleBackup}>
        {busy ? 'Preparing...' : 'Back up now'}
      </Button>
    </Card>
  )
}
