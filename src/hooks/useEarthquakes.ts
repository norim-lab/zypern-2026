// useEarthquakes.ts — Erdbeben-Info (dezent), stündlich (v0.5 §8).
// Nur anzeigen, wenn M ≥ 4 in letzten 24 h im Umkreis.
import { useCallback, useEffect, useState } from 'react'
import { earthquakeProvider } from '@/providers'
import type { Earthquake } from '@/providers/EarthquakeProvider'
import { HOURLY_TTL, CACHE_KEYS, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { useRefreshTask } from './useRefreshTask'
import { haversineKm } from '@/lib/geo'
import type { LatLng } from '@/lib/geo'

export function useEarthquakes(point: LatLng) {
  const [quakes, setQuakes] = useState<Earthquake[]>([])
  const [loading, setLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const result = await earthquakeProvider.fetchNearby(point, 4, 3)
      // Entfernung ergänzen + nur letzte 24 h.
      const now = Date.now()
      const recent = result
        .map((q) => ({ ...q, distanceKm: haversineKm(point, { lat: point.lat, lon: point.lon }) }))
        .filter((q) => now - q.timeMs < 24 * 3600_000)
      setQuakes(recent); setUpdatedAt(writeCache(CACHE_KEYS.earthquakes, recent))
    } catch { /* dezent: bei Fehler nichts anzeigen */ }
    finally { setLoading(false) }
  }, [point.lat, point.lon])

  useEffect(() => {
    const cached = readCache<Earthquake[]>(CACHE_KEYS.earthquakes)
    if (cached) { setQuakes(cached.data); setUpdatedAt(cached.timestamp) }
    if (isCacheStale(CACHE_KEYS.earthquakes, HOURLY_TTL)) void load(true)
  }, [load])

  useRefreshTask({ id: 'earthquakes', intervalMs: HOURLY_TTL, run: () => { if (isCacheStale(CACHE_KEYS.earthquakes, HOURLY_TTL)) void load(true) } })
  return { quakes, loading, updatedAt, refresh: () => load(false) }
}
