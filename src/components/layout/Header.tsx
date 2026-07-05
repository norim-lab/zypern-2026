// Header.tsx — Kleine App-Kopfzeile mit Titel + Darkmode-Umschalter.
import { useTheme } from '@/hooks/useTheme'

export function Header() {
  const { theme, toggle } = useTheme()
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-zypern-blue px-4 py-3 text-white shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>🏖️</span>
        <div>
          <h1 className="text-base font-bold leading-tight">Zypern 2026</h1>
          <p className="text-[11px] opacity-80">17.07.–07.08.2026 · Aradippou</p>
        </div>
      </div>
      <button
        onClick={toggle}
        className="touch-target flex items-center justify-center rounded-full bg-white/15 px-3 text-sm hover:bg-white/25"
        aria-label={theme === 'dark' ? 'Hell-Modus aktivieren' : 'Dunkel-Modus aktivieren'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
