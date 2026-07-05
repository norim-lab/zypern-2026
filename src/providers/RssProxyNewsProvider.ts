// =============================================================================
// RssProxyNewsProvider.ts — Default-News-Provider via öffentlichem CORS-Proxy.
//
// CORS-Realität: Direkte Browser-Fetches auf RSS-Feeds scheitern meist an CORS.
// Daher nutzt dieser Provider allorigins.win als austauschbaren Proxy-Wrapper.
// Das Provider-Interface bleibt stabil → später auf eine eigene Edge-Function
// umstellbar, ohne das UI anzufassen (nur in providers/index.ts binden).
//
// Fehlertoleranz: Wenn der Proxy/Feed scheitert, liefert der Provider ein
// leeres Resultat; das UI zeigt dann gecachte/Link-Kacheln (kein Crash).
// =============================================================================
import type { NewsProvider, NewsResult } from './NewsProvider'
import type { NewsSource } from '@/data/types'
import type { FeedItem } from '@/lib/rss'
import { parseRssXml } from '@/lib/rss'

const PROXY = 'https://api.allorigins.win/raw?url='

export class RssProxyNewsProvider implements NewsProvider {
  readonly name = 'RSS-Proxy'

  async fetch(sources: NewsSource[]): Promise<NewsResult> {
    const rssSources = sources.filter((s) => s.type === 'rss')
    // Alle Quellen parallel laden; einzelne Fehler werden ignoriert.
    const settled = await Promise.allSettled(
      rssSources.map(async (src): Promise<{ src: NewsSource; items: FeedItem[] }> => {
        const url = `${PROXY}${encodeURIComponent(src.url)}`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`${src.name}: ${res.status}`)
        const xml = await res.text()
        return { src, items: parseRssXml(xml, src.name) }
      }),
    )

    const items: FeedItem[] = []
    const okSources: string[] = []
    for (const r of settled) {
      if (r.status === 'fulfilled') {
        items.push(...r.value.items)
        okSources.push(r.value.src.name)
      }
    }

    // Neueste zuerst.
    items.sort((a, b) => (b.pubDateMs ?? 0) - (a.pubDateMs ?? 0))

    return { items, fetchedAt: Date.now(), sources: okSources }
  }
}
