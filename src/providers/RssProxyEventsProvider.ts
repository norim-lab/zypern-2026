// =============================================================================
// RssProxyEventsProvider.ts — Default-Events-Provider über die Proxy-Kette.
// Trennt 'rss'-Quellen (parsen) von 'link'-Quellen (nur Kachel, nichts erfinden).
// =============================================================================
import type { EventsProvider, EventsResult } from './EventsProvider'
import type { EventSource } from '@/data/types'
import type { FeedItem } from '@/lib/rss'
import { parseRssXml } from '@/lib/rss'
import { fetchViaProxy } from '@/lib/proxyChain'

export class RssProxyEventsProvider implements EventsProvider {
  readonly name = 'RSS-Proxy Events'

  async fetch(sources: EventSource[]): Promise<EventsResult> {
    const rssSources = sources.filter((s) => s.type === 'rss')
    // Alle Quellen, die nur als Link-Kachel gezeigt werden — zusätzlich Quellen,
    // deren Proxy-Aufruf scheiterte, werden vom Hook als Link-Kachel gezeigt.
    const linkSources = sources.filter((s) => s.type === 'link')

    const settled = await Promise.allSettled(
      rssSources.map(async (src): Promise<{ src: EventSource; items: FeedItem[] }> => {
        const xml = await fetchViaProxy(src.srcKey ?? null, src.url)
        if (xml === null) throw new Error(`${src.name} nicht erreichbar`)
        return { src, items: parseRssXml(xml, src.name) }
      }),
    )

    const items: FeedItem[] = []
    const failedRss: EventSource[] = []
    settled.forEach((r, i) => {
      if (r.status === 'fulfilled') items.push(...r.value.items)
      else failedRss.push(rssSources[i])
    })

    // Gescheiterte RSS-Quellen als Link-Kacheln zeigen (statt sie zu verlieren).
    return {
      items,
      linkSources: [...linkSources, ...failedRss],
      fetchedAt: Date.now(),
    }
  }
}
