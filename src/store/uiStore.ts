import { create } from 'zustand'

interface UiState {
  activeKidId: string | null
  setActiveKidId: (id: string | null) => void
  isParentUnlocked: boolean
  unlockParent: () => void
  lockParent: () => void
  /** Close-handlers for currently-open modals, topmost last — lets the Android back button close them in order. */
  modalStack: Array<() => void>
  pushModal: (close: () => void) => void
  popModal: (close: () => void) => void
}

/** Session-only UI state (which kid is selected, whether Parent mode is unlocked) — never persisted. */
export const useUiStore = create<UiState>((set) => ({
  activeKidId: null,
  setActiveKidId: (id) => set({ activeKidId: id }),
  isParentUnlocked: false,
  unlockParent: () => set({ isParentUnlocked: true }),
  lockParent: () => set({ isParentUnlocked: false }),
  modalStack: [],
  pushModal: (close) => set((state) => ({ modalStack: [...state.modalStack, close] })),
  popModal: (close) => set((state) => ({ modalStack: state.modalStack.filter((c) => c !== close) })),
}))
