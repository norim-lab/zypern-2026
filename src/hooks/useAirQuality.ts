// useAirQuality.ts — Luftqualität/Saharastaub, stündlich (v0.5 §5).
import { useCallback, useEffect, useState } from 'react'
import { airQualityProvider } from '@/providers'
import type { AirQualityData } from '@/providers/AirQualityProvider'
import { HOURLY_TTL, CACHE_KEYS, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { useRefreshTask } from './useRefreshTask'
import type { LatLng } from '@/lib/geo'

export function useAirQuality(point: LatLng) {
  const [data, setData] = useState<AirQualityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const result = await airQualityProvider.fetch(point)
      setData(result); setUpdatedAt(writeCache(CACHE_KEYS.airQuality, result))
    } catch (err) {
      const cached = readCache<AirQualityData>(CACHE_KEYS.airQuality)
      if (cached) { setData(cached.data); setUpdatedAt(cached.timestamp); setError('Offline — Cache.') }
      else setError(err instanceof Error ? err.message : 'Luftqualität nicht ladbar.')
    } finally { setLoading(false) }
  }, [point.lat, point.lon])

  useEffect(() => {
    const cached = readCache<AirQualityData>(CACHE_KEYS.airQuality)
    if (cached) { setData(cached.data); setUpdatedAt(cached.timestamp) }
    if (isCacheStale(CACHE_KEYS.airQuality, HOURLY_TTL)) void load(true)
  }, [load])

  useRefreshTask({ id: 'air-quality', intervalMs: HOURLY_TTL, run: () => { if (isCacheStale(CACHE_KEYS.airQuality, HOURLY_TTL)) void load(true) } })
  return { data, loading, error, updatedAt, refresh: () => load(false) }
}
