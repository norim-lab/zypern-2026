// =============================================================================
// useMarineBatch.ts — Alle Strand-Bedingungen in EINEM Batch-Request (v0.3).
//
// Ersetzt im Strände-Tab die 13 einzelnen useMarine-Aufrufe durch einen
// einzigen Batch-Call. Ergebnis wird 60 min gecacht; manueller Refresh möglich.
// Bei Netzfehler: gecachte Daten zeigen (Offline-Tauglichkeit).
// =============================================================================
import { useCallback, useEffect, useState } from 'react'
import { marineProvider } from '@/providers'
import type { BeachConditions } from '@/providers'
import type { LatLng } from '@/lib/geo'
import { MARINE_TTL, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { useRefreshTask } from './useRefreshTask'

export interface UseMarineBatchResult {
  /** Map von „lat,lon" → Conditions. */
  data: Map<string, BeachConditions>
  loading: boolean
  error: string | null
  updatedAt: number | null
  refresh: () => Promise<void>
}

const BATCH_KEY = 'zyp2026:marine-batch'

function pointKey(p: LatLng): string {
  return `${p.lat.toFixed(3)},${p.lon.toFixed(3)}`
}

export function useMarineBatch(points: LatLng[]): UseMarineBatchResult {
  const [data, setData] = useState<Map<string, BeachConditions>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const load = useCallback(
    async (silent = false) => {
      if (points.length === 0) return
      if (!silent) setLoading(true)
      setError(null)
      try {
        const results = await marineProvider.fetchBatch(points)
        const map = new Map<string, BeachConditions>()
        results.forEach((r, i) => map.set(pointKey(points[i]), r))
        setData(map)
        const ts = writeCache(BATCH_KEY, results)
        setUpdatedAt(ts)
      } catch (err) {
        const cached = readCache<BeachConditions[]>(BATCH_KEY)
        if (cached) {
          const map = new Map<string, BeachConditions>()
          cached.data.forEach((r, i) => map.set(pointKey(points[i]), r))
          setData(map)
          setUpdatedAt(cached.timestamp)
          setError('Offline — letzte Daten aus dem Cache.')
        } else {
          setError(err instanceof Error ? err.message : 'Stranddaten konnten nicht geladen werden.')
        }
      } finally {
        setLoading(false)
      }
    },
    // Stabile String-Deps statt Array-Identität — sonst Endlos-Re-Render,
    // weil points (inline erzeugt) bei jedem Render eine neue Identität hat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points.map((p) => `${p.lat},${p.lon}`).join('|')],
  )

  // Initiale Ladung: Cache sofort, dann aktualisieren falls stale.
  useEffect(() => {
    const cached = readCache<BeachConditions[]>(BATCH_KEY)
    if (cached) {
      const map = new Map<string, BeachConditions>()
      cached.data.forEach((r, i) => map.set(pointKey(points[i]), r))
      setData(map)
      setUpdatedAt(cached.timestamp)
    }
    if (isCacheStale(BATCH_KEY, MARINE_TTL)) void load(true)
    // points ist stabil (beaches-Array); bewusst nicht in Deps, sonst Loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  // Zentraler Scheduler: stündlich + bei Fokus/Online (pausiert im Hintergrund).
  useRefreshTask({
    id: 'marine-batch',
    intervalMs: MARINE_TTL,
    run: () => {
      if (isCacheStale(BATCH_KEY, MARINE_TTL)) void load(true)
    },
  })

  const refresh = useCallback(async () => {
    await load(false)
  }, [load])

  return { data, loading, error, updatedAt, refresh }
}
