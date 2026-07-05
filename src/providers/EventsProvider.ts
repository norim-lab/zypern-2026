// =============================================================================
// EventsProvider.ts — Einheitliches Interface für Veranstaltungssuche.
// Wie News: austauschbar. v0.2 nutzt denselben CORS-Proxy für RSS-Quellen;
// Quellen ohne maschinenlesbares Format werden als Link-Kacheln gezeigt.
// =============================================================================
import type { EventSource } from '@/data/types'
import type { FeedItem } from '@/lib/rss'

/** Ein Event-Ergebnis aus RSS (maschinenlesbare Quellen). */
export interface EventsResult {
  /** RSS-basierte Events */
  items: FeedItem[]
  /** Quellen, die nur als Link-Kachel gezeigt werden (nicht maschinenlesbar). */
  linkSources: EventSource[]
  fetchedAt: number
}

export interface EventsProvider {
  readonly name: string
  /** Lädt Events aus den konfigurierten Quellen. */
  fetch(sources: EventSource[]): Promise<EventsResult>
}
