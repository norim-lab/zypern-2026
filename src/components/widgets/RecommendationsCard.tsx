// RecommendationsCard.tsx — „Was machen wir heute?" (v0.5 §10).
// Nutzt recommendations.ts (reine Logik) + zeigt 3 Vorschläge als Karten.
import { Card } from '@/components/ui/Card'
import { recommend } from '@/lib/recommendations'
import { useWeather } from '@/hooks/useWeather'
import { useWeatherHourly } from '@/hooks/useWeatherHourly'
import { useEvents } from '@/hooks/useEvents'
import { useMarineBatch } from '@/hooks/useMarineBatch'
import { beaches, accommodation, weatherLocations } from '@/data/tripData'
import type { ManualEvent } from '@/data/types'

export function RecommendationsCard() {
  const { data: weather } = useWeather(weatherLocations[0])
  const { data: hourlyData } = useWeatherHourly({ lat: accommodation.lat, lon: accommodation.lon })
  const { upcoming } = useEvents()
  const points = beaches.map((b) => ({ lat: b.lat, lon: b.lon }))
  const { data: marineData } = useMarineBatch(points)

  // Strände mit Marine-Daten anreichern (für Wellen/Wind-Logik).
  const beachInput = beaches.map((b) => {
    const conds = marineData.get(`${b.lat.toFixed(3)},${b.lon.toFixed(3)}`)
    return {
      beach: { item: b, km: 0, driveMin: 0 }, // km/driveMin hier vereinfacht
      waveHeight: conds?.waveHeight,
      windSpeed: conds?.windSpeed,
    }
  })

  const recs = recommend({
    hourly: hourlyData?.hourly ?? [],
    tempMax: weather?.daily[0]?.tempMax,
    beaches: beachInput,
    events: upcoming.filter((e): e is ManualEvent => 'date' in e),
  })

  if (recs.length === 0) return null

  return (
    <Card title="Was machen wir heute?" icon="🤔">
      <ul className="space-y-2">
        {recs.map((r, i) => (
          <li key={i} className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700/40">
            <div className="flex items-start gap-2">
              <span className="text-lg" aria-hidden>{r.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{r.detail}</p>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs font-medium text-zypern-blue hover:underline dark:text-sky-300"
                  >
                    Navigation ↗
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
