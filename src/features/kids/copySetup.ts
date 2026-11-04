import { useStore } from '@/store/useStore'

/** Duplicates one kid's tasks, activities, fun options and screen-time options onto another kid. */
export function copyKidSetup(fromKidId: string, toKidId: string): void {
  const state = useStore.getState()

  Object.values(state.tasks)
    .filter((t) => t.kidId === fromKidId)
    .forEach(({ id: _id, kidId: _kidId, ...rest }) => state.addTask({ ...rest, kidId: toKidId }))

  Object.values(state.activities)
    .filter((a) => a.kidId === fromKidId)
    .forEach(({ id: _id, kidId: _kidId, ...rest }) =>
      state.addActivity({ ...rest, kidId: toKidId }),
    )

  Object.values(state.funOptions)
    .filter((f) => f.kidId === fromKidId)
    .forEach(({ id: _id, kidId: _kidId, ...rest }) =>
      state.addFunOption({ ...rest, kidId: toKidId }),
    )

  Object.values(state.screenTimeOptions)
    .filter((o) => o.kidId === fromKidId)
    .forEach(({ id: _id, kidId: _kidId, ...rest }) =>
      state.addScreenTimeOption({ ...rest, kidId: toKidId }),
    )
}
