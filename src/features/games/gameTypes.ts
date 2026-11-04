import type { PickOption } from '@/lib/pickPool'

export interface GameProps {
  pool: PickOption[]
  onPicked: (result: PickOption) => void
}

/** A cycling palette so wedges/cards/faces stay visually distinct regardless of pool size. */
const palette = ['bg-sky-300', 'bg-grape-300', 'bg-coral-300', 'bg-mint-300', 'bg-sunny-300']
const paletteHex = ['#7cd4fd', '#cb9bfa', '#ffa98f', '#76eec0', '#ffe066']

export function slotColor(index: number): string {
  return palette[index % palette.length]
}

/** Same palette as slotColor, as hex, for contexts that need a real CSS color (conic-gradient, etc). */
export function slotColorHex(index: number): string {
  return paletteHex[index % paletteHex.length]
}
