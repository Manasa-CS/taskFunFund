import { beforeEach, describe, expect, it } from 'vitest'
import { resetStores } from '@/test/testStore'
import { applyBackup, parseBackupFile } from './backup'
import { CURRENT_SCHEMA_VERSION } from './migrations'
import { useStore } from './useStore'

function jsonFile(content: unknown): File {
  return new File([JSON.stringify(content)], 'backup.json', { type: 'application/json' })
}

describe('parseBackupFile', () => {
  beforeEach(async () => {
    await resetStores()
  })

  it('rejects a file that is not valid JSON', async () => {
    const file = new File(['not json'], 'backup.json', { type: 'application/json' })
    await expect(parseBackupFile(file)).rejects.toThrow(/valid JSON/)
  })

  it('rejects valid JSON that is not a TaskFunFund backup', async () => {
    await expect(parseBackupFile(jsonFile({ hello: 'world' }))).rejects.toThrow(/TaskFunFund backup/)
  })

  it('rejects a backup missing expected state keys', async () => {
    const file = jsonFile({ schemaVersion: 1, exportedAt: 'x', state: { onlyThis: true } })
    await expect(parseBackupFile(file)).rejects.toThrow(/missing expected/)
  })

  it('accepts a well-formed backup', async () => {
    const kidId = useStore.getState().addKid({ name: 'Aria', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    const file = jsonFile({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: '2026-01-01T00:00:00Z',
      state: useStore.getState(),
    })
    const backup = await parseBackupFile(file)
    expect(backup.state.kids[kidId].name).toBe('Aria')
  })
})

describe('applyBackup', () => {
  beforeEach(async () => {
    await resetStores()
  })

  it('replaces the entire app state', async () => {
    useStore.getState().addKid({ name: 'OldKid', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })

    const file = jsonFile({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: '2026-01-01T00:00:00Z',
      state: { ...useStore.getState(), kids: {} },
    })
    const backup = await parseBackupFile(file)

    const newKidId = 'new-kid'
    backup.state.kids = { [newKidId]: { id: newKidId, name: 'NewKid', avatar: 'owl', color: 'mint', dailyPointsTarget: 5, createdAt: '2026-01-01' } }

    applyBackup(backup)

    expect(Object.keys(useStore.getState().kids)).toEqual([newKidId])
  })

  it('keeps every store action callable afterward — the backup JSON has no functions on it', async () => {
    const file = jsonFile({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: '2026-01-01T00:00:00Z',
      state: useStore.getState(),
    })
    const backup = await parseBackupFile(file)

    applyBackup(backup)

    expect(typeof useStore.getState().addKid).toBe('function')
    expect(() => useStore.getState().addKid({ name: 'Post-import', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })).not.toThrow()
  })

  it('restores points and locked savings along with everything else, not just kid profiles', async () => {
    const kidId = useStore.getState().addKid({ name: 'Aria', avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 })
    useStore.getState().addEarning({
      kidId,
      sourceType: 'task',
      sourceId: 't1',
      points: 20,
      dateISO: '2026-01-05',
      weekKey: '2026-W02',
    })
    useStore.getState().requestSavingsWithdrawal({ kidId, amount: 2, reason: 'toy', dateISO: '2026-01-06' })

    const file = jsonFile({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: '2026-01-06T00:00:00Z',
      state: useStore.getState(),
    })
    const backup = await parseBackupFile(file)

    await resetStores()
    expect(Object.keys(useStore.getState().logEntries)).toHaveLength(0)

    applyBackup(backup)

    const entries = Object.values(useStore.getState().logEntries)
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ points: 20, toSpend: 16, toSavings: 4 })
    expect(Object.values(useStore.getState().savingsWithdrawalRequests)).toHaveLength(1)
  })
})
