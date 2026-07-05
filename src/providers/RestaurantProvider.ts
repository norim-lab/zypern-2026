// =============================================================================
// RestaurantProvider.ts — Interface für echte Restaurant-Live-Daten (v-später).
//
// v0.2 bewusst NICHT aktiv: Ohne API-Key gibt es keine verlässlichen Live-
// Restaurantdaten. Die App nutzt stattdessen die kuratierte Liste + Maps-
// „In der Nähe suchen"-Buttons. Dieses Interface hält die Stelle frei, damit
// später die Google Places API (mit Key) eingesteckt werden kann:
//   - Öffnungszeiten jetzt geöffnet?
//   - Bewertung / Anzahl Bewertungen
//   - Fotos
//
// Aktivierung später: in providers/index.ts den Provider binden + Key injizieren.
// =============================================================================
import type { LatLng } from '@/lib/geo'

/** Live-Info zu einem Restaurant (zukünftig, via Places API). */
export interface RestaurantInfo {
  name: string
  rating?: number
  userRatingsTotal?: number
  openNow?: boolean
  photoUrl?: string
}

export interface RestaurantProvider {
  readonly name: string
  /** Sucht Restaurants in der Nähe (zukünftige Implementierung). */
  searchNearby(_point: LatLng, _category?: string): Promise<RestaurantInfo[]>
}

/**
 * Stub-Provider: signalisiert, dass keine Live-Daten verfügbar sind.
 * Wirft nicht — das UI nutzt dann automatisch die kuratierte Liste + Maps.
 */
export class NoopRestaurantProvider implements RestaurantProvider {
  readonly name = 'Keine Live-Daten (Stub)'
  async searchNearby(): Promise<RestaurantInfo[]> {
    return []
  }
}
