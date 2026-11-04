import { describe, expect, it } from 'vitest'
import type { Activity, LogEntry } from '@/store/types'
import { diceFaces, getPickPool } from './pickPool'

const kidId = 'kid-1'
const monday = new Date(2026, 2, 16) // Monday

function activity(id: string, overrides: Partial<Activity> = {}): Activity {
  return { id, kidId, title: id, icon: '⭐', category: 'custom', goalType: 'done', goalValue: 1, points: 1, active: true, ...overrides }
}

function log(sourceId: string, sourceType: LogEntry['sourceType'] = 'activity'): LogEntry {
  return {
    id: `${sourceId}-log`,
    kidId,
    sourceType,
    sourceId,
    points: 1,
    toSpend: 1,
    toSavings: 0,
    dateISO: '2026-03-16',
    weekKey: 'x',
  }
}

describe('getPickPool', () => {
  it('includes active activities and excludes inactive ones', () => {
    const pool = getPickPool({
      kidId,
      date: monday,
      activities: [activity('a1'), activity('a2', { active: false })],
      logEntries: [],
    })
    const ids = pool.map((p) => p.id)
    expect(ids).toContain('a1')
    expect(ids).not.toContain('a2') // inactive
  })

  it('removes an activity from the pool once logged today', () => {
    const pool = getPickPool({
      kidId,
      date: monday,
      activities: [activity('a1'), activity('a2')],
      logEntries: [log('a1')],
    })
    expect(pool.map((p) => p.id)).toEqual(['a2'])
  })

  it('is empty once everything is done today', () => {
    const pool = getPickPool({
      kidId,
      date: monday,
      activities: [activity('a1')],
      logEntries: [log('a1')],
    })
    expect(pool).toEqual([])
  })

  it('only includes the requested kid\'s activities', () => {
    const pool = getPickPool({
      kidId,
      date: monday,
      activities: [activity('a1'), { ...activity('a2'), kidId: 'other-kid' }],
      logEntries: [],
    })
    expect(pool.map((p) => p.id)).toEqual(['a1'])
  })
})

describe('diceFaces', () => {
  it('repeats options to fill all 6 faces when there are fewer than 6', () => {
    const pool = [
      { kind: 'activity', id: 't1', title: 't1', icon: '✅', points: 1 },
      { kind: 'activity', id: 't2', title: 't2', icon: '✅', points: 1 },
    ] as const
    const faces = diceFaces([...pool])
    expect(faces).toHaveLength(6)
    expect(faces.map((f) => f.id)).toEqual(['t1', 't2', 't1', 't2', 't1', 't2'])
  })

  it('returns exactly 6 faces with no repeats when there are 6 or more options', () => {
    const pool = Array.from({ length: 8 }, (_, i) => ({ kind: 'activity' as const, id: `t${i}`, title: `t${i}`, icon: '✅', points: 1 }))
    const faces = diceFaces(pool)
    expect(faces).toHaveLength(6)
    expect(new Set(faces.map((f) => f.id)).size).toBe(6)
  })

  it('returns no faces for an empty pool', () => {
    expect(diceFaces([])).toEqual([])
  })
})
