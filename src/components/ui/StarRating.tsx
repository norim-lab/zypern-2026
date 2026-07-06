// StarRating.tsx — 1–5 Sterne Familie-Bewertung (v0.4).
// Einheitlich für Restaurants, Strände, Ausflüge, Märkte nutzbar.
export interface StarRatingProps {
  /** Aktuelle Sterne (0–5; 0 = keine Bewertung). */
  value: number
  /** Wenn gesetzt: klickbar (Editor). */
  onChange?: (stars: number) => void
  /** Größe */
  size?: 'sm' | 'md'
}

export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const cls = size === 'sm' ? 'text-sm' : 'text-xl'
  const stars = [1, 2, 3, 4, 5]
  const interactive = Boolean(onChange)
  return (
    <div className={`inline-flex gap-0.5 ${cls}`} role={interactive ? 'radiogroup' : 'img'} aria-label={`${value} von 5 Sternen`}>
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${n} Stern${n > 1 ? 'e' : ''}`}
          aria-pressed={value === n}
        >
          <span aria-hidden>{n <= value ? '⭐' : '☆'}</span>
        </button>
      ))}
    </div>
  )
}
