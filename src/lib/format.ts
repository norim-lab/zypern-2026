// =============================================================================
// format.ts — Deutsche Formatierung für Datum, Uhrzeit, Währung und Dauer.
// =============================================================================

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
