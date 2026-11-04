import { useState } from 'react'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { formatLastBackup } from '@/lib/backupReminder'
import { cancelAfterSchoolReminder, scheduleAfterSchoolReminder } from '@/lib/notifications'
import { useStoragePersisted } from '@/lib/storagePersistence'
import { useToday } from '@/lib/useToday'
import { exportBackup, shareBackup } from '@/store/backup'
import { useStore } from '@/store/useStore'
import { ImportBackupControl } from './ImportBackupControl'
import { InstallGuideModal } from './InstallGuideModal'

/** Parent settings: identity, week start, fund rates, backup, data safety, and PIN change. */
export function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const setParentPin = useStore((s) => s.setParentPin)
  const today = useToday()
  const storagePersisted = useStoragePersisted()

  const [newPin, setNewPin] = useState('')
  const [pinSaved, setPinSaved] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [installGuideOpen, setInstallGuideOpen] = useState(false)

  async function handleReminderToggle(enabled: boolean) {
    updateSettings({ afterSchoolReminderEnabled: enabled })
    if (enabled) {
      await scheduleAfterSchoolReminder(settings.afterSchoolReminderHour, settings.afterSchoolReminderMinute)
    } else {
      await cancelAfterSchoolReminder()
    }
  }

  async function handleReminderTimeChange(hour: number, minute: number) {
    updateSettings({ afterSchoolReminderHour: hour, afterSchoolReminderMinute: minute })
    if (settings.afterSchoolReminderEnabled) {
      await scheduleAfterSchoolReminder(hour, minute)
    }
  }

  async function savePin() {
    if (!/^\d{4}$/.test(newPin)) return
    await setParentPin(newPin)
    setNewPin('')
    setPinSaved(true)
    setTimeout(() => setPinSaved(false), 2000)
  }

  async function handleShareBackup() {
    setSharing(true)
    try {
      await shareBackup()
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <BackButton to="/parent" label="Parent" />
      <h1 className="font-display text-3xl text-slate-800">Settings</h1>

      <Card className="space-y-3">
        <h2 className="font-display text-lg text-slate-700">Family</h2>
        <label className="block text-sm font-semibold text-slate-600">
          Your name
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={settings.parentName}
            onChange={(e) => updateSettings({ parentName: e.target.value })}
          />
        </label>
        <div>
          <span className="block text-sm font-semibold text-slate-600">Week starts on</span>
          <div className="mt-1 flex gap-2">
            <Button
              variant={settings.weekStartsOn === 1 ? 'sky' : 'ghost'}
              onClick={() => updateSettings({ weekStartsOn: 1 })}
            >
              Monday
            </Button>
            <Button
              variant={settings.weekStartsOn === 0 ? 'sky' : 'ghost'}
              onClick={() => updateSettings({ weekStartsOn: 0 })}
            >
              Sunday
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-lg text-slate-700">Fund rates</h2>
        <label className="block text-sm font-semibold text-slate-600">
          Points per star
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={settings.rates.pointsPerStar}
            onChange={(e) =>
              updateSettings({
                rates: { ...settings.rates, pointsPerStar: Number(e.target.value) || 1 },
              })
            }
          />
        </label>
        <label className="block text-sm font-semibold text-slate-600">
          Stars per cent
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
            value={settings.rates.starsPerMoneyUnit}
            onChange={(e) =>
              updateSettings({
                rates: { ...settings.rates, starsPerMoneyUnit: Number(e.target.value) || 1 },
              })
            }
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={settings.carryOverUnspent}
            onChange={(e) => updateSettings({ carryOverUnspent: e.target.checked })}
          />
          Carry unspent points over week to week
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={settings.soundOn}
            onChange={(e) => updateSettings({ soundOn: e.target.checked })}
          />
          Sounds on
        </label>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-lg text-slate-700">Reminders</h2>
        <p className="text-sm text-slate-500">A gentle daily nudge on the phone (native app only).</p>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={settings.afterSchoolReminderEnabled}
            onChange={(e) => handleReminderToggle(e.target.checked)}
          />
          Remind me after school
        </label>
        {settings.afterSchoolReminderEnabled && (
          <label className="block text-sm font-semibold text-slate-600">
            Reminder time
            <input
              type="time"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={`${String(settings.afterSchoolReminderHour).padStart(2, '0')}:${String(settings.afterSchoolReminderMinute).padStart(2, '0')}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number)
                handleReminderTimeChange(h, m)
              }}
            />
          </label>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-lg text-slate-700">Parent PIN</h2>
        <label className="block text-sm font-semibold text-slate-600">
          New 4-digit PIN
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 tracking-widest"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
          />
        </label>
        <Button variant="sunny" disabled={newPin.length !== 4} onClick={savePin}>
          {pinSaved ? 'Saved!' : 'Update PIN'}
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-lg text-slate-700">Install & Storage</h2>
        <p className="text-sm text-slate-500">
          {storagePersisted === true && 'Storage protected ✓'}
          {storagePersisted === false && "Storage isn't protected yet — install the app to help keep your data safe."}
          {storagePersisted === null && 'Storage protection status unavailable here.'}
        </p>
        <Button variant="ghost" onClick={() => setInstallGuideOpen(true)}>
          📲 Installation guide
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-lg text-slate-700">Backup</h2>
        <p className="text-sm text-slate-500">
          Export everything to a file you can keep safe or move to a new device.
        </p>
        <p className="text-sm font-semibold text-coral-600">
          ⚠️ Clearing your browser's data, or using private/incognito mode, will erase TaskFunFund's data on
          this device. Back up regularly so nothing is lost.
        </p>
        <p className="text-sm text-slate-500">{formatLastBackup(settings.lastBackupAt, today)}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="sky" disabled={sharing} onClick={handleShareBackup}>
            {sharing ? 'Preparing...' : 'Share backup'}
          </Button>
          <Button variant="ghost" onClick={exportBackup}>
            Download backup
          </Button>
          <ImportBackupControl />
        </div>
      </Card>

      <InstallGuideModal open={installGuideOpen} onClose={() => setInstallGuideOpen(false)} />
    </div>
  )
}
