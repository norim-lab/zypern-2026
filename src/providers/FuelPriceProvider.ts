// =============================================================================
// FuelPriceProvider.ts — Tankpreis-Vergleich (v0.5 §4).
// Link-Kacheln + optionales HTML-Parsen (falls Quelle maschinenlesbar).
// =============================================================================
import { fetchViaProxy } from '@/lib/proxyChain'

export interface FuelStation {
  name: string
  price95?: string
  priceDiesel?: string
  lat?: number
  lon?: number
}

export interface FuelPriceProvider {
  readonly name: string
  fetchNearby(): Promise<{ stations: FuelStation[]; linkSources: { label: string; url: string }[] }>
}

export class CyprusFuelPriceProvider implements FuelPriceProvider {
  readonly name = 'Cyprus Fuel Guide'

  async fetchNearby() {
    // cyprusfuelguide.com ist JS-basiert → nur Link-Kacheln, kein Parsen.
    // Echtes Parsen würde eine maschinenlesbare Quelle (gov.cy API) brauchen.
    const linkSources = [
      { label: 'Retail Fuel Price Observatory (gov.cy)', url: 'https://www.gov.cy/fuelprices' },
      { label: 'cyprusfuelguide.com', url: 'https://cyprusfuelguide.com/' },
    ]
    // Versuch, cyprusfuelguide via Proxy zu laden (falls strukturiert).
    const html = await fetchViaProxy('cyprusfuelguide', 'https://cyprusfuelguide.com/')
    const stations: FuelStation[] = []
    if (html) {
      // Preis-Muster: „95: €1.234" oder „1.234 €/L".
      const priceMatches = Array.from(html.matchAll(/(\d\.\d{3})\s*(?:€|EUR)?/g)).slice(0, 3)
      priceMatches.forEach((m) => {
        stations.push({ name: 'Tankstelle (Name in Maps prüfen)', price95: `${m[1]} €` })
      })
    }
    return { stations, linkSources }
  }
}
