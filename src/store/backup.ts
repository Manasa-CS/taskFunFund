import { CURRENT_SCHEMA_VERSION } from './migrations'
import { type AppState, useStore } from './useStore'

export interface BackupFile {
  schemaVersion: number
  exportedAt: string
  state: AppState
}

const REQUIRED_STATE_KEYS = ['kids', 'tasks', 'settings'] as const

function buildBackupFile(): BackupFile {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    state: useStore.getState(),
  }
}

function backupFilename(exportedAt: string): string {
  return `TaskFunFund-backup-${exportedAt.slice(0, 10)}.json`
}

function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function markBackedUpNow(): void {
  useStore.getState().updateSettings({ lastBackupAt: new Date().toISOString() })
}

/** Downloads the entire app state as a JSON file the parent can keep or move between devices. */
export function exportBackup(): void {
  const backup = buildBackupFile()
  downloadJson(JSON.stringify(backup, null, 2), backupFilename(backup.exportedAt))
  markBackedUpNow()
}

export type ShareBackupResult = 'shared' | 'downloaded' | 'cancelled'

/** Shares the backup file via the Web Share API when supported, otherwise falls back to a download. */
export async function shareBackup(): Promise<ShareBackupResult> {
  const backup = buildBackupFile()
  const filename = backupFilename(backup.exportedAt)
  const json = JSON.stringify(backup, null, 2)
  const file = new File([json], filename, { type: 'application/json' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'TaskFunFund Backup' })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return 'cancelled'
      downloadJson(json, filename)
      markBackedUpNow()
      return 'downloaded'
    }
    markBackedUpNow()
    return 'shared'
  }

  downloadJson(json, filename)
  markBackedUpNow()
  return 'downloaded'
}

/** Parses and validates a backup file, throwing a friendly error if it isn't a real TaskFunFund backup. */
export async function parseBackupFile(file: File): Promise<BackupFile> {
  const text = await file.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("That file isn't valid JSON.")
  }

  if (!data || typeof data !== 'object') {
    throw new Error("That doesn't look like a TaskFunFund backup.")
  }
  const raw = data as Record<string, unknown>
  if (typeof raw.schemaVersion !== 'number' || !raw.state || typeof raw.state !== 'object') {
    throw new Error("That doesn't look like a TaskFunFund backup.")
  }
  const state = raw.state as Record<string, unknown>
  if (!REQUIRED_STATE_KEYS.every((key) => key in state)) {
    throw new Error("That file is missing expected TaskFunFund data.")
  }

  return data as BackupFile
}

/**
 * Replaces every data domain (kids, tasks, logs, settings, ...) with a previously validated backup.
 * Merges rather than replaces the whole store, since `backup.state` came through JSON and so has
 * no action functions on it — a full replace would wipe every store method until the app reloaded.
 */
export function applyBackup(backup: BackupFile): void {
  useStore.setState(backup.state)
}
