import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { JarIllustration } from './JarIllustration'

function coinPositions(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('g[transform]')).map((g) => g.getAttribute('transform') ?? '')
}

describe('JarIllustration', () => {
  it.each([0, 0.5, 1])('renders without crashing at fillLevel %s', (fillLevel) => {
    const { getByTestId } = render(<JarIllustration fillLevel={fillLevel} coinCount={5} />)
    const fill = getByTestId('jar-fill-level')
    expect(fill.getAttribute('data-level')).toBe(String(fillLevel))
  })

  it('clamps out-of-range fill levels into 0–1', () => {
    const { getByTestId, rerender } = render(<JarIllustration fillLevel={-2} coinCount={0} />)
    expect(getByTestId('jar-fill-level').getAttribute('data-level')).toBe('0')
    rerender(<JarIllustration fillLevel={5} coinCount={0} />)
    expect(getByTestId('jar-fill-level').getAttribute('data-level')).toBe('1')
  })

  it('renders one coin shape per requested coin, up to the cap', () => {
    const { container } = render(<JarIllustration coinCount={6} seed={3} />)
    expect(container.querySelectorAll('ellipse').length).toBeGreaterThanOrEqual(6 * 3)
  })

  it('keeps the coin pile layout stable across re-renders for the same seed', () => {
    const { container, rerender } = render(<JarIllustration coinCount={8} seed={99} />)
    const first = coinPositions(container)

    rerender(<JarIllustration coinCount={8} seed={99} fillLevel={0.3} />)
    const second = coinPositions(container)

    expect(second).toEqual(first)
  })
})
