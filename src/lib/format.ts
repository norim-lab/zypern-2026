// =============================================================================
// format.ts — Deutsche Formatierung für Datum, Uhrzeit, Währung und Dauer.
// =============================================================================
import { CY_TZ, DE_TZ, timeInZone } from './timezone'

const deLocale = 'de-DE'

/** Uhrzeit „HH:MM" aus ISO-String. */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(deLocale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Datum „Fr, 17.07.2026" aus ISO-String. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(deLocale, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Kombiniert Datum + Uhrzeit „Fr, 17.07.2026, 13:35". */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`
}

/** Währung „476,47 €". */
export function formatEur(amount: number): string {
  return amount.toLocaleString(deLocale, {
    style: 'currency',
    currency: 'EUR',
  })
}

/** Dauer aus Minuten: „3 h 55 min" / „4 Std. 20 min". */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h <= 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

/** „Zuletzt aktualisiert: HH:MM" aus einem Zeitstempel (ms). */
export function formatUpdatedAt(timestamp: number | null): string {
  if (!timestamp) return 'Zuletzt aktualisiert: —'
  const time = new Date(timestamp).toLocaleTimeString(deLocale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `Zuletzt aktualisiert: ${time}`
}

/** Relative Zeit „vor 2 h" / „vor 3 Tagen" (für News/Events). */
export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'gerade eben'
  if (diffMin < 60) return `vor ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `vor ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'gestern'
  return `vor ${diffD} Tagen`
}

/** Sonnenuntergang aus ISO (z. B. „20:14") mit Emoji. */
export function formatSunset(iso: string): string {
  const time = new Date(iso).toLocaleTimeString(deLocale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `🌇 ${time} Uhr`
}

/** Km mit einer Nachkommastache DE-formatiert („12,3 km"). */
export function formatKm(km: number): string {
  return `${km.toLocaleString(deLocale, { maximumFractionDigits: 1 })} km`
}

// v0.4 — Doppelte Zeitanzeige (Zypern groß + DE klein daneben) -------------
// Sommerzeit-sicher über Intl.DateTimeFormat (keine hartkodierte +1 h).

/** Zeit „HH:MM" in Europe/Nicosia aus einem ms-Zeitpunkt. */
export function timeCy(ms: number): string {
  return timeInZone(ms, CY_TZ)
}

/**
 * Doppelte Uhrzeit aus einem ms-Zeitpunkt:
 * „19:45 (18:45 DE)" — Zypern groß, deutsche Zeit klein daneben.
 */
export function formatDualTime(ms: number): string {
  const cy = timeInZone(ms, CY_TZ)
  const de = timeInZone(ms, DE_TZ)
  return `${cy} (${de} DE)`
}

/** Sonne-Auf-/Untergang paar als „↑05:45 · ↓20:14" (jeweils mit DE-Klammer). */
export function formatSunriseSunset(sunriseMs: number, sunsetMs: number): { rise: string; set: string } {
  return {
    rise: `↑ ${formatDualTime(sunriseMs)}`,
    set: `↓ ${formatDualTime(sunsetMs)}`,
  }
}
