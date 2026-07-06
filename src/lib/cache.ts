// =============================================================================
// cache.ts — Dünne Hülle um localStorage für Wetter-/Flugdaten + Zeitstempel.
// Hält die App offline nutzbar: zuletzt geladene Daten bleiben beim Reload
// erhalten, auch ohne Netz (Buchungsdaten sind ohnehin statisch).
// =============================================================================

interface CacheEntry<T> {
  data: T
  timestamp: number
}

/** Schreibt einen Wert mit aktuellem Zeitstempel in den localStorage. */
export function writeCache<T>(key: string, data: T): number {
  const timestamp = Date.now()
  const entry: CacheEntry<T> = { data, timestamp }
  try {
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Privatgerät: ignorieren, falls Speicher voll/quatitativ begrenzt.
  }
  return timestamp
}

/** Liest einen gecachten Wert inkl. Zeitstempel; null bei Fehlen/Fehler. */
export function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry<T>
  } catch {
    return null
  }
}

/** Wahr, wenn der Wert älter als `maxAgeMs` ist (oder fehlt). */
export function isCacheStale(key: string, maxAgeMs: number): boolean {
  const entry = readCache(key)
  if (!entry) return true
  return Date.now() - entry.timestamp > maxAgeMs
}

/** 30 Minuten (Wetter-Intervall). */
export const WEATHER_TTL = 30 * 60 * 1000
/** 5 Minuten (Flugstatus an Reisetagen). */
export const FLIGHT_TTL = 5 * 60 * 1000
/** 60 Minuten — Marine-/News-/Events-Intervall (v0.2 „Entdecken"). */
export const HOURLY_TTL = 60 * 60 * 1000
// Aliase für semantische Klarheit in den neuen Hooks.
export const MARINE_TTL = HOURLY_TTL
export const NEWS_TTL = HOURLY_TTL
export const EVENTS_TTL = HOURLY_TTL

/** localStorage-Schlüssel (zentral, um Tippfehler zu vermeiden). */
export const CACHE_KEYS = {
  weather: 'zyp2026:weather',
  weatherLocation: 'zyp2026:weather-location',
  flightOutbound: 'zyp2026:flight-outbound',
  flightReturn: 'zyp2026:flight-return',
  flightLastRefresh: 'zyp2026:flight-last-refresh',
  // v0.2 „Entdecken"
  marine: 'zyp2026:marine',
  news: 'zyp2026:news',
  events: 'zyp2026:events',
  geoLocation: 'zyp2026:geo-location',
  // v0.4
  offers: 'zyp2026:offers',
  hourly: 'zyp2026:hourly',
} as const

/** 60 min für Angebote (v0.4). */
export const OFFERS_TTL = HOURLY_TTL
