// =============================================================================
// useGeolocation.ts — Standortbestimmung mit Fallback-Kette.
//   1) Live via Geolocation API (nach Zustimmung)
//   2) letzter bekannter Standort aus localStorage
//   3) Damian Home (34.952, 33.590) als statischer Fallback
// =============================================================================
import { useCallback, useEffect, useState } from 'react'
import type { LatLng } from '@/lib/geo'
import type { LocationSource } from '@/data/types'
import { CACHE_KEYS } from '@/lib/cache'

/** Fallback-Konstante: Damian Home. */
export const FALLBACK_LOCATION: LatLng = { lat: 34.952, lon: 33.590 }

export interface UseGeolocationResult {
  /** Aktueller Standort (immer gesetzt dank Fallback). */
  location: LatLng
  /** Quelle des Standorts. */
  source: LocationSource
  /** True solange eine Live-Abfrage läuft. */
  loading: boolean
  /** Manuell neu bestimmen. */
  refresh: () => void
}

function loadCached(): LatLng | null {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.geoLocation)
    return raw ? (JSON.parse(raw) as LatLng) : null
  } catch {
    return null
  }
}

export function useGeolocation(): UseGeolocationResult {
  // Initial: Cache oder Fallback.
  const cached = loadCached()
  const [location, setLocation] = useState<LatLng>(cached ?? FALLBACK_LOCATION)
  const [source, setSource] = useState<LocationSource>(cached ? 'cached' : 'fallback')
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    if (!('geolocation' in navigator)) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: LatLng = { lat: pos.coords.latitude, lon: pos.coords.longitude }
        setLocation(next)
        setSource('live')
        try {
          localStorage.setItem(CACHE_KEYS.geoLocation, JSON.stringify(next))
        } catch {
          // ignore
        }
        setLoading(false)
      },
      () => {
        // Verweigert/Fehler → bei Cache/Fallback bleiben.
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    )
  }, [])

  // Einmalig beim Mount versuchen, live zu bestimmen (ohne Cache sofort zu überschreiben).
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { location, source, loading, refresh }
}
