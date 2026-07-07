// =============================================================================
// openingHours.ts — Regelbasierte „Jetzt offen?"-Logik für Zypern (v0.5 §9).
// KEINE Fake-Präzision — immer „wahrscheinlich" + Maps-Link zum Verifizieren.
//
// Zypern-Regeln (konfigurierbar):
//   - Sonntag: weitgehend zu (nur Touristen-/Apotheken-Notdienst)
//   - Mi + Sa: ab ~14:00 viele Läden zu
//   - Sommer-Siesta kleiner Läden: ca. 13–16 Uhr
//   - Apotheken: Mi + Sa nachmittags + sonntags zu → nur Diensthabende
// =============================================================================
export type PlaceCategory = 'market' | 'pharmacy' | 'restaurant' | 'cafe' | 'shop'

export interface OpeningGuess {
  /** „wahrscheinlich offen" / „wahrscheinlich geschlossen" / „unsicher" */
  state: 'open' | 'closed' | 'uncertain'
  /** Menschlicher Hinweistext */
  label: string
}

/**
 * Schätzt den Öffnungsstatus anhand der Zypern-Regeln.
 * now in Europe/Nicosia (während Reise) oder Europe/Berlin (davor/danach).
 */
export function guessOpen(category: PlaceCategory, now: Date = new Date()): OpeningGuess {
  // Zypern-Zeit (Sommer EEST = UTC+3).
  const cyTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', hour12: false, timeZone: 'Europe/Nicosia', weekday: 'short',
  }).formatToParts(now)
  const hourStr = cyTime.find((p) => p.type === 'hour')?.value ?? '0'
  const weekday = cyTime.find((p) => p.type === 'weekday')?.value ?? ''
  const hour = parseInt(hourStr, 10)

  const day = weekday.toLowerCase() // mon, tue, wed, thu, fri, sat, sun

  // Sonntag: weitgehend zu.
  if (day === 'sun') {
    if (category === 'restaurant' || category === 'cafe') {
      return { state: 'open', label: 'Sonntag: Restaurants/Cafés meist offen' }
    }
    return { state: 'closed', label: 'Sonntag: wahrscheinlich geschlossen' }
  }

  // Apotheken: Mi + Sa nachmittags zu.
  if (category === 'pharmacy' && (day === 'wed' || day === 'sat') && hour >= 14) {
    return { state: 'closed', label: 'Mi/Sa ab 14h: Apotheken zu → Notdienst prüfen' }
  }

  // Sommer-Siesta für kleine Läden/Märkte: ca. 13–16 Uhr.
  if ((category === 'shop' || category === 'market') && hour >= 13 && hour < 16) {
    return { state: 'closed', label: 'Siesta (~13–16h): wahrscheinlich zu' }
  }

  // Mi + Sa ab 14: viele Läden zu.
  if ((category === 'shop' || category === 'market') && (day === 'wed' || day === 'sat') && hour >= 14) {
    return { state: 'closed', label: 'Mi/Sa Nachmittag: viele Läden zu' }
  }

  // Spät abends (nach 21h): fast alles zu außer Restaurants.
  if (hour >= 22 && category !== 'restaurant') {
    return { state: 'closed', label: 'Spät abends: wahrscheinlich zu' }
  }

  // Sehr früh (vor 7): zu.
  if (hour < 7) {
    return { state: 'closed', label: 'Morgens früh: wahrscheinlich noch zu' }
  }

  // Default: wahrscheinlich offen.
  return { state: 'open', label: 'Wahrscheinlich offen — in Maps verifizieren' }
}
