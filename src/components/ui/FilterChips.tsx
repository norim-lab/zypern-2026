// FilterChips.tsx — Wiederverwendbare, multi-select Filter-Bar (z. B. Strand-Tags).
export interface FilterChipsProps<T extends string> {
  /** Verfügbare Optionen */
  options: readonly T[]
  /** Aktuell aktive Auswahl */
  selected: T[]
  /** Auswahl toggeln */
  onToggle: (opt: T) => void
  /** Anzeige-Map (optional) — default: Optionswert selbst. */
  labels?: Partial<Record<T, string>>
}

export function FilterChips<T extends string>({ options, selected, onToggle, labels }: FilterChipsProps<T>) {
  return (
    <div className="-mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 pb-1">
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
              active
                ? 'bg-ok text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200'
            }`}
            aria-pressed={active}
          >
            {labels?.[opt] ?? opt}
          </button>
        )
      })}
    </div>
  )
}
