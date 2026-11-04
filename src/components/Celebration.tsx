import { AnimatePresence, motion } from 'framer-motion'

interface CelebrationProps {
  open: boolean
  message: string
  emoji?: string
  onDone: () => void
}

const pieces = ['🎉', '✨', '🎊', '⭐', '🎈']

/** A brief full-screen confetti burst with a message, used when a kid finishes something. */
export function Celebration({ open, message, emoji = '🎉', onDone }: CelebrationProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDone}
        >
          {pieces.map((piece, i) => (
            <motion.span
              key={i}
              className="absolute text-4xl"
              style={{ left: `${15 + i * 15}%`, top: '30%' }}
              initial={{ y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
              animate={{ y: 120, opacity: 0, scale: 1.4, rotate: 180 }}
              transition={{ duration: 1.1, delay: i * 0.05 }}
              onAnimationComplete={i === pieces.length - 1 ? onDone : undefined}
              aria-hidden="true"
            >
              {piece}
            </motion.span>
          ))}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-3xl bg-white px-8 py-6 text-center shadow-lg"
          >
            <p className="text-5xl">{emoji}</p>
            <p className="font-display mt-2 text-xl text-slate-800">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
