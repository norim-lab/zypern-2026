// =============================================================================
// ics.ts — ICS-Datei-Generator („Zum Kalender hinzufügen").
// Zuverlässiger als Web-Push (auf iOS-PWAs eingeschränkt). Lädt eine .ics-Datei
// herunter, die in jede Kalender-App (Apple, Google, Outlook) importiert werden kann.
// =============================================================================
import type { ManualEvent } from '@/data/types'

/** Erzeugt eine ICS-Zeichenkette für ein einzelnes Event (ganztägig). */
export function eventToIcs(ev: ManualEvent): string {
  const uid = `${ev.id}@zypern2026`
  // Ganztägiges Event: DTSTART/DTEND als DATE (ohne Uhrzeit), END = Tag danach.
  const start = ev.date.replace(/-/g, '')
  const endDate = new Date(ev.date)
  endDate.setDate(endDate.getDate() + 1)
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, '')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zypern2026//DE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeIcs(ev.title)}`,
  ]
  if (ev.locationName) lines.push(`LOCATION:${escapeIcs(ev.locationName)}`)
  if (ev.note) lines.push(`DESCRIPTION:${escapeIcs(ev.note)}`)
  if (ev.url) lines.push(`URL:${ev.url}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

/** Löst einen Download der .ics-Datei im Browser aus. */
export function downloadIcs(ev: ManualEvent): void {
  const ics = eventToIcs(ev)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${ev.id}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Maskiert ICS-Sonderzeichen (Komma, Semikolon, Zeilenumbruch). */
function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
