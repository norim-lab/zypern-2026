// Beaches.tsx — Strände mit Distanzsortierung + Filter + HeatBanner.
// v0.3: Wasserdaten für ALLE Strände in EINEM Batch-Request (useMarineBatch).
import { useContext, useState } from 'react'
import { BeachCard } from '@/components/discover/BeachCard'
import { HeatBanner } from '@/components/discover/HeatBanner'
import { FilterChips } from '@/components/ui/FilterChips'
import { RefreshBar } from '@/components/layout/RefreshBar'
import { useDistance } from '@/hooks/useDistance'
import { useWeather } from '@/hooks/useWeather'
import { useMarineBatch } from '@/hooks/useMarineBatch'
import { beaches, weatherLocations } from '@/data/tripData'
import type { BeachTag } from '@/data/types'
import { GeolocationContext } from './geolocationContext'

const ALL_TAGS: readonly BeachTag[] = ['flach', 'ruhig', 'rettungsschwimmer', 'tavernen', 'wc', 'sandstrand', 'flugspotting']

export function Beaches() {
  const geo = useContext(GeolocationContext)!
  const sorted = useDistance(beaches, geo.location)
  const [selected, setSelected] = useState<BeachTag[]>([])
  const { data: weather } = useWeather(weatherLocations[0])

  // v0.3: ein Batch für alle Strände.
  const points = beaches.map((b) => ({ lat: b.lat, lon: b.lon }))
  const { data: conditions, loading, error, updatedAt, refresh } = useMarineBatch(points)

  // Filter anwenden.
  const visible = selected.length === 0 ? sorted : sorted.filter((b) => selected.every((t) => b.item.tags.includes(t)))

  function toggle(opt: BeachTag) {
    setSelected((prev) => (prev.includes(opt) ? prev.filter((t) => t !== opt) : [...prev, opt]))
  }

  // Lookup-Hilfsfunktion: Conditions für einen Strand aus der Batch-Map.
  function condsFor(lat: number, lon: number) {
    return conditions.get(`${lat.toFixed(3)},${lon.toFixed(3)}`)
  }

  return (
    <div className="space-y-3">
      {/* HeatBanner: stündlich aktualisiertes Wetter des Hauptstandorts. */}
      {weather?.daily[0] && (
        <HeatBanner tempMax={weather.daily[0].tempMax} uvIndexMax={weather.daily[0].uvIndexMax} />
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {visible.length} Strände · sortiert nach Entfernung · Wasserdaten in einem Batch.
      </p>

      <FilterChips options={ALL_TAGS} selected={selected} onToggle={toggle} />

      <div className="space-y-3">
        {visible.map((b) => (
          <BeachCard
            key={b.item.id}
            beach={b}
            conditions={condsFor(b.item.lat, b.item.lon)}
            loading={loading}
          />
        ))}
      </div>

      <RefreshBar updatedAt={updatedAt} loading={loading} error={error} onRefresh={refresh} label="Wasserdaten" />
    </div>
  )
}
