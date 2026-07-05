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

/** localStorage-Schlüssel (zentral, um Tippfehler zu vermeiden). */
export const CACHE_KEYS = {
  weather: 'zyp2026:weather',
  weatherLocation: 'zyp2026:weather-location',
  flightOutbound: 'zyp2026:flight-outbound',
  flightReturn: 'zyp2026:flight-return',
  flightLastRefresh: 'zyp2026:flight-last-refresh',
} as const
