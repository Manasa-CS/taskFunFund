import { Link } from 'react-router-dom'

interface BackButtonProps {
  to: string
  label: string
}

/** A back-arrow link for pages nested inside a section, returning to that section's home. */
export function BackButton({ to, label }: BackButtonProps) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-12 items-center gap-1 self-start rounded-xl py-1 pr-2 font-display text-slate-500 hover:text-coral-500"
    >
      <span aria-hidden="true" className="text-xl">
        ←
      </span>
      {label}
    </Link>
  )
}
