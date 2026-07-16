// =============================================================================
// useHomeSunTimes.ts — Sonnenzeiten für den Heimatort (Bad Neuenahr) (v0.7).
//
// Holt EINMAL täglich sunrise/sunset via Open-Meteo (nur daily-Params, eigener
// kleiner Request, Europe/Berlin). Cache 60 min (Sonnenzeiten ändern sich am
// Tag nicht). Refresh via zentralem Scheduler + manuell. Liefert null, wenn
// Daten nicht ladbar — Aufrufer zeigen die Zeile dann nicht (nicht erfinden).
//
// Vorbild: useWeatherHourly.ts (Cache-Logik + useRefreshTask).
// =============================================================================
import { useCallback, useEffect, useState } from 'react'
import { OpenMeteoHomeSunProvider } from '@/providers/HomeSunTimesProvider'
import type { HomeSunTimes } from '@/providers/HomeSunTimesProvider'
import { HOME_SUN_TTL, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { useRefreshTask } from './useRefreshTask'
import { homeLocation } from '@/data/tripData'

const KEY = 'zyp2026:home-suntimes'
const provider = new OpenMeteoHomeSunProvider()

export interface UseHomeSunTimesResult {
  data: HomeSunTimes | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useHomeSunTimes(): UseHomeSunTimesResult {
  const [data, setData] = useState<HomeSunTimes | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const result = await provider.fetch(homeLocation)
      if (result) {
        setData(result)
        writeCache(KEY, result)
      } else {
        setError('Sonnenzeiten nicht verfügbar.')
      }
    } catch (err) {
      const cached = readCache<HomeSunTimes>(KEY)
      if (cached) {
        setData(cached.data)
        setError('Offline — letzte Sonnenzeiten aus dem Cache.')
      } else {
        setError(err instanceof Error ? err.message : 'Sonnenzeiten nicht ladbar.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = readCache<HomeSunTimes>(KEY)
    if (cached) setData(cached.data)
    if (isCacheStale(KEY, HOME_SUN_TTL)) void load(true)
  }, [load])

  useRefreshTask({
    id: 'home-suntimes',
    intervalMs: HOME_SUN_TTL,
    run: () => {
      if (isCacheStale(KEY, HOME_SUN_TTL)) void load(true)
    },
  })

  return { data, loading, error, refresh: () => load(false) }
}
