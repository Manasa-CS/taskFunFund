import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { diceFaces } from '@/lib/pickPool'
import { pickRandom } from '@/lib/random'
import { playTick } from '@/lib/sounds'
import type { GameProps } from './gameTypes'

const faceDots: Record<number, string> = {
  0: '⚀',
  1: '⚁',
  2: '⚂',
  3: '⚃',
  4: '⚄',
  5: '⚅',
}

/** Roll-the-dice pick game: a tumbling die whose 6 faces map to the pool (repeating if fewer than 6). */
export function RollDice({ pool, onPicked }: GameProps) {
  const [rolling, setRolling] = useState(false)
  const [landedFace, setLandedFace] = useState<number | null>(null)
  const faces = diceFaces(pool)

  function roll() {
    if (rolling || faces.length === 0) return
    playTick()
    setRolling(true)
    setLandedFace(null)
    const result = pickRandom(faces)
    const faceIndex = faces.indexOf(result)
    setTimeout(() => {
      setLandedFace(faceIndex)
      setRolling(false)
      setTimeout(() => onPicked(result), 700)
    }, 900)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-slate-200 bg-white text-6xl shadow-lg"
        animate={rolling ? { rotate: [0, 90, 180, 270, 360, 450], scale: [1, 1.1, 1, 1.1, 1, 1] } : { rotate: 0 }}
        transition={{ duration: 0.9 }}
      >
        {landedFace !== null ? faces[landedFace]?.icon : faceDots[0]}
      </motion.div>
      <Button variant="sunny" disabled={rolling || faces.length === 0} onClick={roll}>
        {rolling ? 'Rolling...' : 'Roll!'}
      </Button>
    </div>
  )
}
