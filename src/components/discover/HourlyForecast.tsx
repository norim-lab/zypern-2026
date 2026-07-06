// HourlyForecast.tsx — Stunden-Temperaturverlauf als horizontale Balken (v0.4).
// Zeigt Temperatur + gefühlte + UV + Niederschlagswahrscheinlichkeit; Jetzt-Markierung.
import { formatDualTime } from '@/lib/format'
import { CY_TZ } from '@/lib/timezone'
import type { HourlyForecast as HourlyPoint } from '@/data/types'

export interface HourlyForecastProps {
  points: HourlyPoint[]
  /** Zeitzonen-Label für die Stunde (Default Zypern). */
  tz?: typeof CY_TZ
}

/** Farbe für eine Temperatur. */
function tempColor(t: number): string {
  if (t >= 35) return 'text-danger'
  if (t >= 30) return 'text-warn'
  if (t >= 20) return 'text-zypern-blue-dark dark:text-sky-300'
  return 'text-slate-500'
}

export function HourlyForecast({ points, tz = CY_TZ }: HourlyForecastProps) {
  const now = Date.now()
  // Nur Stunden ab „jetzt − 1h" zeigen, max. 48 h.
  const visible = points.filter((p) => {
    const ms = Date.parse(p.time)
    return ms >= now - 2 * 3600_000
  })

  if (visible.length === 0) {
    return <p className="text-xs text-slate-400">Kein Stundenverlauf verfügbar.</p>
  }

  return (
    <div className="-mx-1 overflow-x-auto pb-2">
      <div className="flex gap-2 px-1">
        {visible.map((p) => {
          const ms = Date.parse(p.time)
          const isNow = Math.abs(ms - now) < 3600_000
          return (
            <div
              key={p.time}
              className={`flex w-14 shrink-0 flex-col items-center rounded-xl p-1.5 ${
                isNow ? 'bg-zypern-blue text-white' : 'bg-slate-50 dark:bg-slate-700/40'
              }`}
            >
              <span className={`text-[10px] ${isNow ? 'opacity-90' : 'text-slate-500 dark:text-slate-400'}`}>
                {new Intl.DateTimeFormat('de-DE', { hour: '2-digit', timeZone: tz }).format(ms)}
              </span>
              <span className={`text-sm font-bold ${isNow ? '' : tempColor(p.temperature)}`}>
                {Math.round(p.temperature)}°
              </span>
              {/* Niederschlagswahrscheinlichkeit */}
              <span className={`text-[10px] ${isNow ? 'opacity-90' : 'text-sky-600 dark:text-sky-300'}`}>
                💧{p.precipProb}%
              </span>
              {/* UV-Index (wichtig für Strandplanung) */}
              {p.uvIndex >= 6 && (
                <span className={`text-[10px] ${isNow ? 'opacity-90' : 'text-warn'}`}>
                  UV {Math.round(p.uvIndex)}
                </span>
              )}
              {isNow && (
                <span className="text-[9px] font-semibold uppercase tracking-wide opacity-90">Jetzt</span>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-1 px-1 text-[10px] text-slate-400">
        Balken = Temperatur; 💧 = Niederschlagswahrscheinlichkeit; UV ab 6 = hoch.
        Gefühlte Temp max.: {Math.round(Math.max(...visible.map((p) => p.apparentTemp)))}°.
      </p>
    </div>
  )
}

/** Komfort-Helfer für DualTime-Anzeige einer Stunde. */
export function dualHourLabel(ms: number): string {
  return formatDualTime(ms)
}
