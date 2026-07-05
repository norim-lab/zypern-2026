// =============================================================================
// timezone.ts — Reise-Zeitzone aus den Reisedaten ableiten (nicht hart kodiert).
// Während der Reise (17.07.–07.08.2026) → Europe/Nicosia, sonst Europe/Berlin.
// =============================================================================

/** IANA-Zeitzone. */
export type Timezone = 'Europe/Nicosia' | 'Europe/Berlin'

/**
 * Liefert die aktuell relevante Zeitzone anhand der Reisedaten.
 * Genutzt für die konsistente Anzeige von Zeiten (z. B. Sonnenuntergang).
 */
export function currentTripTimezone(now: Date = new Date()): Timezone {
  const tripStart = new Date('2026-07-17T00:00:00+03:00').getTime()
  const tripEnd = new Date('2026-08-08T00:00:00+03:00').getTime()
  const t = now.getTime()
  return t >= tripStart && t <= tripEnd ? 'Europe/Nicosia' : 'Europe/Berlin'
}

/** Wahr, wenn „jetzt" innerhalb des Reisezeitraums liegt. */
export function isDuringTrip(now: Date = new Date()): boolean {
  return currentTripTimezone(now) === 'Europe/Nicosia'
}
