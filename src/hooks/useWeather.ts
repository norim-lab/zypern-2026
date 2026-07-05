// =============================================================================
// useWeather.ts — Wetterdaten mit Auto-Refresh.
//   - Alle 30 min automatisch aktualisieren.
//   - Bei App-Fokus (visibilitychange) aktualisieren, falls Daten älter als 30 min.
//   - Manueller Refresh via refresh().
//   - Bei Netzfehler: gecachte Daten anzeigen (Offline-Tauglichkeit).
// =============================================================================
import { useCallback, useEffect, useState } from 'react'
import { weatherProvider } from '@/providers'
import type { WeatherData } from '@/providers'
import type { WeatherLocation } from '@/data/types'
import { CACHE_KEYS, WEATHER_TTL, isCacheStale, readCache, writeCache } from '@/lib/cache'

export interface UseWeatherResult {
  data: WeatherData | null
  loading: boolean
  error: string | null
  updatedAt: number | null
  refresh: () => Promise<void>
}

export function useWeather(location: WeatherLocation): UseWeatherResult {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const result = await weatherProvider.fetch(location)
        setData(result)
        const ts = writeCache(CACHE_KEYS.weather, result)
        setUpdatedAt(ts)
      } catch (err) {
        // Netz-/API-Fehler: gecachte Daten als Fallback zeigen.
        const cached = readCache<WeatherData>(CACHE_KEYS.weather)
        if (cached) {
          setData(cached.data)
          setUpdatedAt(cached.timestamp)
          setError('Offline — letzte Daten aus dem Cache.')
        } else {
          setError(err instanceof Error ? err.message : 'Wetter konnte nicht geladen werden.')
        }
      } finally {
        setLoading(false)
      }
    },
    [location],
  )

  // Initiale Ladung: Cache sofort anzeigen, dann aktualisieren.
  useEffect(() => {
    const cached = readCache<WeatherData>(CACHE_KEYS.weather)
    if (cached) {
      setData(cached.data)
      setUpdatedAt(cached.timestamp)
    }
    // Nur neu laden, wenn Cache fehlt oder älter als 30 min.
    if (isCacheStale(CACHE_KEYS.weather, WEATHER_TTL)) {
      void load(true)
    }
  }, [load])

  // Auto-Refresh alle 30 Minuten.
  useEffect(() => {
    const id = setInterval(() => void load(true), WEATHER_TTL)
    return () => clearInterval(id)
  }, [load])

  // Bei App-Fokus aktualisieren (nur falls Daten älter als 30 min).
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && isCacheStale(CACHE_KEYS.weather, WEATHER_TTL)) {
        void load(true)
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [load])

  const refresh = useCallback(async () => {
    await load(false)
  }, [load])

  return { data, loading, error, updatedAt, refresh }
}
