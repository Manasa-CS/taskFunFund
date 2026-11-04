import { motion } from 'framer-motion'
import { useState } from 'react'
import { pickRandom } from '@/lib/random'
import { playTick } from '@/lib/sounds'
import type { GameProps } from './gameTypes'
import type { PickOption } from '@/lib/pickPool'

/** Mystery box pick game: a row of wobbling gift boxes — tap one to open and reveal the result. */
export function MysteryBox({ pool, onPicked }: GameProps) {
  const [openedIndex, setOpenedIndex] = useState<number | null>(null)
  const [result, setResult] = useState<PickOption | null>(null)

  function open(index: number) {
    if (openedIndex !== null) return
    playTick()
    const picked = pickRandom(pool)
    setOpenedIndex(index)
    setResult(picked)
    setTimeout(() => onPicked(picked), 900)
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {pool.map((p, i) => {
        const isOpen = openedIndex === i
        return (
          <motion.button
            key={`${p.kind}-${p.id}-${i}`}
            type="button"
            disabled={openedIndex !== null}
            onClick={() => open(i)}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-mint-400 text-4xl shadow-md"
            animate={
              isOpen
                ? { scale: [1, 1.3, 1], rotate: [0, -8, 8, 0] }
                : openedIndex === null
                  ? { rotate: [-3, 3, -3] }
                  : { opacity: 0.4 }
            }
            transition={isOpen ? { duration: 0.6 } : { duration: 1.6, repeat: Infinity }}
          >
            {isOpen && result ? result.icon : '🎁'}
          </motion.button>
        )
      })}
    </div>
  )
}
