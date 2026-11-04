export interface CoinPileItem {
  x: number
  y: number
  r: number
  rotation: number
  shade: number
}

const MAX_COINS = 40
const CENTER_X = 256
const BASE_Y = 462
const COINS_PER_LAYER = 6
const LAYER_HEIGHT = 15

function mulberry32(seed: number) {
  let state = seed | 0
  return function random() {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Deterministically lays out a loosely tumbled coin pile for a given seed and count, clipped to a max. */
export function generateCoinPile(seed: number, count: number): CoinPileItem[] {
  const random = mulberry32(Math.trunc(seed))
  const total = Math.max(0, Math.min(Math.trunc(count), MAX_COINS))
  const coins: CoinPileItem[] = []
  for (let i = 0; i < total; i++) {
    const layer = Math.floor(i / COINS_PER_LAYER)
    const posInLayer = i % COINS_PER_LAYER
    const jitterX = (random() - 0.5) * 22
    const jitterY = random() * 8
    coins.push({
      x: CENTER_X + (posInLayer - (COINS_PER_LAYER - 1) / 2) * 21 + jitterX,
      y: BASE_Y - layer * LAYER_HEIGHT - jitterY,
      r: 16 + random() * 7,
      rotation: (random() - 0.5) * 60,
      shade: random(),
    })
  }
  return coins
}
