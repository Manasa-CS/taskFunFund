/** The one shared source of randomness for picking an outcome — every pick game routes through this. */
export function pickRandom<T>(items: T[]): T {
  if (items.length === 0) throw new Error('pickRandom: cannot pick from an empty list')
  return items[Math.floor(Math.random() * items.length)]
}
