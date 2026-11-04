import { avatars } from './avatars'

interface AvatarPickerProps {
  value: string
  onChange: (id: string) => void
}

/** A grid of bundled animal avatars for a kid to choose as their profile picture. */
export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Choose an avatar">
      {avatars.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          role="radio"
          aria-checked={value === avatar.id}
          aria-label={avatar.label}
          onClick={() => onChange(avatar.id)}
          className={`flex min-h-12 min-w-12 items-center justify-center rounded-2xl border-2 bg-white text-3xl transition-colors ${
            value === avatar.id ? 'border-coral-400 bg-coral-50' : 'border-transparent'
          }`}
        >
          {avatar.emoji}
        </button>
      ))}
    </div>
  )
}
