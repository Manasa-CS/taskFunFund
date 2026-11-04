interface PointBadgeProps {
  points: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-sm px-2 py-0.5',
  md: 'text-base px-3 py-1',
  lg: 'text-xl px-4 py-1.5',
}

/** A pill showing a point value, e.g. "+5 points". */
export function PointBadge({ points, size = 'md' }: PointBadgeProps) {
  const sign = points > 0 ? '+' : ''
  return (
    <span
      className={`font-display inline-flex items-center gap-1 rounded-full bg-sunny-100 font-bold text-sunny-600 ${sizeClasses[size]}`}
    >
      {sign}
      {points} {Math.abs(points) === 1 ? 'point' : 'points'}
    </span>
  )
}
