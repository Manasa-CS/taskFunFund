import type { TimeOfDay } from '@/store/types'

export interface TaskPreset {
  id: string
  title: string
  icon: string
  defaultPoints: number
  timeOfDay: TimeOfDay
}

const allDays = [0, 1, 2, 3, 4, 5, 6] as const

export const taskPresets: TaskPreset[] = [
  { id: 'homework', title: 'Finish school homework', icon: '📚', defaultPoints: 3, timeOfDay: 'afterSchool' },
  { id: 'cleanRoom', title: 'Clean up my room', icon: '🧹', defaultPoints: 2, timeOfDay: 'evening' },
  { id: 'wakeOnTime', title: 'Wake up on time', icon: '⏰', defaultPoints: 1, timeOfDay: 'morning' },
  { id: 'lunchBox', title: 'Put lunch box in the sink to wash', icon: '🍱', defaultPoints: 1, timeOfDay: 'afterSchool' },
  { id: 'shoes', title: 'Put shoes in their place', icon: '👟', defaultPoints: 1, timeOfDay: 'evening' },
  { id: 'makeBed', title: 'Make my bed', icon: '🛏️', defaultPoints: 1, timeOfDay: 'morning' },
  { id: 'brushTeethMorning', title: 'Brush teeth (morning)', icon: '🪥', defaultPoints: 1, timeOfDay: 'morning' },
  { id: 'brushTeethNight', title: 'Brush teeth (night)', icon: '🪥', defaultPoints: 1, timeOfDay: 'evening' },
  { id: 'packBag', title: 'Pack my school bag', icon: '🎒', defaultPoints: 1, timeOfDay: 'evening' },
  { id: 'hamper', title: 'Put dirty clothes in the hamper', icon: '🧺', defaultPoints: 1, timeOfDay: 'evening' },
]

export const defaultTaskDays = allDays

export const taskIconOptions: string[] = [
  '📌', '✅', '🧹', '🛏️', '🪥', '🎒', '👕', '🧺', '🍽️', '📚', '🐾', '🚿',
]
