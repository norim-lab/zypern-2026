// LocationChip.tsx — Standort-Chip: „Sortiert ab: [Standort] · 📍 neu bestimmen".
import type { LatLng } from '@/lib/geo'
import type { LocationSource } from '@/data/types'

export interface LocationChipProps {
  location: LatLng
  source: LocationSource
  loading: boolean
  onRefresh: () => void
}

const SOURCE_LABEL: Record<LocationSource, string> = {
  live: 'Live-Standort',
  cached: 'letzter Standort',
  fallback: 'Damian Home (Fallback)',
}

export function LocationChip({ location, source, loading, onRefresh }: LocationChipProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 rounded-card bg-zypern-blue-light p-2 text-xs dark:bg-slate-700/60">
      <div className="min-w-0">
        <p className="truncate font-medium text-zypern-blue-dark dark:text-sky-200">
          📍 Sortiert ab: {SOURCE_LABEL[source]}
        </p>
        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
          {location.lat.toFixed(3)}, {location.lon.toFixed(3)} · nach Entfernung
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="touch-target shrink-0 rounded-full bg-white px-3 text-zypern-blue-dark hover:bg-sky-50 disabled:opacity-50 dark:bg-slate-600 dark:text-sky-200"
      >
        {loading ? '⏳' : '📍 Neu'}
      </button>
    </div>
  )
}
