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
 * Google-Maps-Suche ohne expliziten Standort — Maps nutzt automatisch den
 * aktuellen Standort des Geräts. Ideal für „In der Nähe suchen"-Kacheln.
 */
export function mapsSearchHere(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
