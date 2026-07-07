// usePharmacy.ts — Notdienst-Apotheken, stündlich + bei Fokus (v0.5 §3).
import { useCallback, useEffect, useState } from 'react'
import { pharmacyProvider } from '@/providers'
import type { OnDutyPharmacy } from '@/providers/PharmacyProvider'
import { HOURLY_TTL, CACHE_KEYS, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { useRefreshTask } from './useRefreshTask'

export function usePharmacy() {
  const [pharmacies, setPharmacies] = useState<OnDutyPharmacy[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const result = await pharmacyProvider.fetchOnDuty()
      setPharmacies(result)
      setUpdatedAt(writeCache(CACHE_KEYS.pharmacy, result))
    } catch (err) {
      const cached = readCache<OnDutyPharmacy[]>(CACHE_KEYS.pharmacy)
      if (cached) { setPharmacies(cached.data); setUpdatedAt(cached.timestamp); setError('Offline — Cache.') }
      else setError(err instanceof Error ? err.message : 'Apotheken nicht ladbar.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const cached = readCache<OnDutyPharmacy[]>(CACHE_KEYS.pharmacy)
    if (cached) { setPharmacies(cached.data); setUpdatedAt(cached.timestamp) }
    if (isCacheStale(CACHE_KEYS.pharmacy, HOURLY_TTL)) void load(true)
  }, [load])

  useRefreshTask({ id: 'pharmacy', intervalMs: HOURLY_TTL, run: () => { if (isCacheStale(CACHE_KEYS.pharmacy, HOURLY_TTL)) void load(true) } })
  return { pharmacies, loading, error, updatedAt, refresh: () => load(false) }
}
