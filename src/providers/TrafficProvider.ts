// =============================================================================
// TrafficProvider.ts — Austauschbares Interface für Live-Verkehrslage (v0.7).
//
// Ehrlicher Umgang: Es gibt keine kostenlose, verlässliche Live-Verkehrs-API.
// Daher liefert der Standard-Provider (NoopTrafficProvider) absichtlich null —
// KEINE Fake-Verkehrsdaten. Die App zeigt alle Fahrzeit-Schätzungen als
// „ohne Verkehr" und leitet für Live-Verkehr auf Google Maps weiter (dort ist
// die Verkehrslage automatisch sichtbar).
//
// Stub für später: Mit einem Key (z. B. TomTom Traffic API) lässt sich hier
// ein echter Provider einbinden — VITE_TOMTEN_KEY in .env, dann in index.ts
// von NoopTrafficProvider auf z. B. TomTomTrafficProvider umstellen.
// =============================================================================
import type { LatLng } from '@/lib/geo'

/** Ergebnis einer Verkehrslage-Abfrage (alles optional, da nicht jede API
 *  alle Felder liefert; null = „keine Daten"). */
export interface TrafficInfo {
  /** Fahrtdauer mit Verkehr in Minuten (oder null = unbekannt). */
  durationMin: number | null
  /** Strecke in km (oder null). */
  distanceKm: number | null
  /** Verzögerung durch Verkehr in Minuten gegenüber „ohne Verkehr" (oder null). */
  delayMin: number | null
  /** Quelle/API-Name (z. B. „TomTom", „Google"). */
  source: string
}

export interface TrafficProvider {
  readonly name: string
  /**
   * Liefert Live-Verkehrslage für eine Strecke oder null, wenn keine
   * verlässlichen Daten verfügbar sind (KEINE Fake-Daten!).
   */
  fetchRoute(origin: LatLng, destination: LatLng): Promise<TrafficInfo | null>
}
