// =============================================================================
// timezone.ts — Zeitzonen-Utilities (Asia/Nicosia ↔ Europe/Berlin).
// v0.4: saubere Umrechnung über Intl.DateTimeFormat (sommerzeit-sicher, NICHT
// hart kodiert — Zypern ist im Sommer DE +1 h, im Winter gleich).
// =============================================================================

/** IANA-Zeitzone. */
export type Timezone = 'Europe/Nicosia' | 'Europe/Berlin'

export const CY_TZ: Timezone = 'Europe/Nicosia'
export const DE_TZ: Timezone = 'Europe/Berlin'

/**
 * Liefert die aktuell relevante Reise-Zeitzone anhand der Reisedaten.
 * Während der Reise (17.07.–07.08.2026) → Europe/Nicosia, sonst Europe/Berlin.
 */
export function currentTripTimezone(now: Date = new Date()): Timezone {
  const tripStart = new Date('2026-07-17T00:00:00+03:00').getTime()
  const tripEnd = new Date('2026-08-08T00:00:00+03:00').getTime()
  const t = now.getTime()
  return t >= tripStart && t <= tripEnd ? CY_TZ : DE_TZ
}

/** Wahr, wenn „jetzt" innerhalb des Reisezeitraums liegt. */
export function isDuringTrip(now: Date = new Date()): boolean {
  return currentTripTimezone(now) === CY_TZ
}

/**
 * Formatiert einen Zeitpunkt in einer bestimmten Zeitzone als „HH:MM" (24h).
 * Sommerzeit-sicher via Intl.DateTimeFormat.
 */
export function timeInZone(ms: number, tz: Timezone): string {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  }).format(new Date(ms))
}

/**
 * Formatiert Datum + Uhrzeit in einer bestimmten Zeitzone.
 * z. B. „Fr, 17.07.2026, 19:45" in Europe/Nicosia.
 */
export function dateTimeInZone(ms: number, tz: Timezone): string {
  const date = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: tz,
  }).format(new Date(ms))
  return `${date}, ${timeInZone(ms, tz)}`
}
