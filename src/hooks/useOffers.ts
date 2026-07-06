// =============================================================================
// useOffers.ts — Angebote/Prospekte (v0.4).
// Stündlich + bei Fokus + manuell. Abgelaufene Angebote → Archiv.
// =============================================================================
import { useCallback, useEffect, useState } from 'react'
import { offersProvider } from '@/providers'
import type { OffersResult } from '@/providers'
import type { OfferItem, OfferSource } from '@/data/types'
import { OFFERS_TTL, CACHE_KEYS, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { useRefreshTask } from './useRefreshTask'
import { useArchive } from './useArchive'
import { offerSources } from '@/data/tripData'

export interface UseOffersResult {
  items: OfferItem[]
  linkSources: OfferSource[]
  loading: boolean
  error: string | null
  updatedAt: number | null
  refresh: () => Promise<void>
}

export function useOffers(): UseOffersResult {
  const [result, setResult] = useState<OffersResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const archive = useArchive()

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const res = await offersProvider.fetch(offerSources)
        setResult(res)
        const ts = writeCache(CACHE_KEYS.offers, res)
        setUpdatedAt(ts)
        // Abgelaufene Angebote archivieren.
        const now = Date.now()
        const expired = res.items
          .filter((i) => i.validUntil && new Date(i.validUntil).getTime() < now)
          .map((i) => ({
            id: `offer-${now}-${i.title}`,
            kind: 'news' as const,
            title: `${i.title} (${i.market})`,
            archivedAt: now,
            payload: i.price,
          }))
        if (expired.length > 0) void archive.addMany(expired)
      } catch (err) {
        const cached = readCache<OffersResult>(CACHE_KEYS.offers)
        if (cached) {
          setResult(cached.data)
          setUpdatedAt(cached.timestamp)
          setError('Offline — letzte Angebote aus dem Cache.')
        } else {
          setError(err instanceof Error ? err.message : 'Angebote nicht ladbar.')
        }
      } finally {
        setLoading(false)
      }
    },
    [archive],
  )

  useEffect(() => {
    const cached = readCache<OffersResult>(CACHE_KEYS.offers)
    if (cached) {
      setResult(cached.data)
      setUpdatedAt(cached.timestamp)
    }
    if (isCacheStale(CACHE_KEYS.offers, OFFERS_TTL)) void load(true)
  }, [load])

  useRefreshTask({
    id: 'offers',
    intervalMs: OFFERS_TTL,
    run: () => {
      if (isCacheStale(CACHE_KEYS.offers, OFFERS_TTL)) void load(true)
    },
  })

  return {
    items: result?.items ?? [],
    linkSources: result?.linkSources ?? [],
    loading,
    error,
    updatedAt,
    refresh: () => load(false),
  }
}
