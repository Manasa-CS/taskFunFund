import type { DayOfWeek, Task } from '@/store/types'

/** True if a task is active and scheduled for the given day of week. */
export function isTaskDueOn(task: Task, dayOfWeek: DayOfWeek): boolean {
  return task.active && task.daysOfWeek.includes(dayOfWeek)
}

/** Returns a kid's tasks that are scheduled for the given date, in no particular order. */
export function tasksDueOn(tasks: Task[], date: Date): Task[] {
  const dayOfWeek = date.getDay() as DayOfWeek
  return tasks.filter((t) => isTaskDueOn(t, dayOfWeek))
}
