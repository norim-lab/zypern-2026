// =============================================================================
// deepLinks.ts — Zentrale Helper für externe Links (Maps, tel:, mailto:).
// Alle Deep-Links an einem Ort → leicht anpassbar/testbar, kein String-Wildwuchs
// in den Komponenten.
// =============================================================================

/** Google-Maps-Navigation (Routenführung) zu einem Ziel. */
export function mapsDir(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

/** Google-Maps-Suche nach einem Ort (Eintragsanzeige). */
export function mapsSearch(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** tel:-Link ( Telefonanruf ). */
export function tel(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`
}

/** mailto:-Link. */
export function mailto(email: string, subject?: string): string {
  const params = subject ? `?subject=${encodeURIComponent(subject)}` : ''
  return `mailto:${email}${params}`
}

/** Ryanair-App-Öffnen-Link (deeplink auf die Bordkarte). */
export function ryanairApp(): string {
  // Fällt auf die Ryanair-Webseite zurück, wenn die App nicht installiert ist.
  return 'https://www.ryanair.com/de/de/trip/flights'
}

/** Google-Maps-Navigation direkt zu Koordinaten (destination=LAT,LON). */
export function mapsDirLatLon(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
}

/**
 * v0.7: Google-Maps-Navigation mit Start UND Ziel (beides als Text/Adresse).
 * Maps zeigt die Live-Verkehrslage automatisch in der Routenansicht — daher
 * der Button „🚦 Route mit Verkehr in Maps" überall bei Fahrten.
 */
export function mapsDirOriginDest(origin: string, destination: string): string {
  const o = encodeURIComponent(origin)
  const d = encodeURIComponent(destination)
  return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}`
}

/**
 * v0.7: Google-Maps-Navigation ab aktuellem GPS-Standort zu Koordinaten.
 * Maps nutzt den Geräte-Standort als Start; Verkehrslage wird automatisch
 * eingeblendet. Ideal für „Route mit Verkehr"-Buttons bei Ausflügen/Stränden.
 */
export function mapsDirLatLonWithOrigin(lat: number, lon: number): string {
  // Kein origin-Param → Maps nimmt GPS. Verkehrslage ist dann in der App sichtbar.
  // (expliziter travelmode=driving für konsistente Routenführung)
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`
}

/**
 * Google-Maps-Suche ohne expliziten Standort — Maps nutzt automatisch den
 * aktuellen Standort des Geräts. Ideal für „In der Nähe suchen"-Kacheln.
 */
export function mapsSearchHere(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
