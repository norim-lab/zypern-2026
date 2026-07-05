// =============================================================================
// geo.ts — Geodäten, Fahrzeit-Schätzung und Nordzypern-Guard.
// HARTE REGEL: Nordzypern wird NICHT bereist. Die Guard filtert Koordinaten
// nördlich der Demarkationslinie konservativ heraus (Defensiv-Check, falls
// später externe Quellen Einträge injizieren).
// =============================================================================

export interface LatLng {
  lat: number
  lon: number
}

const EARTH_RADIUS_KM = 6371

/** Haversine-Luftlinie zwischen zwei Punkten in km. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Faustregel-Fahrzeit in Minuten (1 km ≈ 1,2 min Überland).
 * Wie in der Aufgabe spezifiziert.
 */
export function estimateDriveMin(km: number): number {
  return Math.round(km * 1.2)
}

/**
 * Nordzypern-Guard. Die Demarkationslinie („Green Line") verläuft grob nordwest-
 * südöstlich über Zypern. Konservative Heuristik: alles nördlich von 35.15° N
 * im Bereich östlich von 32.9° (also im östlichen / nordöstlichen Teil der Insel)
 * gilt als potentiell nordzyprisch und wird ausgefiltert.
 *
 * Diese Heuristik ist bewusst grob-fehlertolerant (lieber einen合法 südlichen
 * Ort ausschließen als einen nordzyprischen durchlassen). Seed-Daten liegen
 * ohnehin sicher südlich.
 */
export function isInNorthCyprus(lat: number, lon: number): boolean {
  // Paphos / Troodos / Limassol (westlich) sind immer südlich, unabhängig vom Breitengrad.
  if (lon <= 32.9) return false
  // Östlich von 32.9°: nördlich von 35.15° N = potentiell Nordzypern.
  return lat >= 35.15
}

/** Filtert alle Einträge heraus, die in Nordzypern liegen. */
export function filterNorthCyprus<T extends LatLng>(items: T[]): T[] {
  return items.filter((i) => !isInNorthCyprus(i.lat, i.lon))
}
