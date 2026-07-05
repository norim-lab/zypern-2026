// =============================================================================
// rss.ts — RSS/Atom-Parser (DOMParser) + Relevanz-Matcher.
// Browser-seitiges Parsing des XML-Strings, den der CORS-Proxy liefert.
// =============================================================================

export interface FeedItem {
  title: string
  link: string
  /** Publikationszeit in ms (epoch) — null falls nicht parsebar. */
  pubDateMs: number | null
  /** Name der Quelle (Feed-Titel oder konfigurierter Name). */
  source: string
}

/**
 * Parst einen RSS-/Atom-XML-String in eine Liste von FeedItems.
 * Unterstützt RSS 2.0 (<item>) und Atom (<entry>).
 */
export function parseRssXml(xml: string, sourceName: string): FeedItem[] {
  try {
    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    // Parser-Fehler erkennen
    if (doc.querySelector('parsererror')) return []

    // Atom-Einträge
    const atomEntries = Array.from(doc.querySelectorAll('entry'))
    if (atomEntries.length > 0) {
      return atomEntries.map((entry) => {
        const link =
          entry.querySelector('link')?.getAttribute('href') ??
          entry.querySelector('link')?.textContent ??
          ''
        return {
          title: textOf(entry, 'title'),
          link,
          pubDateMs: parseDateMs(textOf(entry, 'published') || textOf(entry, 'updated')),
          source: sourceName,
        }
      })
    }

    // RSS 2.0
    return Array.from(doc.querySelectorAll('item')).map((item) => ({
      title: textOf(item, 'title'),
      link: textOf(item, 'link'),
      pubDateMs: parseDateMs(textOf(item, 'pubDate')),
      source: sourceName,
    }))
  } catch {
    return []
  }
}

function textOf(parent: Element, tag: string): string {
  return parent.querySelector(tag)?.textContent?.trim() ?? ''
}

function parseDateMs(raw: string): number | null {
  if (!raw) return null
  const ms = Date.parse(raw)
  return Number.isNaN(ms) ? null : ms
}

/**
 * Relevanz-Prüfung gegen eine Schlagwortliste (case-insensitiv, als Wortteil).
 * Liefert true, wenn eines der Schlagwörter im Titel vorkommt.
 */
export function isRelevant(title: string, keywords: string[]): boolean {
  const lower = title.toLowerCase()
  return keywords.some((kw) => lower.includes(kw.toLowerCase()))
}
