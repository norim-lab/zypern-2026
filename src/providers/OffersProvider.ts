// =============================================================================
// OffersProvider.ts — Interface für Angebots-/Prospekt-Quellen (v0.4).
// gleicher Muster wie News/Events: 'rss' automatisch, 'link' = Kachel.
// =============================================================================

export interface OffersResult {
  /** Geparste Angebote (nur, wenn eine Quelle maschinenlesbar ist). */
  items: import('@/data/types').OfferItem[]
  /** Quellen, die nur als Link-Kachel gezeigt werden (Prospekt öffnen). */
  linkSources: import('@/data/types').OfferSource[]
  fetchedAt: number
}

export interface OffersProvider {
  readonly name: string
  fetch(sources: import('@/data/types').OfferSource[]): Promise<OffersResult>
}
