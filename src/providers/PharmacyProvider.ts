// =============================================================================
// PharmacyProvider.ts — Notdienst-Apotheken (v0.5 §3).
// Lädt cyprus.ondutypharmacy.com/larnaca/ über die Proxy-Kette und parst HTML.
// Fallback: Link-Kacheln zu farmakeia.com.cy / cynightmeds.com.
// =============================================================================
import { fetchViaProxy } from '@/lib/proxyChain'

export interface OnDutyPharmacy {
  name: string
  address?: string
  phone?: string
  date?: string
}

export interface PharmacyProvider {
  readonly name: string
  fetchOnDuty(): Promise<OnDutyPharmacy[]>
}

export class CyprusOnDutyPharmacyProvider implements PharmacyProvider {
  readonly name = 'cyprus.ondutypharmacy.com'

  async fetchOnDuty(): Promise<OnDutyPharmacy[]> {
    const html = await fetchViaProxy('onduty-larnaca', 'https://cyprus.ondutypharmacy.com/larnaca/')
    if (html === null) return []

    // Sehr robuste Heuristik: Telefonnummern (+357 ...) extrahieren + Umfeld.
    const phoneMatches = Array.from(html.matchAll(/\+?357[\s\-]?\d{2}[\s\-]?\d{5}/g))
    const pharmacies: OnDutyPharmacy[] = []
    for (const m of phoneMatches.slice(0, 5)) {
      const phone = m[0]
      // Name steht oft im HTML-Kontext vorher.
      const start = Math.max(0, m.index! - 200)
      const ctx = html.slice(start, m.index).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const nameMatch = ctx.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s*$/)
      pharmacies.push({
        name: nameMatch ? nameMatch[1] : 'Apotheke (Name in Maps prüfen)',
        phone,
      })
    }
    return pharmacies
  }
}
