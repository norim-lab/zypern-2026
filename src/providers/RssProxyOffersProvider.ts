// =============================================================================
// RssProxyOffersProvider.ts — Default-Angebots-Provider.
// Nutzt die zentrale Proxy-Kette. Quellen ohne maschinenlesbares Format erscheinen
// als Link-Kachel (Prospekt öffnen); geparste Angebote nur, falls RSS vorhanden.
// =============================================================================
import type { OffersProvider, OffersResult } from './OffersProvider'
import type { OfferItem, OfferSource } from '@/data/types'
import { fetchViaProxy } from '@/lib/proxyChain'

export class RssProxyOffersProvider implements OffersProvider {
  readonly name = 'RSS-Proxy Angebote'

  async fetch(sources: OfferSource[]): Promise<OffersResult> {
    const rssSources = sources.filter((s) => s.type === 'rss')
    const linkSources = sources.filter((s) => s.type === 'link')

    // Aktuell sind alle Prospekt-Quellen 'link' (HTML-Prospekte, kein RSS).
    // Parsen würde nur greifen, wenn später eine Quelle RSS liefert.
    const items: OfferItem[] = []
    for (const src of rssSources) {
      const xml = await fetchViaProxy(src.srcKey ?? null, src.url)
      if (xml === null) {
        linkSources.push(src)
        continue
      }
      // Einfache Item-Extraktion (Titel); Preise/Daten aus RSS-Prospekten
      // sind selten konsistent — nur grob übernehmen.
      const titles = Array.from(xml.matchAll(/<title>([^<]+)<\/title>/g))
        .map((m) => m[1].trim())
        .filter((t) => t && !t.includes('RSS') && !t.includes('Feed'))
      titles.forEach((title) =>
        items.push({ title, market: src.chain ?? src.name, source: src.name }),
      )
    }

    return { items, linkSources, fetchedAt: Date.now() }
  }
}
