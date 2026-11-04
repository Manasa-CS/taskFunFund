import { afterEach, describe, expect, it, vi } from 'vitest'
import { pickRandom } from './random'

describe('pickRandom', () => {
  afterEach(() => vi.restoreAllMocks())

  it('throws on an empty list', () => {
    expect(() => pickRandom([])).toThrow()
  })

  it('returns the only item for a single-item list', () => {
    expect(pickRandom(['x'])).toBe('x')
  })

  it('picks by index proportional to Math.random()', () => {
    const items = ['a', 'b', 'c', 'd']
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // -> index 2
    expect(pickRandom(items)).toBe('c')
  })

  it('never picks past the end of the list, even near Math.random() === 1', () => {
    const items = ['a', 'b', 'c']
    vi.spyOn(Math, 'random').mockReturnValue(0.9999999)
    expect(pickRandom(items)).toBe('c')
  })
})
