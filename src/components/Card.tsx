import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** A soft, rounded surface used for grouping content throughout the app. */
export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
