// =============================================================================
// useMarine.ts — Strand-/Meeresdaten mit Auto-Refresh.
//   - Alle 60 min automatisch aktualisieren.
//   - Bei App-Fokus aktualisieren, falls Daten älter als 60 min.
//   - Bei Fehler: gecachte Daten zeigen (Offline-Tauglichkeit).
//
// Cache-Key ist pro Strand (lat/lon), da jeder Strand eigene Bedingungen hat.
// =============================================================================
import { useCallback, useEffect, useState } from 'react'
import { marineProvider } from '@/providers'
import type { BeachConditions } from '@/providers'
import type { LatLng } from '@/lib/geo'
import { MARINE_TTL, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { useRefreshTask } from './useRefreshTask'

export interface UseMarineResult {
  data: BeachConditions | null
  loading: boolean
  error: string | null
  updatedAt: number | null
  refresh: () => Promise<void>
}

function keyFor(point: LatLng): string {
  return `zyp2026:marine:${point.lat.toFixed(3)}:${point.lon.toFixed(3)}`
}

export function useMarine(point: LatLng): UseMarineResult {
  const [data, setData] = useState<BeachConditions | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const key = keyFor(point)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const result = await marineProvider.fetch(point)
        setData(result)
        const ts = writeCache(key, result)
        setUpdatedAt(ts)
      } catch (err) {
        const cached = readCache<BeachConditions>(key)
        if (cached) {
          setData(cached.data)
          setUpdatedAt(cached.timestamp)
          setError('Offline — letzte Daten aus dem Cache.')
        } else {
          setError(err instanceof Error ? err.message : 'Stranddaten konnten nicht geladen werden.')
        }
      } finally {
        setLoading(false)
      }
    },
    // Nur `key` (String) als Dep, nicht `point` (Object) — sonst Endlos-Re-Render,
    // wenn die Aufrufstelle ein inline-Objekt übergibt (neue Identität je Render).
    [key, point.lat, point.lon],
  )

  // Initiale Ladung: Cache sofort zeigen, dann aktualisieren falls stale.
  useEffect(() => {
    const cached = readCache<BeachConditions>(key)
    if (cached) {
      setData(cached.data)
      setUpdatedAt(cached.timestamp)
    }
    if (isCacheStale(key, MARINE_TTL)) void load(true)
  }, [load, key])

  // v0.3: Zentraler RefreshScheduler (stündlich; Fokus/Online übernimmt der Scheduler).
  useRefreshTask({
    id: `marine:${key}`,
    intervalMs: MARINE_TTL,
    run: () => {
      if (isCacheStale(key, MARINE_TTL)) void load(true)
    },
  })

  const refresh = useCallback(async () => {
    await load(false)
  }, [load])

  return { data, loading, error, updatedAt, refresh }
}
