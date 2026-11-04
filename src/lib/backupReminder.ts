const BACKUP_DUE_DAYS = 7

/** Whole days since the last backup, or null if a backup has never been made. */
export function daysSinceBackup(lastBackupAt: string | undefined, now: Date): number | null {
  if (!lastBackupAt) return null
  return Math.floor((now.getTime() - new Date(lastBackupAt).getTime()) / 86_400_000)
}

/** True once a week has passed since the last backup, or none has ever been made. */
export function isBackupDue(lastBackupAt: string | undefined, now: Date): boolean {
  const days = daysSinceBackup(lastBackupAt, now)
  return days === null || days >= BACKUP_DUE_DAYS
}

/** A short "Last backup: ..." phrase for display. */
export function formatLastBackup(lastBackupAt: string | undefined, now: Date): string {
  const days = daysSinceBackup(lastBackupAt, now)
  if (days === null) return 'Never backed up yet'
  if (days === 0) return 'Last backup: today'
  if (days === 1) return 'Last backup: yesterday'
  return `Last backup: ${days} days ago`
}
