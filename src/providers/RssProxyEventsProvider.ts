// =============================================================================
// RssProxyEventsProvider.ts — Default-Events-Provider via CORS-Proxy.
// Trennt 'rss'-Quellen (parsen) von 'link'-Quellen (nur Kachel, nichts erfinden).
// =============================================================================
import type { EventsProvider, EventsResult } from './EventsProvider'
import type { EventSource } from '@/data/types'
import type { FeedItem } from '@/lib/rss'
import { parseRssXml } from '@/lib/rss'

const PROXY = 'https://api.allorigins.win/raw?url='

export class RssProxyEventsProvider implements EventsProvider {
  readonly name = 'RSS-Proxy Events'

  async fetch(sources: EventSource[]): Promise<EventsResult> {
    const rssSources = sources.filter((s) => s.type === 'rss')
    const linkSources = sources.filter((s) => s.type === 'link')

    const settled = await Promise.allSettled(
      rssSources.map(async (src): Promise<FeedItem[]> => {
        const url = `${PROXY}${encodeURIComponent(src.url)}`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`${src.name}: ${res.status}`)
        const xml = await res.text()
        return parseRssXml(xml, src.name)
      }),
    )

    const items: FeedItem[] = []
    for (const r of settled) {
      if (r.status === 'fulfilled') items.push(...r.value)
    }

    return { items, linkSources, fetchedAt: Date.now() }
  }
}
