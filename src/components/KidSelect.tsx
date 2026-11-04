import { avatarEmoji } from '@/features/kids/avatars'
import { useStore } from '@/store/useStore'
import type { Kid } from '@/store/types'

interface KidSelectProps {
  value: string | null
  onChange: (kidId: string) => void
}

/** Dropdown for a parent screen to pick which kid's setup they're editing. */
export function KidSelect({ value, onChange }: KidSelectProps) {
  const kids = useStore((s) => s.kids)
  const kidList: Kid[] = Object.values(kids)

  if (kidList.length === 0) return null

  return (
    <select
      className="rounded-xl border border-slate-200 px-3 py-2"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Select kid"
    >
      {kidList.map((kid) => (
        <option key={kid.id} value={kid.id}>
          {avatarEmoji(kid.avatar)} {kid.name}
        </option>
      ))}
    </select>
  )
}
