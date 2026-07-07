// Header.tsx — Kleine App-Kopfzeile mit Titel + Darkmode-Umschalter + Wake Lock (v0.5 §14).
import { useTheme } from '@/hooks/useTheme'
import { useWakeLock } from '@/hooks/useWakeLock'

export function Header() {
  const { theme, toggle } = useTheme()
  const { supported: wakeSupported, active: wakeActive, toggle: wakeToggle } = useWakeLock()

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-zypern-blue px-4 py-3 text-white shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>🏖️</span>
        <div>
          <h1 className="text-base font-bold leading-tight">Zypern 2026</h1>
          <p className="text-[11px] opacity-80">17.07.–07.08.2026 · Aradippou</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {/* Wake Lock — nur auf unterstützten Geräten (v0.5 §14). */}
        {wakeSupported && (
          <button
            onClick={wakeToggle}
            className={`touch-target flex items-center justify-center rounded-full px-3 text-sm ${
              wakeActive ? 'bg-white/40' : 'bg-white/15'
            } hover:bg-white/25`}
            aria-label={wakeActive ? 'Bildschirm-Sperre deaktivieren' : 'Bildschirm anlassen'}
            aria-pressed={wakeActive}
          >
            {wakeActive ? '🔆' : '📱'}
          </button>
        )}
        <button
          onClick={toggle}
          className="touch-target flex items-center justify-center rounded-full bg-white/15 px-3 text-sm hover:bg-white/25"
          aria-label={theme === 'dark' ? 'Hell-Modus aktivieren' : 'Dunkel-Modus aktivieren'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
