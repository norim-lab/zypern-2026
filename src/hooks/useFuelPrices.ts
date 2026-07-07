// useFuelPrices.ts — Tankpreise, stündlich (v0.5 §4).
import { useCallback, useEffect, useState } from 'react'
import { fuelPriceProvider } from '@/providers'
import type { FuelStation } from '@/providers/FuelPriceProvider'
import { HOURLY_TTL, CACHE_KEYS, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { useRefreshTask } from './useRefreshTask'

export function useFuelPrices() {
  const [stations, setStations] = useState<FuelStation[]>([])
  const [linkSources, setLinkSources] = useState<{ label: string; url: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const result = await fuelPriceProvider.fetchNearby()
      setStations(result.stations); setLinkSources(result.linkSources)
      setUpdatedAt(writeCache(CACHE_KEYS.fuel, result))
    } catch {
      const cached = readCache<{ stations: FuelStation[]; linkSources: { label: string; url: string }[] }>(CACHE_KEYS.fuel)
      if (cached) { setStations(cached.data.stations); setLinkSources(cached.data.linkSources); setUpdatedAt(cached.timestamp) }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const cached = readCache<{ stations: FuelStation[]; linkSources: { label: string; url: string }[] }>(CACHE_KEYS.fuel)
    if (cached) { setStations(cached.data.stations); setLinkSources(cached.data.linkSources); setUpdatedAt(cached.timestamp) }
    if (isCacheStale(CACHE_KEYS.fuel, HOURLY_TTL)) void load(true)
  }, [load])

  useRefreshTask({ id: 'fuel', intervalMs: HOURLY_TTL, run: () => { if (isCacheStale(CACHE_KEYS.fuel, HOURLY_TTL)) void load(true) } })
  return { stations, linkSources, loading, updatedAt, refresh: () => load(false) }
}
