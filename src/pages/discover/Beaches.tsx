// Beaches.tsx — Strände mit Distanzsortierung + Filter + HeatBanner.
import { useContext, useState } from 'react'
import { BeachCard } from '@/components/discover/BeachCard'
import { HeatBanner } from '@/components/discover/HeatBanner'
import { FilterChips } from '@/components/ui/FilterChips'
import { useDistance } from '@/hooks/useDistance'
import { useWeather } from '@/hooks/useWeather'
import { beaches } from '@/data/tripData'
import { weatherLocations } from '@/data/tripData'
import type { BeachTag } from '@/data/types'
import { GeolocationContext } from './geolocationContext'

const ALL_TAGS: readonly BeachTag[] = ['flach', 'ruhig', 'rettungsschwimmer', 'tavernen', 'wc', 'sandstrand', 'flugspotting']

export function Beaches() {
  const geo = useContext(GeolocationContext)!
  const sorted = useDistance(beaches, geo.location)
  const [selected, setSelected] = useState<BeachTag[]>([])
  const { data: weather } = useWeather(weatherLocations[0])

  // Filter anwenden.
  const visible = selected.length === 0 ? sorted : sorted.filter((b) => selected.every((t) => b.item.tags.includes(t)))

  function toggle(opt: BeachTag) {
    setSelected((prev) => (prev.includes(opt) ? prev.filter((t) => t !== opt) : [...prev, opt]))
  }

  return (
    <div className="space-y-3">
      {/* HeatBanner: stündlich aktualisiertes Wetter des Hauptstandorts. */}
      {weather?.daily[0] && (
        <HeatBanner tempMax={weather.daily[0].tempMax} uvIndexMax={weather.daily[0].uvIndexMax} />
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {visible.length} Strände · sortiert nach Entfernung von deinem Standort.
      </p>

      <FilterChips options={ALL_TAGS} selected={selected} onToggle={toggle} />

      <div className="space-y-3">
        {visible.map((b) => (
          <BeachCard key={b.item.id} beach={b} />
        ))}
      </div>
    </div>
  )
}
