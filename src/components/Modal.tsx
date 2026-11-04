import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useUiStore } from '@/store/uiStore'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/** A centered dialog with a dismissible backdrop, portaled to document.body. */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const pushModal = useUiStore((s) => s.pushModal)
  const popModal = useUiStore((s) => s.popModal)

  useEffect(() => {
    if (!open) return
    pushModal(onClose)
    return () => popModal(onClose)
  }, [open, onClose, pushModal, popModal])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="font-display mb-3 text-xl text-slate-800">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body,
  )
}
