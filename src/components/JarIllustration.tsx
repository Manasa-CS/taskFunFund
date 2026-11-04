import { motion } from 'framer-motion'
import { useId, useMemo } from 'react'
import { generateCoinPile } from '@/lib/coinPile'

interface JarIllustrationProps {
  /** How full the jar reads, 0–1 — drives a soft fill tint, independent of the coin pile itself. */
  fillLevel?: number
  /** How many coins sit in the pile (clipped to a sane max so it never overflows the glass). */
  coinCount?: number
  /** When true, coins bounce in on mount instead of appearing static. */
  animateDrop?: boolean
  /** Rendered pixel size (square). */
  size?: number
  /** Seed for the coin pile layout; defaults to coinCount so the same count always looks the same. */
  seed?: number
  className?: string
}

const JAR_PATH =
  'M206 222 h100 v14 c0 10 18 16 30 30 c8 10 10 22 10 38 v120 c0 34 -22 52 -52 52 h-76 c-30 0 -52 -18 -52 -52 v-120 c0 -16 2 -28 10 -38 c12 -14 30 -20 30 -30 z'

function coinFill(shade: number): string {
  // Interpolates between a pale and a deep gold tone so the pile reads as naturally varied.
  const light = { r: 0xff, g: 0xd6, b: 0x66 }
  const dark = { r: 0xc7, g: 0x7f, b: 0x06 }
  const mix = (a: number, b: number) => Math.round(a + (b - a) * shade)
  return `rgb(${mix(light.r, dark.r)}, ${mix(light.g, dark.g)}, ${mix(light.b, dark.b)})`
}

/** The task-card-with-checkmark mark used on the icon, exported so animations can reuse it. */
export function TaskCardMark({ className }: { className?: string }) {
  return (
    <g className={className}>
      <rect x={-34} y={-34} width={68} height={68} rx={16} fill="#FFFFFF" stroke="#1F4E79" strokeOpacity={0.12} strokeWidth={3} />
      <rect x={-20} y={-20} width={40} height={40} rx={10} fill="#4CD39B" />
      <path d="M-10 0 l7 7 l14 -15" fill="none" stroke="#FFFFFF" strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

/** The fund jar from the app icon as a standalone, animatable piece — no background square. */
export function JarIllustration({
  fillLevel = 0,
  coinCount = 0,
  animateDrop = false,
  size = 160,
  seed,
  className,
}: JarIllustrationProps) {
  const uid = useId()
  const level = Math.max(0, Math.min(1, fillLevel))
  const coins = useMemo(() => generateCoinPile(seed ?? coinCount, coinCount), [seed, coinCount])
  const fillHeight = level * 230
  const fillY = 462 - fillHeight

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Fund jar"
    >
      <defs>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.55} />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.22} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0.45} />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d={JAR_PATH} />
        </clipPath>
      </defs>

      <g transform="translate(0 -14)">
        <path d={JAR_PATH} fill={`url(#${uid}-glass)`} />

        <g clipPath={`url(#${uid}-clip)`}>
          <rect
            data-testid="jar-fill-level"
            data-level={level}
            x={186}
            y={fillY}
            width={132}
            height={fillHeight + 40}
            fill="#FFD666"
            opacity={0.16}
          />
          {coins.map((coin, i) => (
            <g key={i} transform={`translate(${coin.x} ${coin.y}) rotate(${coin.rotation})`}>
              <motion.g
                initial={animateDrop ? { y: -220, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.025, type: 'spring', stiffness: 260, damping: 18 }}
              >
                <ellipse cy={3.1} rx={coin.r} ry={coin.r * 0.75} fill="#C77F06" />
                <ellipse rx={coin.r} ry={coin.r * 0.75} fill={coinFill(coin.shade)} stroke="#C77F06" strokeWidth={2} />
                <ellipse cx={-coin.r * 0.35} cy={-coin.r * 0.3} rx={coin.r * 0.25} ry={coin.r * 0.12} fill="#FFF4C2" opacity={0.7} />
              </motion.g>
            </g>
          ))}
        </g>

        <path d={JAR_PATH} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinejoin="round" />
        <rect x={196} y={214} width={120} height={22} rx={10} fill="#FF7A6B" stroke="#FFFFFF" strokeWidth={6} />
        <ellipse cx={256} cy={212} rx={64} ry={15} fill="#FF7A6B" stroke="#FFFFFF" strokeWidth={6} />
        <ellipse cx={256} cy={212} rx={48} ry={8} fill="#1B4F8C" fillOpacity={0.55} />
        <path d="M186 270 c-3 14 -4 34 -3 50" fill="none" stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={10} strokeLinecap="round" />
      </g>
    </svg>
  )
}
