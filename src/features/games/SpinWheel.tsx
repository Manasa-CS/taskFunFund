import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { pickRandom } from '@/lib/random'
import { playTick } from '@/lib/sounds'
import type { GameProps } from './gameTypes'
import { slotColorHex } from './gameTypes'

/** Spin-the-wheel pick game: a colorful wedge-per-option wheel that eases to a stop. */
export function SpinWheel({ pool, onPicked }: GameProps) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const n = pool.length
  const sliceDeg = 360 / n

  const gradient = `conic-gradient(${pool
    .map((_, i) => `${slotColorHex(i)} ${i * sliceDeg}deg ${(i + 1) * sliceDeg}deg`)
    .join(', ')})`

  function spin() {
    if (spinning) return
    playTick()
    setSpinning(true)
    const result = pickRandom(pool)
    const index = pool.indexOf(result)
    // Land the middle of the winning wedge under the top pointer (0deg), with extra full spins for flair.
    const targetSliceCenter = index * sliceDeg + sliceDeg / 2
    const extraSpins = 4 * 360
    const newRotation = rotation - (rotation % 360) + extraSpins + (360 - targetSliceCenter)
    setRotation(newRotation)
    setTimeout(() => {
      setSpinning(false)
      onPicked(result)
    }, 2600)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-64 w-64">
        <div
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2 text-3xl"
          style={{ transform: 'translate(-50%, -40%)' }}
          aria-hidden="true"
        >
          🔻
        </div>
        <motion.div
          className="h-64 w-64 rounded-full border-4 border-white shadow-lg"
          style={{ background: gradient }}
          animate={{ rotate: rotation }}
          transition={{ duration: 2.5, ease: [0.17, 0.67, 0.3, 1] }}
        >
          {pool.map((p, i) => {
            const angle = i * sliceDeg + sliceDeg / 2
            return (
              <span
                key={`${p.kind}-${p.id}-${i}`}
                className="absolute left-1/2 top-1/2 text-xl"
                style={{
                  transform: `rotate(${angle}deg) translate(0, -90px) rotate(${-angle}deg)`,
                }}
                aria-hidden="true"
              >
                {p.icon}
              </span>
            )
          })}
        </motion.div>
      </div>
      <Button variant="sunny" disabled={spinning || n === 0} onClick={spin}>
        {spinning ? 'Spinning...' : 'Spin!'}
      </Button>
    </div>
  )
}
