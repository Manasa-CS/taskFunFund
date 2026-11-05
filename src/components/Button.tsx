import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'sunny' | 'sky' | 'mint' | 'coral' | 'grape' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  sunny: 'bg-sunny-400 hover:bg-sunny-500 text-sunny-600 active:scale-95',
  sky: 'bg-sky-400 hover:bg-sky-500 text-white active:scale-95',
  mint: 'bg-mint-400 hover:bg-mint-500 text-white active:scale-95',
  coral: 'bg-coral-400 hover:bg-coral-500 text-white active:scale-95',
  grape: 'bg-grape-400 hover:bg-grape-500 text-white active:scale-95',
  ghost: 'bg-white hover:bg-sunny-50 text-slate-700 border border-slate-200 active:scale-95',
}

/** Rounded, chunky, kid-friendly button with a minimum 48px tap target. */
export function Button({ variant = 'sunny', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`font-display min-h-12 min-w-12 rounded-2xl px-5 py-3 text-lg font-semibold shadow-sm transition-transform disabled:pointer-events-none disabled:opacity-40${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
