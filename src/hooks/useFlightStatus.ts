// =============================================================================
// useFlightStatus.ts — Flugstatus mit Auto-Refresh (nur an Reisetagen).
//   - An Reisetagen alle 5 Minuten aktualisieren (Hinflug 17.07., Rückflug 07.08.).
//   - Sonst einmalig beim Mount, danach keine ständige Netzlast.
//   - Bei Netzfehler: Status aus Cache zeigen (Offline-Tauglichkeit).
// =============================================================================
import { useCallback, useEffect, useState } from 'react'
import { flightStatusProvider } from '@/providers'
import type { FlightStatus } from '@/providers'
import type { Flight } from '@/data/types'
import { CACHE_KEYS, FLIGHT_TTL, readCache, writeCache } from '@/lib/cache'

export interface UseFlightStatusResult {
  status: FlightStatus | null
  loading: boolean
  error: string | null
  updatedAt: number | null
  refresh: () => Promise<void>
}

/** Wahr, wenn der gegebene Tag (lokal) ein Reisetag ist. */
function isTravelDay(iso: string): boolean {
  const target = new Date(iso)
  const today = new Date()
  return (
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate()
  )
}

function cacheKey(flight: Flight): string {
  return flight.flightNumber === 'FR3878' ? CACHE_KEYS.flightOutbound : CACHE_KEYS.flightReturn
}

export function useFlightStatus(flight: Flight): UseFlightStatusResult {
  const [status, setStatus] = useState<FlightStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const key = cacheKey(flight)

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const result = await flightStatusProvider.fetchStatus(flight)
        setStatus(result)
        const ts = writeCache(key, result)
        setUpdatedAt(ts)
      } catch (err) {
        const cached = readCache<FlightStatus>(key)
        if (cached) {
          setStatus(cached.data)
          setUpdatedAt(cached.timestamp)
          setError('Offline — letzte Daten aus dem Cache.')
        } else {
          setError(err instanceof Error ? err.message : 'Flugstatus konnte nicht geladen werden.')
        }
      } finally {
        setLoading(false)
      }
    },
    [flight, key],
  )

  // Initiale Ladung (Cache sofort, sonst laden).
  useEffect(() => {
    const cached = readCache<FlightStatus>(key)
    if (cached) {
      setStatus(cached.data)
      setUpdatedAt(cached.timestamp)
    } else {
      void load(true)
    }
  }, [load, key])

  // 5-Minuten-Refresh nur an Reisetagen.
  useEffect(() => {
    if (!isTravelDay(flight.departureAt)) return
    const id = setInterval(() => void load(true), FLIGHT_TTL)
    return () => clearInterval(id)
  }, [flight.departureAt, load])

  const refresh = useCallback(async () => {
    await load(false)
  }, [load])

  return { status, loading, error, updatedAt, refresh }
}
