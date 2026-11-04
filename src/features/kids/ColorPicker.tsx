import { kidColors } from './avatars'

interface ColorPickerProps {
  value: string
  onChange: (id: string) => void
}

/** A row of swatches for picking a kid's theme color. */
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Choose a theme color">
      {kidColors.map((color) => (
        <button
          key={color.id}
          type="button"
          role="radio"
          aria-checked={value === color.id}
          aria-label={color.label}
          onClick={() => onChange(color.id)}
          className={`h-12 w-12 rounded-full ${color.bg} transition-transform ${
            value === color.id ? 'scale-110 ring-2 ring-slate-700 ring-offset-2' : ''
          }`}
        />
      ))}
    </div>
  )
}
