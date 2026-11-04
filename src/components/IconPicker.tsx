interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  options: string[]
}

/** A grid of suggested emoji plus a free-text fallback, so a new item never defaults to just one icon. */
export function IconPicker({ value, onChange, options }: IconPickerProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Choose an icon">
        {options.map((icon) => (
          <button
            key={icon}
            type="button"
            role="radio"
            aria-checked={value === icon}
            aria-label={icon}
            onClick={() => onChange(icon)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 bg-white text-xl transition-colors ${
              value === icon ? 'border-coral-400 bg-coral-50' : 'border-transparent hover:bg-sunny-50'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
      <input
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-center text-xl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Custom icon"
        maxLength={4}
      />
    </div>
  )
}
