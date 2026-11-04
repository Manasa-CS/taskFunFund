import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia implementation; framer-motion's useReducedMotion needs one.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
