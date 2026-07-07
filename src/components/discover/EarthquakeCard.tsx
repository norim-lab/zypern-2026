// EarthquakeCard.tsx — Dezent Info bei Erdbeben M ≥ 4 in letzten 24 h (v0.5 §8).
import { Card } from '@/components/ui/Card'
import { formatDualTime, formatRelativeTime } from '@/lib/format'
import type { Earthquake } from '@/providers/EarthquakeProvider'

export function EarthquakeCard({ quakes }: { quakes: Earthquake[] }) {
  if (quakes.length === 0) return null
  const strongest = quakes[0]

  return (
    <Card className="!p-3 !bg-slate-50 dark:!bg-slate-700/40">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>🌍</span>
        <span className="text-sm font-semibold">
          Erdbeben M {strongest.magnitude.toFixed(1)}
        </span>
        <span className="ml-auto text-[11px] text-slate-400">
          {formatRelativeTime(strongest.timeMs)}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {strongest.place} · ~{strongest.distanceKm} km entfernt · Tiefe {strongest.depth.toFixed(0)} km ·{' '}
        {formatDualTime(strongest.timeMs)}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">
        In der Region registriert — in der Regel keine Gefahr. Mehr Infos:{' '}
        <a
          href="https://www.seismicportal.eu/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zypern-blue hover:underline dark:text-sky-300"
        >
          EMSC ↗
        </a>
      </p>
    </Card>
  )
}
