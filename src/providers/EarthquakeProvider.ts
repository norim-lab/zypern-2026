// =============================================================================
// EarthquakeProvider.ts — EMSC/SeismicPortal FDSN-API (v0.5 §8).
// Kostenlos, JSON. Liefert Beben ab M ≥ 4,0 im Umkreis ~300 km.
// =============================================================================
import type { LatLng } from '@/lib/geo'
import { haversineKm } from '@/lib/geo'
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
  /** Breitengrad des Epizentrums */
  lat: number
  /** Längengrad des Epizentrums */
  lon: number
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
    // v0.5.1: EMSC hat CORS im Browser — TypeError/Abort abfangen, still []
    // (Erdbeben-Feature ist dezent: bei Fehler einfach nichts zeigen).
    let res: Response
    try {
      res = await fetchWithTimeout(`https://www.seismicportal.eu/fdsnws/event/1/query?${params}`)
    } catch {
      return []
    }
    if (!res.ok) return []
    const raw = await res.json()

    // EMSC JSON: { features: [{ properties: { mag, place, time, depth }, ... }] }
    const features = Array.isArray((raw as { features?: unknown[] }).features) ? (raw as { features: unknown[] }).features : []
    const quakes: Earthquake[] = []
    for (const f of features) {
      if (!isObject(f)) continue
      const props = (f as Record<string, unknown>).properties
      if (!isObject(props)) continue
      // EMSC GeoJSON: geometry.coordinates = [lon, lat, depth]
      const geom = (f as Record<string, unknown>).geometry
      const coords = isObject(geom) ? (geom as Record<string, unknown>).coordinates : null
      const coordArr = Array.isArray(coords) ? coords : null
      const eqLon = coordArr ? asNumber(coordArr[0]) ?? 0 : 0
      const eqLat = coordArr ? asNumber(coordArr[1]) ?? 0 : 0
      const mag = asNumber(props.mag)
      const place = asString(props.flynn_region) ?? asString(props.place) ?? 'Unbekannt'
      const timeStr = asString(props.time) ?? asString(props.updated)
      const depth = asNumber(props.depth) ?? (coordArr ? asNumber(coordArr[2]) ?? 0 : 0)
      if (mag === undefined) continue
      const dist = haversineKm(point, { lat: eqLat, lon: eqLon })
      quakes.push({
        magnitude: mag,
        place,
        timeMs: timeStr ? Date.parse(timeStr) : Date.now(),
        depth: depth / 1000, // EMSC liefert Meter
        lat: eqLat,
        lon: eqLon,
        distanceKm: Math.round(dist),
      })
    }
    return quakes.sort((a, b) => b.magnitude - a.magnitude)
  }
}
