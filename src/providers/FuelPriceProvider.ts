// =============================================================================
// FuelPriceProvider.ts — Tankpreis-Vergleich (v0.5 §4).
// v0.5.1 Fix #9: nur Link-Kacheln, kein HTML-Parsen mehr (nichts erfinden).
// Provider-Interface für spätere echte Datenquelle beibehalten.
// =============================================================================

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
    // v0.5.1 Fix #9: KEIN HTML-Parsen mehr (JS-gerenderte Seiten liefern
    // unzuverlässige/erfundene Daten). Nur Link-Kacheln — Regel: nichts erfinden.
    const linkSources = [
      { label: 'Retail Fuel Price Observatory (gov.cy)', url: 'https://www.gov.cy/en/service/retail-fuel-price-observatory/' },
      { label: 'cyprusfuelguide.com', url: 'https://cyprusfuelguide.com/' },
    ]
    return { stations: [], linkSources }
  }
}
