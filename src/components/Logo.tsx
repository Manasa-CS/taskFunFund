import iconUrl from '@/assets/taskfunfund-icon.svg'

interface LogoProps {
  /** Icon only (used on narrow screens) instead of icon + wordmark. */
  iconOnly?: boolean
  className?: string
}

/**
 * App logo: icon + wordmark on wide layouts, icon alone on narrow ones.
 * The wordmark is live text in the app's bundled font rather than the SVG's baked-in one,
 * so it always renders consistently instead of falling back to a system font.
 */
export function Logo({ iconOnly = false, className = '' }: LogoProps) {
  if (iconOnly) {
    return <img src={iconUrl} alt="TaskFunFund" className={className || 'h-9 w-9'} />
  }
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={iconUrl} alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
      <span className="font-display text-xl leading-none font-extrabold whitespace-nowrap">
        <span className="text-sky-600">Task</span>
        <span className="text-coral-500">Fun</span>
        <span className="text-sunny-600">Fund</span>
      </span>
    </div>
  )
}
