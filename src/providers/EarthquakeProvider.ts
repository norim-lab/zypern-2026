// =============================================================================
// EarthquakeProvider.ts — EMSC/SeismicPortal FDSN-API (v0.5 §8).
// Kostenlos, JSON. Liefert Beben ab M ≥ 4,0 im Umkreis ~300 km.
// =============================================================================
import type { LatLng } from '@/lib/geo'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import { asNumber, asString, isObject } from '@/lib/validation'

export interface Earthquake {
  magnitude: number
  /** Ortbeschreibung */
  place: string
  /** Zeitpunkt (ms) */
  timeMs: number
  /** Tiefe in km */
  depth: number
  /** Entfernung vom Referenzpunkt in km */
  distanceKm: number
}

export interface EarthquakeProvider {
  readonly name: string
  fetchNearby(point: LatLng, minMag?: number, maxRadiusDeg?: number): Promise<Earthquake[]>
}

export class EmscEarthquakeProvider implements EarthquakeProvider {
  readonly name = 'EMSC SeismicPortal'

  async fetchNearby(point: LatLng, minMag = 4, maxRadiusDeg = 3): Promise<Earthquake[]> {
    const params = new URLSearchParams({
      format: 'json',
      lat: String(point.lat),
      lon: String(point.lon),
      maxradiusdegree: String(maxRadiusDeg),
      minmagnitude: String(minMag),
    })
    const res = await fetchWithTimeout(`https://www.seismicportal.eu/fdsnws/event/1/query?${params}`)
    if (!res.ok) throw new Error(`EMSC HTTP ${res.status}`)
    const raw = await res.json()

    // EMSC JSON: { features: [{ properties: { mag, place, time, depth }, ... }] }
    const features = Array.isArray((raw as { features?: unknown[] }).features) ? (raw as { features: unknown[] }).features : []
    const quakes: Earthquake[] = []
    for (const f of features) {
      if (!isObject(f)) continue
      const props = (f as Record<string, unknown>).properties
      if (!isObject(props)) continue
      const mag = asNumber(props.mag)
      const place = asString(props.flynn_region) ?? asString(props.place) ?? 'Unbekannt'
      const timeStr = asString(props.time) ?? asString(props.updated)
      const depth = asNumber(props.depth) ?? 0
      if (mag === undefined) continue
      quakes.push({
        magnitude: mag,
        place,
        timeMs: timeStr ? Date.parse(timeStr) : Date.now(),
        depth: depth / 1000, // EMSC liefert Meter
        distanceKm: 0, // wird im Hook via Haversine ergänzt
      })
    }
    return quakes.sort((a, b) => b.magnitude - a.magnitude)
  }
}
