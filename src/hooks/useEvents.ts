// =============================================================================
// useEvents.ts — Veranstaltungen: RSS-Quellen + manuelle Events.
//   - Stündlich + bei Fokus aktualisieren.
//   - Sortierung: Datum (nächste zuerst), innerhalb Tages nach Entfernung.
//   - Vergangene Events → automatisch ins Archiv.
//   - 'link'-Quellen werden als Link-Kacheln gezeigt (nichts erfinden).
// =============================================================================
import { useCallback, useEffect, useMemo, useState } from 'react'
import { eventsProvider } from '@/providers'
import type { EventsResult } from '@/providers'
import type { ManualEvent, EventSource } from '@/data/types'
import { useLocalStorage } from './useLocalStorage'
import { useArchive } from './useArchive'
import { EVENTS_TTL, CACHE_KEYS, isCacheStale, readCache, writeCache } from '@/lib/cache'
import { eventSources } from '@/data/tripData'

export interface UseEventsResult {
  /** Kommende Events (manuell + RSS). */
  upcoming: (ManualEvent | RssEvent)[]
  /** Quellen, die nur als Link-Kachel gezeigt werden. */
  linkSources: EventSource[]
  loading: boolean
  error: string | null
  updatedAt: number | null
  refresh: () => Promise<void>
  /** Neue manuelle Event hinzufügen. */
  addManual: (ev: ManualEvent) => void
  /** Manuelle Event löschen. */
  removeManual: (id: string) => void
}

/** RSS-Event (aus maschinenlesbarer Quelle) — Datum ggf. unklar. */
export interface RssEvent {
  kind: 'rss'
  title: string
  url: string
  dateMs: number | null
  source: string
}

function toRssEvent(item: { title: string; link: string; pubDateMs: number | null; source: string }): RssEvent {
  return { kind: 'rss', title: item.title, url: item.link, dateMs: item.pubDateMs, source: item.source }
}

export function useEvents(): UseEventsResult {
  const [result, setResult] = useState<EventsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [manualEvents, setManualEvents] = useLocalStorage<ManualEvent[]>('zyp2026:manual-events', [])
  const archive = useArchive()

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const res = await eventsProvider.fetch(eventSources)
        setResult(res)
        const ts = writeCache(CACHE_KEYS.events, res)
        setUpdatedAt(ts)
      } catch (err) {
        const cached = readCache<EventsResult>(CACHE_KEYS.events)
        if (cached) {
          setResult(cached.data)
          setUpdatedAt(cached.timestamp)
          setError('Offline — letzte Events aus dem Cache.')
        } else {
          setError(err instanceof Error ? err.message : 'Events konnten nicht geladen werden.')
        }
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const cached = readCache<EventsResult>(CACHE_KEYS.events)
    if (cached) {
      setResult(cached.data)
      setUpdatedAt(cached.timestamp)
    }
    if (isCacheStale(CACHE_KEYS.events, EVENTS_TTL)) void load(true)
  }, [load])

  useEffect(() => {
    const id = setInterval(() => void load(true), EVENTS_TTL)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && isCacheStale(CACHE_KEYS.events, EVENTS_TTL)) {
        void load(true)
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [load])

  const refresh = useCallback(async () => {
    await load(false)
  }, [load])

  const addManual = useCallback(
    (ev: ManualEvent) => setManualEvents((prev) => [...prev.filter((p) => p.id !== ev.id), ev]),
    [setManualEvents],
  )
  const removeManual = useCallback(
    (id: string) => setManualEvents((prev) => prev.filter((p) => p.id !== id)),
    [setManualEvents],
  )

  // Vergangene manuelle Events ins Archiv verschieben.
  useEffect(() => {
    const now = Date.now()
    const past = manualEvents.filter((e) => new Date(e.date).getTime() + 86400000 < now)
    if (past.length > 0) {
      void archive.addMany(
        past.map((e) => ({
          id: `event-${e.id}`,
          kind: 'event' as const,
          title: e.title,
          sourceUrl: e.url,
          archivedAt: now,
          originalDate: new Date(e.date).getTime(),
          payload: e.locationName,
        })),
      )
      setManualEvents((prev) => prev.filter((p) => !past.some((pa) => pa.id === p.id)))
    }
  }, [manualEvents, archive, setManualEvents])

  // Kombiniere + sortiere (nächste zuerst).
  const upcoming = useMemo(() => {
    const rss = (result?.items ?? []).map(toRssEvent)
    const manual: (ManualEvent | RssEvent)[] = manualEvents.map((m) => ({ kind: 'manual' as const, ...m }))
    const combined: (ManualEvent | RssEvent)[] = [...manual, ...rss]
    // Sortierschlüssel: Datum (RSS ohne Datum ans Ende).
    return combined.sort((a, b) => {
      const aMs = 'date' in a ? new Date(a.date).getTime() : a.dateMs ?? Number.MAX_SAFE_INTEGER
      const bMs = 'date' in b ? new Date(b.date).getTime() : b.dateMs ?? Number.MAX_SAFE_INTEGER
      return aMs - bMs
    })
  }, [manualEvents, result])

  return {
    upcoming,
    linkSources: result?.linkSources ?? [],
    loading,
    error,
    updatedAt,
    refresh,
    addManual,
    removeManual,
  }
}
