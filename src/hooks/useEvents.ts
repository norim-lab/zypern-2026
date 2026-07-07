// =============================================================================
// useEvents.ts — Veranstaltungen: RSS-Quellen + manuelle Events.
//   - Stündlich + bei Fokus aktualisieren.
//   - Sortierung: Datum (nächste zuerst), innerhalb Tages nach Entfernung.
//   - Vergangene Events → automatisch ins Archiv.
//   - 'link'-Quellen werden als Link-Kacheln gezeigt (nichts erfinden).
// =============================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { eventsProvider } from '@/providers'
import type { EventsResult } from '@/providers'
import type { ManualEvent, EventSource } from '@/data/types'
import { useLocalStorage } from './useLocalStorage'
import { useArchive } from './useArchive'
import { useRefreshTask } from './useRefreshTask'
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

  // v0.3: Zentraler RefreshScheduler (stündlich; Fokus/Online übernommen).
  useRefreshTask({
    id: 'events',
    intervalMs: EVENTS_TTL,
    run: () => {
      if (isCacheStale(CACHE_KEYS.events, EVENTS_TTL)) void load(true)
    },
  })

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

  // Vergangene manuelle Events ins Archiv verschieben — ABER recurring Events
  // behalten. v0.5.1 Fix: `archive` NICHT in Deps (neue Identität je Render → Loop).
  const archiveRef = useRef(archive)
  archiveRef.current = archive
  useEffect(() => {
    const now = Date.now()
    const past = manualEvents.filter(
      (e) => !e.recurring && new Date(e.date).getTime() + 86400000 < now,
    )
    if (past.length > 0) {
      void archiveRef.current.addMany(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualEvents, setManualEvents])

  // Kombiniere + sortiere (nächste zuerst). Recurring Events → nächstes Vorkommnis.
  const upcoming = useMemo(() => {
    const rss = (result?.items ?? []).map(toRssEvent)
    const manual: (ManualEvent | RssEvent)[] = manualEvents.map((m) => {
      if (m.recurring === 'weekly' && m.recurringDay !== undefined) {
        const nextDate = nextWeeklyOccurrence(m.recurringDay)
        return { kind: 'manual' as const, ...m, date: nextDate }
      }
      return { kind: 'manual' as const, ...m }
    })
    const combined: (ManualEvent | RssEvent)[] = [...manual, ...rss]
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

/**
 * Liefert das nächste Datum (ISO YYYY-MM-DD) des Wochentags `day` (0=So … 6=Sa),
 * das innerhalb des Reisezeitraums (17.07.–07.08.2026) liegt — ab heute gerechnet.
 */
function nextWeeklyOccurrence(day: number): string {
  const now = new Date()
  const tripEnd = new Date('2026-08-08')
  // Vom heutigen Tag ausgehend den nächsten Ziel-Tag finden.
  const result = new Date(now)
  let diff = (day - now.getDay() + 7) % 7
  if (diff === 0 && now.getHours() >= 12) diff = 7 // heute schon Mittag → nächste Woche
  result.setDate(result.getDate() + diff)
  // Falls über das Reiseende hinaus: am ersten Samstag der Reise festmachen.
  if (result > tripEnd) {
    result.setTime(new Date('2026-07-18').getTime()) // fallback: erster Samstag
  }
  return result.toISOString().slice(0, 10)
}

