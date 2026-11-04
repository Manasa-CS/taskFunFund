import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const AFTER_SCHOOL_REMINDER_ID = 900001

/** Turns a session/task id into a stable 32-bit notification id (Android requires a numeric id). */
function idFor(key: string, salt: number): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0
  }
  return (Math.abs(hash) % 1_000_000) + salt
}

/** Asks for local-notification permission once; safe to call repeatedly. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const status = await LocalNotifications.checkPermissions()
    if (status.display === 'granted') return true
    const requested = await LocalNotifications.requestPermissions()
    return requested.display === 'granted'
  } catch {
    return false
  }
}

/** Schedules the 5-minute warning and "time's up" notifications for a screen-time session. */
export async function scheduleScreenTimeNotifications(sessionId: string, warnAt: Date, endAt: Date): Promise<void> {
  if (!(await ensureNotificationPermission())) return
  await LocalNotifications.schedule({
    notifications: [
      {
        id: idFor(sessionId, 0),
        title: '⏰ 5 minutes left!',
        body: 'Screen time is almost up — time to wrap up.',
        schedule: { at: warnAt },
      },
      {
        id: idFor(sessionId, 1),
        title: "⏰ Time's up!",
        body: 'Great job today — screen time is over.',
        schedule: { at: endAt },
      },
    ],
  })
}

/** Cancels any pending screen-time notifications for a session (used on pause/resume/end-early). */
export async function cancelScreenTimeNotifications(sessionId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  await LocalNotifications.cancel({
    notifications: [{ id: idFor(sessionId, 0) }, { id: idFor(sessionId, 1) }],
  })
}

/** Schedules a daily after-school reminder, e.g. "10 points to score today!". */
export async function scheduleAfterSchoolReminder(hour: number, minute: number): Promise<void> {
  if (!(await ensureNotificationPermission())) return
  await LocalNotifications.schedule({
    notifications: [
      {
        id: AFTER_SCHOOL_REMINDER_ID,
        title: '🎯 Ready to earn some points today?',
        body: "Check your tasks — every point grows your fund!",
        schedule: { on: { hour, minute }, allowWhileIdle: true },
      },
    ],
  })
}

/** Cancels the after-school reminder. */
export async function cancelAfterSchoolReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  await LocalNotifications.cancel({ notifications: [{ id: AFTER_SCHOOL_REMINDER_ID }] })
}
