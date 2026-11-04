import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { JarIllustration, TaskCardMark } from '@/components/JarIllustration'
import { playCelebration, playSuccessChime } from '@/lib/sounds'
import { useCelebrationQueue } from './celebrationQueue'

const MESSAGES = ['You did it yourself!', 'Your fund is growing!', 'Great job!']
const DURATION_MS = 2000
const BIG_DURATION_MS = 2600
const CONFETTI = ['🎉', '✨', '🎊', '⭐', '🎈']

/** Picks one of the encouraging messages, stable for a given event id. */
function messageFor(eventId: string): string {
  let hash = 0
  for (let i = 0; i < eventId.length; i++) hash = (hash * 31 + eventId.charCodeAt(i)) | 0
  return MESSAGES[Math.abs(hash) % MESSAGES.length]
}

function ConfettiBurst() {
  return (
    <>
      {CONFETTI.map((piece, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-4xl"
          style={{ left: `${15 + i * 15}%`, top: '18%' }}
          initial={{ y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
          animate={{ y: 140, opacity: 0, scale: 1.4, rotate: 180 }}
          transition={{ duration: 1.1, delay: i * 0.05 }}
          aria-hidden="true"
        >
          {piece}
        </motion.span>
      ))}
    </>
  )
}

/**
 * Global overlay that plays a short "task done" jar celebration for each queued event,
 * one after another. Auto-dismisses; tap anywhere to skip early.
 */
export function TaskDoneCelebration() {
  const queue = useCelebrationQueue((s) => s.queue)
  const shift = useCelebrationQueue((s) => s.shift)
  const reducedMotion = useReducedMotion()
  const event = queue[0]
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!event) return
    if (event.targetReached) playCelebration()
    else playSuccessChime()
    const duration = event.targetReached ? BIG_DURATION_MS : DURATION_MS
    timerRef.current = setTimeout(shift, duration)
    return () => clearTimeout(timerRef.current)
  }, [event, shift])

  if (!event) return null

  const message = messageFor(event.id)

  function skip() {
    clearTimeout(timerRef.current)
    shift()
  }

  const coinCount = Math.min(40, Math.max(2, Math.round(event.fillLevel * 16) + 2))

  return (
    <AnimatePresence>
      <motion.div
        key={event.id}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-black/20 px-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={skip}
      >
        {event.targetReached && !reducedMotion && <ConfettiBurst />}

        <div className="relative flex h-40 items-end justify-center">
          {!reducedMotion && (
            <motion.div
              className="absolute"
              initial={{ y: -140, opacity: 1, scale: 1 }}
              animate={{ y: 10, opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.55, ease: 'easeIn' }}
            >
              <svg width={52} height={52} viewBox="-34 -34 68 68" aria-hidden="true">
                <TaskCardMark />
              </svg>
            </motion.div>
          )}
          <JarIllustration
            fillLevel={event.targetReached ? 1 : event.fillLevel}
            coinCount={coinCount}
            animateDrop={!reducedMotion}
            size={event.targetReached ? 190 : 160}
            seed={coinCount * 97 + event.points}
          />
        </div>

        <motion.p
          initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: reducedMotion ? 0 : 0.45 }}
          className="font-display rounded-full bg-white px-5 py-2 text-xl text-slate-800 shadow"
        >
          +{event.points} points
        </motion.p>
        <p className="font-display rounded-full bg-white/90 px-4 py-1 text-sm text-slate-600">
          {event.toSpend} to spend · {event.toSavings} saved 🐷
        </p>
        <p className="font-display text-lg text-white drop-shadow">{message}</p>
        {event.targetReached && (
          <p className="font-display text-2xl text-white drop-shadow">All done for today! 🎉</p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
