import { describe, expect, it } from 'vitest'
import { daysSinceBackup, formatLastBackup, isBackupDue } from './backupReminder'

const now = new Date('2026-01-15T12:00:00Z')

describe('daysSinceBackup', () => {
  it('is null when never backed up', () => {
    expect(daysSinceBackup(undefined, now)).toBeNull()
  })

  it('counts whole days elapsed', () => {
    expect(daysSinceBackup('2026-01-10T12:00:00Z', now)).toBe(5)
    expect(daysSinceBackup('2026-01-15T06:00:00Z', now)).toBe(0)
  })
})

describe('isBackupDue', () => {
  it('is due when never backed up', () => {
    expect(isBackupDue(undefined, now)).toBe(true)
  })

  it('is not due within a week', () => {
    expect(isBackupDue('2026-01-10T12:00:00Z', now)).toBe(false)
  })

  it('is due at exactly 7 days and beyond', () => {
    expect(isBackupDue('2026-01-08T12:00:00Z', now)).toBe(true)
    expect(isBackupDue('2025-12-01T12:00:00Z', now)).toBe(true)
  })
})

describe('formatLastBackup', () => {
  it('reports never backed up', () => {
    expect(formatLastBackup(undefined, now)).toBe('Never backed up yet')
  })

  it('reports today and yesterday specially', () => {
    expect(formatLastBackup('2026-01-15T06:00:00Z', now)).toBe('Last backup: today')
    expect(formatLastBackup('2026-01-14T12:00:00Z', now)).toBe('Last backup: yesterday')
  })

  it('reports N days ago otherwise', () => {
    expect(formatLastBackup('2026-01-10T12:00:00Z', now)).toBe('Last backup: 5 days ago')
  })
})
