import { useRef, useState } from 'react'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { applyBackup, type BackupFile, parseBackupFile } from '@/store/backup'

interface ImportBackupControlProps {
  buttonLabel?: string
  buttonVariant?: 'sunny' | 'sky' | 'mint' | 'coral' | 'grape' | 'ghost'
  className?: string
  onImported?: () => void
}

/** A file-picker button that validates a backup, confirms before replacing data, then applies it. */
export function ImportBackupControl({
  buttonLabel = 'Import backup',
  buttonVariant = 'ghost',
  className,
  onImported,
}: ImportBackupControlProps) {
  const [pendingImport, setPendingImport] = useState<BackupFile | null>(null)
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportMessage('')
    try {
      const backup = await parseBackupFile(file)
      setPendingImport(backup)
    } catch (err) {
      setImportMessage(err instanceof Error ? err.message : "That file couldn't be read.")
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function confirmImport() {
    if (!pendingImport) return
    applyBackup(pendingImport)
    setPendingImport(null)
    setImportMessage('Backup restored!')
    onImported?.()
  }

  return (
    <>
      <Button variant={buttonVariant} className={className} onClick={() => fileInputRef.current?.click()}>
        {buttonLabel}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        aria-label={buttonLabel}
        onChange={handleFileChosen}
      />
      {importMessage && <p className="text-sm text-slate-600">{importMessage}</p>}

      <Modal open={pendingImport !== null} onClose={() => setPendingImport(null)} title="Replace all data?">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            This backup is from {pendingImport ? new Date(pendingImport.exportedAt).toLocaleString() : ''}. Importing
            it will replace everything currently on this device — every kid, task, and fund balance — with what's
            in the file.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setPendingImport(null)}>
              Cancel
            </Button>
            <Button variant="coral" className="flex-1" onClick={confirmImport}>
              Replace data
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
