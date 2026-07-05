// =============================================================================
// NewsProvider.ts — Einheitliches Interface für News-Aggregation.
// Implementierungen sind austauschbar:
//   - RssProxyNewsProvider (Default, v0.2): via öffentlichem CORS-Proxy.
//   - später: Edge-Function / Google News API (mit Key).
// =============================================================================
import type { NewsSource } from '@/data/types'
import type { FeedItem } from '@/lib/rss'

/** Ein aggregiertes News-Resultat. */
export interface NewsResult {
  /** Alle Meldungen (roh) */
  items: FeedItem[]
  /** Zeitpunkt der Abfrage (ms) */
  fetchedAt: number
  /** Quelle(n)-Namen */
  sources: string[]
}

export interface NewsProvider {
  readonly name: string
  /** Lädt Meldungen aus den konfigurierten Quellen. */
  fetch(sources: NewsSource[]): Promise<NewsResult>
}
