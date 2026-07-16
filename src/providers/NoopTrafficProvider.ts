// =============================================================================
// NoopTrafficProvider.ts — Standard-Verkehrslage-Provider: KEINE Daten (v0.7).
//
// Ehrlicher Stub: Da es keine kostenlose, verlässliche Live-Verkehrs-API gibt,
// liefert dieser Provider absichtlich IMMER null. Die App zeigt alle Fahrzeiten
// als „ohne Verkehr" und leitet für Live-Verkehr auf Google Maps weiter.
//
// Austauschbar: Mit einem API-Key (z. B. VITE_TOMTEN_KEY) kann hier ein echter
// Provider angebunden werden — das Interface in TrafficProvider.ts bleibt gleich.
// =============================================================================
import type { TrafficInfo, TrafficProvider } from './TrafficProvider'
import type { LatLng } from '@/lib/geo'

export class NoopTrafficProvider implements TrafficProvider {
  readonly name = 'Keine Live-Verkehrslage (Maps-Weiterleitung)'

  // Parameter bewusst ungenutzt: dieser Provider liefert absichtlich keine
  // Daten. Unterstrich-Prefix signalisiert TypeScript (noUnusedParameters),
  // dass die Parameter bewusst ignoriert werden.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchRoute(_origin: LatLng, _destination: LatLng): Promise<TrafficInfo | null> {
    // Bewusst null — keine Fake-Daten. Siehe Klassen-Dokumentation.
    return null
  }
}
