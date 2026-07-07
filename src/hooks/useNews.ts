// =============================================================================
// useNews.ts — News-Aggregation mit Relevanz-Split + Archivierung.
//   - Stündlich + bei Fokus aktualisieren.
//   - Relevanz-Filter: Meldungen mit Schlagwort-Treffer oben („Für uns relevant").
//   - Älter als 48 h oder gelesen → ins Archiv.
// =============================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { newsProvider } from '@/providers'
import type { NewsResult } from '@/providers'
import type { FeedItem } from '@/lib/rss'
import { isRelevant } from '@/lib/rss'
import { NEWS_TTL, CACHE_KEYS, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { useArchive } from './useArchive'
import { useRefreshTask } from './useRefreshTask'
import { newsSources, newsKeywords, newsLinkTiles } from '@/data/tripData'

const ARCHIVE_AFTER_MS = 48 * 60 * 60 * 1000

export interface UseNewsResult {
  relevant: FeedItem[]
  further: FeedItem[]
  linkSources: typeof newsLinkTiles
  loading: boolean
  error: string | null
  updatedAt: number | null
  refresh: () => Promise<void>
  markRead: (item: FeedItem) => void
}

export function useNews(): UseNewsResult {
  const [result, setResult] = useState<NewsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const archive = useArchive()

  // v0.5.1 Fix: archive als Ref — neue Object-Identität je Render würde load
  // verändern und Endlos-Re-Render auslösen.
  const archiveRef = useRef(archive)
  archiveRef.current = archive

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const res = await newsProvider.fetch(newsSources)
        setResult(res)
        const ts = writeCache(CACHE_KEYS.news, res)
        setUpdatedAt(ts)
        // Ältere Meldungen (> 48 h) automatisch archivieren.
        const now = Date.now()
        const toArchive = res.items
          .filter((i) => i.pubDateMs !== null && now - (i.pubDateMs as number) > ARCHIVE_AFTER_MS)
          .map((i) => ({
            id: `news-${i.pubDateMs ?? now}-${i.link}`,
            kind: 'news' as const,
            title: i.title,
            sourceUrl: i.link,
            archivedAt: now,
            originalDate: i.pubDateMs ?? undefined,
            payload: i.source,
          }))
        if (toArchive.length > 0) void archiveRef.current.addMany(toArchive)
      } catch (err) {
        const cached = readCache<NewsResult>(CACHE_KEYS.news)
        if (cached) {
          setResult(cached.data)
          setUpdatedAt(cached.timestamp)
          setError('Offline — letzte Meldungen aus dem Cache.')
        } else {
          setError(err instanceof Error ? err.message : 'News konnten nicht geladen werden.')
        }
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // Initiale Ladung.
  useEffect(() => {
    const cached = readCache<NewsResult>(CACHE_KEYS.news)
    if (cached) {
      setResult(cached.data)
      setUpdatedAt(cached.timestamp)
    }
    if (isCacheStale(CACHE_KEYS.news, NEWS_TTL)) void load(true)
  }, [load])

  // v0.3: Zentraler RefreshScheduler (stündlich; Fokus/Online übernommen).
  useRefreshTask({
    id: 'news',
    intervalMs: NEWS_TTL,
    run: () => {
      if (isCacheStale(CACHE_KEYS.news, NEWS_TTL)) void load(true)
    },
  })

  const refresh = useCallback(async () => {
    await load(false)
  }, [load])

  const markRead = useCallback(
    (item: FeedItem) => {
      void archiveRef.current.add({
        id: `news-${item.pubDateMs ?? Date.now()}-${item.link}`,
        kind: 'news',
        title: item.title,
        sourceUrl: item.link,
        archivedAt: Date.now(),
        originalDate: item.pubDateMs ?? undefined,
        payload: item.source,
      })
    },
    [],
  )

  // Relevanz-Split (memoisiert).
  const { relevant, further } = useMemo(() => {
    const items = result?.items ?? []
    const rel: FeedItem[] = []
    const fur: FeedItem[] = []
    for (const it of items) {
      if (isRelevant(it.title, newsKeywords)) rel.push(it)
      else fur.push(it)
    }
    return { relevant: rel, further: fur }
  }, [result])

  return {
    relevant,
    further,
    linkSources: newsLinkTiles,
    loading,
    error,
    updatedAt,
    refresh,
    markRead,
  }
}
