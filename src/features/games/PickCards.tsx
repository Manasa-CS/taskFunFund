import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { pickRandom } from '@/lib/random'
import { playTick } from '@/lib/sounds'
import type { GameProps } from './gameTypes'
import type { PickOption } from '@/lib/pickPool'

/** Pick-a-card game: face-down cards shuffle in, tap one to flip and reveal the result. */
export function PickCards({ pool, onPicked }: GameProps) {
  const [shuffling, setShuffling] = useState(true)
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)
  const [result, setResult] = useState<PickOption | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setShuffling(false), 900)
    return () => clearTimeout(id)
  }, [])

  function tapCard(index: number) {
    if (flippedIndex !== null || shuffling) return
    playTick()
    const picked = pickRandom(pool)
    setFlippedIndex(index)
    setResult(picked)
    setTimeout(() => onPicked(picked), 900)
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {pool.map((p, i) => {
        const isFlipped = flippedIndex === i
        return (
          <motion.button
            key={`${p.kind}-${p.id}-${i}`}
            type="button"
            onClick={() => tapCard(i)}
            disabled={flippedIndex !== null || shuffling}
            className="relative h-28 w-20"
            style={{ perspective: 600 }}
            animate={shuffling ? { x: [0, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="absolute inset-0 rounded-xl"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center rounded-xl bg-grape-400 text-3xl text-white"
                style={{ backfaceVisibility: 'hidden' }}
              >
                ❓
              </div>
              <div
                className="absolute inset-0 flex items-center justify-center rounded-xl bg-white text-3xl shadow"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                {isFlipped && result ? result.icon : ''}
              </div>
            </motion.div>
          </motion.button>
        )
      })}
      <AnimatePresence>
        {shuffling && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-display w-full text-center text-slate-500"
          >
            Shuffling...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
