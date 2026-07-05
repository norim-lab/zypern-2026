// =============================================================================
// useArchive.ts — Persistenter Archiv-Store in IndexedDB (via idb-keyval).
// Für News-Mengen reicht localStorage nicht → IndexedDB.
// Obergrenze ~500 Einträge, älteste zuerst entfernt.
// =============================================================================
import { useCallback, useEffect, useState } from 'react'
import { del, get, set as idbSet } from 'idb-keyval'
import type { ArchivedItem } from '@/data/types'

const STORE_KEY = 'zyp2026:archive'
/** Maximale Anzahl Archiv-Einträge; älteste zuerst entfernen. */
const MAX_ENTRIES = 500

/** Liefert alle Archiv-Einträge (neueste zuerst). */
async function loadAll(): Promise<ArchivedItem[]> {
  try {
    const items = (await get<ArchivedItem[]>(STORE_KEY)) ?? []
    return items.sort((a, b) => b.archivedAt - a.archivedAt)
  } catch {
    return []
  }
}

/** Schreibt Einträge zurück und kürzt auf MAX_ENTRIES (älteste zuerst weg). */
async function persistAll(items: ArchivedItem[]): Promise<ArchivedItem[]> {
  const sorted = [...items].sort((a, b) => b.archivedAt - a.archivedAt)
  const trimmed = sorted.slice(0, MAX_ENTRIES)
  await idbSet(STORE_KEY, trimmed)
  return trimmed
}

export interface UseArchiveResult {
  items: ArchivedItem[]
  /** Fügt ein Element hinzu (duplikat-sicher via id). */
  add: (item: ArchivedItem) => Promise<void>
  /** Fügt mehrere hinzu. */
  addMany: (items: ArchivedItem[]) => Promise<void>
  /** Entfernt ein Element endgültig. */
  remove: (id: string) => Promise<void>
  /** Prüft, ob eine id bereits archiviert ist. */
  has: (id: string) => boolean
}

export function useArchive(): UseArchiveResult {
  const [items, setItems] = useState<ArchivedItem[]>([])

  useEffect(() => {
    void loadAll().then(setItems)
  }, [])

  const add = useCallback(async (item: ArchivedItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev
      const next = persistAll([item, ...prev])
      void next.then(setItems)
      return prev
    })
  }, [])

  const addMany = useCallback(async (newItems: ArchivedItem[]) => {
    setItems((prev) => {
      const existing = new Set(prev.map((p) => p.id))
      const fresh = newItems.filter((i) => !existing.has(i.id))
      if (fresh.length === 0) return prev
      const next = persistAll([...fresh, ...prev])
      void next.then(setItems)
      return prev
    })
  }, [])

  const remove = useCallback(async (id: string) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.id !== id)
      void persistAll(next).then(setItems)
      return prev
    })
    // Einzelne id-Key-Ausweise (falls genutzt) aufräumen — Hauptstore reicht aber.
    void del(id).catch(() => {})
  }, [])

  const has = useCallback((id: string) => items.some((p) => p.id === id), [items])

  return { items, add, addMany, remove, has }
}
