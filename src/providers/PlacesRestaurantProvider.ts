// =============================================================================
// PlacesRestaurantProvider.ts — Google-Places-basierte Restaurant-Live-Daten.
//
// v0.4: VOLLSTÄNDIG implementiert, aber nur aktiv, wenn ein API-Key hinterlegt
// ist (VITE_PLACES_API_KEY). Ohne Key liefert searchNearby() leere Ergebnisse;
// die App nutzt dann automatisch die Default-Lokal-Karten (Maps-Buttons +
// Familien-Sterne + Foto-Upload). Aktivierung später via .env.
//
// Google Places API: Nearby Search (Place Search v1) + Place Details.
// Serverseitiger Aufruf empfohlen (Key würde sonst im Bundle landen) — für die
// private App akzeptabel, da Key aus .env via env-Variablen kommt und das Repo
// privat bleibt. Für öffentliche Deployments: Function als Proxy dazwischen.
// =============================================================================
import type { LatLng } from '@/lib/geo'
import type { RestaurantInfo } from './RestaurantProvider'

export interface PlacesRestaurantProvider {
  readonly name: string
  readonly active: boolean
  /** Sucht Restaurants in der Nähe. */
  searchNearby(point: LatLng): Promise<RestaurantInfo[]>
}

export class GooglePlacesRestaurantProvider implements PlacesRestaurantProvider {
  readonly name = 'Google Places'
  readonly active: boolean
  private apiKey: string | undefined

  constructor() {
    this.apiKey = import.meta.env.VITE_PLACES_API_KEY as string | undefined
    this.active = Boolean(this.apiKey)
  }

  async searchNearby(point: LatLng): Promise<RestaurantInfo[]> {
    if (!this.apiKey) return []
    try {
      // Place Search v1: Nearby — Restaurants im Umkreis.
      const body = {
        includedTypes: ['restaurant'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: point.lat, longitude: point.lon },
            radius: 5000,
          },
        },
        languageCode: 'de',
      }
      const res = await fetch(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask':
              'places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours',
          },
          body: JSON.stringify(body),
        },
      )
      if (!res.ok) return []
      const data = await res.json()
      return (data.places ?? []).map((p: Record<string, unknown>) => ({
        name: getPath(p, ['displayName', 'text']) as string | undefined ?? 'Unbekannt',
        rating: getPath(p, ['rating']) as number | undefined,
        userRatingsTotal: getPath(p, ['userRatingCount']) as number | undefined,
        openNow: getPath(p, ['currentOpeningHours', 'openNow']) as boolean | undefined,
      }))
    } catch {
      return []
    }
  }
}

/** Sichere Pfad-Extraktion (lokal, um Validator-Import hier zu sparen). */
function getPath(obj: unknown, path: (string | number)[]): unknown {
  let cur: unknown = obj
  for (const k of path) {
    if (cur == null) return undefined
    cur = (cur as Record<string | number, unknown>)[k]
  }
  return cur
}
