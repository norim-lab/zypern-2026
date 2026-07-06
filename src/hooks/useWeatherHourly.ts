// =============================================================================
// useWeatherHourly.ts — Stunden-Wetter + Sonnenzeiten (v0.4).
// Cache 30 min (wie Wetter), Refresh via zentralem Scheduler + manuell.
// =============================================================================
import { useCallback, useEffect, useState } from 'react'
import { hourlyWeatherProvider } from '@/providers'
import type { HourlyWeather } from '@/providers'
import type { LatLng } from '@/lib/geo'
import { WEATHER_TTL, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { useRefreshTask } from './useRefreshTask'

export interface UseWeatherHourlyResult {
  data: HourlyWeather | null
  loading: boolean
  error: string | null
  updatedAt: number | null
  refresh: () => Promise<void>
}

function keyFor(p: LatLng): string {
  return `zyp2026:hourly:${p.lat.toFixed(3)}:${p.lon.toFixed(3)}`
}

export function useWeatherHourly(point: LatLng): UseWeatherHourlyResult {
  const [data, setData] = useState<HourlyWeather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const key = keyFor(point)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const result = await hourlyWeatherProvider.fetch(point)
        setData(result)
        setUpdatedAt(writeCache(key, result))
      } catch (err) {
        const cached = readCache<HourlyWeather>(key)
        if (cached) {
          setData(cached.data)
          setUpdatedAt(cached.timestamp)
          setError('Offline — letzte Daten aus dem Cache.')
        } else {
          setError(err instanceof Error ? err.message : 'Stunden-Wetter nicht ladbar.')
        }
      } finally {
        setLoading(false)
      }
    },
    [point, key],
  )

  useEffect(() => {
    const cached = readCache<HourlyWeather>(key)
    if (cached) {
      setData(cached.data)
      setUpdatedAt(cached.timestamp)
    }
    if (isCacheStale(key, WEATHER_TTL)) void load(true)
  }, [load, key])

  useRefreshTask({
    id: `hourly:${key}`,
    intervalMs: WEATHER_TTL,
    run: () => {
      if (isCacheStale(key, WEATHER_TTL)) void load(true)
    },
  })

  return { data, loading, error, updatedAt, refresh: () => load(false) }
}
