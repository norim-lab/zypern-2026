// =============================================================================
// useDistance.ts — Sortiert beliebige Listen mit lat/lon aufsteigend nach
// Entfernung vom aktuellen Standort (Haversine-Luftlinie) und filtert
// Nordzypern-Einträge heraus (harte Regel).
// =============================================================================
import { useMemo } from 'react'
import { estimateDriveMin, filterNorthCyprus, haversineKm } from '@/lib/geo'
import type { LatLng } from '@/lib/geo'

/** Ein Element mit Berechnungs-Anreicherung. */
export interface WithDistance<T> {
  item: T
  /** Luftlinie in km */
  km: number
  /** Geschätzte Fahrzeit in min */
  driveMin: number
}

/**
 * Sortiert Items aufsteigend nach Entfernung ab `origin` und filtert
 * Nordzypern-Einträge heraus. Memoisiert.
 */
export function useDistance<T extends LatLng>(items: T[], origin: LatLng): WithDistance<T>[] {
  return useMemo(() => {
    const safe = filterNorthCyprus(items)
    return safe
      .map((item) => {
        const km = haversineKm(origin, item)
        return { item, km, driveMin: estimateDriveMin(km) }
      })
      .sort((a, b) => a.km - b.km)
  }, [items, origin])
}
