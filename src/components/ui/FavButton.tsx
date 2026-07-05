// FavButton.tsx — Stern-Toggle (Favoriten / „Waren wir schon").
export interface FavButtonProps {
  active: boolean
  onToggle: () => void
  /** Aktiv-Icon (default Stern) */
  activeIcon?: string
  /** Inaktiv-Icon */
  inactiveIcon?: string
  /** Accessible Label */
  label: string
}

export function FavButton({
  active,
  onToggle,
  activeIcon = '⭐',
  inactiveIcon = '☆',
  label,
}: FavButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className="touch-target flex items-center justify-center rounded-full px-2 text-xl"
      aria-pressed={active}
      aria-label={label}
    >
      <span aria-hidden>{active ? activeIcon : inactiveIcon}</span>
    </button>
  )
}
