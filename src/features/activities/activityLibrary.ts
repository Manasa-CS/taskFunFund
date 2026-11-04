import type { ActivityCategory, ActivityGoalType } from '@/store/types'

export interface ActivityPreset {
  id: string
  title: string
  icon: string
  category: ActivityCategory
  goalType: ActivityGoalType
  goalValue: number
  defaultPoints: number
}

export const activityPresets: ActivityPreset[] = [
  { id: 'vocabulary', title: 'Learn 5 new words', icon: '📝', category: 'learning', goalType: 'count', goalValue: 5, defaultPoints: 3 },
  { id: 'music', title: 'Music practice', icon: '🎵', category: 'music', goalType: 'minutes', goalValue: 20, defaultPoints: 4 },
  { id: 'exercise', title: 'Exercise', icon: '🏃', category: 'exercise', goalType: 'minutes', goalValue: 20, defaultPoints: 4 },
  { id: 'reading', title: 'Reading', icon: '📖', category: 'reading', goalType: 'minutes', goalValue: 15, defaultPoints: 3 },
  { id: 'drawing', title: 'Drawing', icon: '🎨', category: 'creative', goalType: 'minutes', goalValue: 15, defaultPoints: 2 },
  { id: 'puzzle', title: 'Puzzle', icon: '🧩', category: 'creative', goalType: 'done', goalValue: 1, defaultPoints: 2 },
  { id: 'mathPractice', title: 'Math practice', icon: '🔢', category: 'learning', goalType: 'minutes', goalValue: 15, defaultPoints: 3 },
]

export const goalTypeLabels: Record<ActivityGoalType, string> = {
  count: 'Count',
  minutes: 'Minutes',
  done: 'One-time',
}

export const categoryIcons: Record<ActivityCategory, string> = {
  learning: '🧠',
  music: '🎵',
  exercise: '🏃',
  creative: '🎨',
  reading: '📖',
  custom: '⭐',
}

export const activityIconOptions: string[] = [
  '⭐', '🧠', '🎵', '🏃', '📖', '🎨', '🧩', '🔢', '🎯', '🧘', '♟️', '🔬',
]
