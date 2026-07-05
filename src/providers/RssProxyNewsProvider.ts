// =============================================================================
// RssProxyNewsProvider.ts — Default-News-Provider über die zentrale Proxy-Kette.
//
// v0.3: Statt direkt allorigins zu nutzen, läuft jede Quelle durch fetchViaProxy:
//   (1) eigene Function /api/fetch?src=<srcKey>
//   (2) allorigins-Fallback
//   (3) null → Quelle erscheint als Link-Kachel (Hook setzt linkSources).
//
// Fehlertoleranz: Einzelquellen-Fehler werden ignoriert; die Hooks zeigen
// gecachte Daten mit Hinweis „Stand HH:MM — Quellen gerade nicht erreichbar".
// =============================================================================
import type { NewsProvider, NewsResult } from './NewsProvider'
import type { NewsSource } from '@/data/types'
import type { FeedItem } from '@/lib/rss'
import { parseRssXml } from '@/lib/rss'
import { fetchViaProxy } from '@/lib/proxyChain'

export class RssProxyNewsProvider implements NewsProvider {
  readonly name = 'RSS-Proxy'

  async fetch(sources: NewsSource[]): Promise<NewsResult> {
    const rssSources = sources.filter((s) => s.type === 'rss')
    const settled = await Promise.allSettled(
      rssSources.map(async (src): Promise<FeedItem[]> => {
        const xml = await fetchViaProxy(src.srcKey ?? null, src.url)
        if (xml === null) throw new Error(`${src.name} nicht erreichbar`)
        return parseRssXml(xml, src.name)
      }),
    )

    const items: FeedItem[] = []
    const okSources: string[] = []
    settled.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        items.push(...r.value)
        okSources.push(rssSources[i].name)
      }
    })

    items.sort((a, b) => (b.pubDateMs ?? 0) - (a.pubDateMs ?? 0))
    return { items, fetchedAt: Date.now(), sources: okSources }
  }
}
