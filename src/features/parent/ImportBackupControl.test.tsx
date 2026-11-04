import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetStores } from '@/test/testStore'
import { useStore } from '@/store/useStore'
import { CURRENT_SCHEMA_VERSION } from '@/store/migrations'
import { ImportBackupControl } from './ImportBackupControl'

function backupFile(kidName: string): File {
  const state = { ...useStore.getState(), kids: {} }
  const content = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: '2026-01-01T00:00:00Z',
    state: { ...state, kids: { k1: { id: 'k1', name: kidName, avatar: 'fox', color: 'sunny', dailyPointsTarget: 10 } } },
  }
  return new File([JSON.stringify(content)], 'backup.json', { type: 'application/json' })
}

describe('ImportBackupControl', () => {
  beforeEach(async () => {
    await resetStores()
  })

  it('asks for confirmation before replacing data, then applies the backup', async () => {
    const user = userEvent.setup()
    render(<ImportBackupControl buttonLabel="Import backup" />)

    fireEvent.change(screen.getByLabelText('Import backup', { selector: 'input' }), {
      target: { files: [backupFile('Restored Kid')] },
    })

    await waitFor(() => expect(screen.getByText('Replace all data?')).toBeInTheDocument())
    expect(Object.keys(useStore.getState().kids)).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: 'Replace data' }))

    await waitFor(() => {
      expect(Object.values(useStore.getState().kids).map((k) => k.name)).toEqual(['Restored Kid'])
    })
    expect(screen.getByText('Backup restored!')).toBeInTheDocument()
  })

  it('does nothing if the confirmation is cancelled', async () => {
    const user = userEvent.setup()
    render(<ImportBackupControl />)

    fireEvent.change(screen.getByLabelText('Import backup', { selector: 'input' }), {
      target: { files: [backupFile('Restored Kid')] },
    })
    await waitFor(() => expect(screen.getByText('Replace all data?')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByText('Replace all data?')).not.toBeInTheDocument()
    expect(Object.keys(useStore.getState().kids)).toHaveLength(0)
  })

  it('shows a friendly message instead of crashing on an invalid file', async () => {
    render(<ImportBackupControl />)

    const badFile = new File(['not json'], 'backup.json', { type: 'application/json' })
    fireEvent.change(screen.getByLabelText('Import backup', { selector: 'input' }), { target: { files: [badFile] } })

    await waitFor(() => expect(screen.getByText(/valid JSON/)).toBeInTheDocument())
  })

  it('calls onImported after a successful import', async () => {
    const user = userEvent.setup()
    const onImported = vi.fn()
    render(<ImportBackupControl onImported={onImported} />)

    fireEvent.change(screen.getByLabelText('Import backup', { selector: 'input' }), {
      target: { files: [backupFile('Restored Kid')] },
    })
    await waitFor(() => expect(screen.getByText('Replace all data?')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Replace data' }))

    await waitFor(() => expect(onImported).toHaveBeenCalled())
  })
})
