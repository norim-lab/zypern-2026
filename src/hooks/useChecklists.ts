// =============================================================================
// useChecklists.ts — Zentraler Hook für editierbare Checklisten (v0.7).
//
// Speichert die vollständigen, editierbaren Listen (inkl. Items + Gruppen) in
// localStorage unter 'zyp2026:checklists' (kleine Datenmenge → bewusst
// localStorage statt IndexedDB). Die Seeds werden einmalig vor dem Render von
// seedChecklists.ts::injectSeedChecklists() eingespielt.
//
// WICHTIG — Abhak-Kompatibilität: Der Abhak-Status (done-Map) bleibt im
// BESTEHENDEN Key 'zyp2026:checklist:<listId>' (Record<itemId, boolean>).
// Das ist Absicht, damit bestehende Daten (z. B. TodoHintCard auf dem Dashboard,
// die 'zyp2026:checklist:todos-open' liest) unverändert funktionieren und
// Abhak-Zustände ein Update überdauern.
// =============================================================================
import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { CHECKLISTS_STORAGE_KEY } from '@/lib/seedChecklists'
import type { Checklist, ChecklistItem, ChecklistGroup } from '@/data/types'

/** Generiert eine hinreichend eindeutige ID für neue Einträge/Gruppen. */
function newId(prefix: string): string {
  // crypto.randomUUID() ist in allen aktuellen Browsern verfügbar; Fallback
  // für sehr alte Browser (sollte bei einer privaten PWA irrelevant sein).
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

export interface UseChecklistsResult {
  /** Alle Checklisten, nach `order` sortiert (kleinster zuerst). */
  lists: Checklist[]
  // --- Abhak-Status (eigener Key, kompatibel zu v0.1–v0.6) ---
  getDone: (listId: string) => Record<string, boolean>
  setDone: (listId: string, next: Record<string, boolean>) => void
  toggleItem: (listId: string, itemId: string) => void
  reset: (listId: string) => void
  // --- Items bearbeiten ---
  addItem: (listId: string, label: string, groupId?: string) => void
  updateItem: (listId: string, itemId: string, label: string) => void
  removeItem: (listId: string, itemId: string) => void
  // --- Gruppen bearbeiten ---
  addGroup: (listId: string, title: string) => string | null
  updateGroup: (listId: string, groupId: string, title: string) => void
  removeGroup: (listId: string, groupId: string) => void
  // --- Listen bearbeiten ---
  addList: (title: string) => string | null
  removeList: (listId: string) => void
}

const DONE_KEY = (listId: string) => `zyp2026:checklist:${listId}`

export function useChecklists(): UseChecklistsResult {
  const [lists, setLists] = useLocalStorage<Checklist[]>(CHECKLISTS_STORAGE_KEY, [])

  // Sortierte Ansicht (Original bleibt unsortiert gespeichert — nur Anzeige).
  const sorted = useMemo(() => [...lists].sort((a, b) => a.order - b.order), [lists])

  // --- Hilfsfunktion: eine Liste unveränderlich mutieren ---
  const updateList = useCallback(
    (listId: string, fn: (list: Checklist) => Checklist) => {
      setLists((prev) => prev.map((l) => (l.id === listId ? fn(l) : l)))
    },
    [setLists],
  )

  // --- Abhak-Status (bestehender Key, Kompatibilität!) ---
  // Wir lesen/schreiben direkt localStorage über useLocalStorage je Liste.
  // Da useChecklists potenziell viele Listen verwaltet, nutzen wir einen
  // internen Cache von useLocalStorage-Calls ist ineffizient — statt dessen
  // einfache Zugriffsfunktionen auf den jeweiligen done-Key.
  const getDone = useCallback((listId: string): Record<string, boolean> => {
    try {
      const raw = localStorage.getItem(DONE_KEY(listId))
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
    } catch {
      return {}
    }
  }, [])

  const setDone = useCallback(
    (listId: string, next: Record<string, boolean>) => {
      try {
        localStorage.setItem(DONE_KEY(listId), JSON.stringify(next))
        // Re-Render triggern: wir „stupsen" lists leicht an (neue Array-Ref),
        // damit Konsumenten der done-Werte neu lesen. Simpler Trigger via setLists.
        setLists((prev) => [...prev])
      } catch {
        /* ignorieren */
      }
    },
    [setLists],
  )

  const toggleItem = useCallback(
    (listId: string, itemId: string) => {
      const done = getDone(listId)
      setDone(listId, { ...done, [itemId]: !done[itemId] })
    },
    [getDone, setDone],
  )

  const reset = useCallback((listId: string) => setDone(listId, {}), [setDone])

  // --- Items ---
  const addItem = useCallback(
    (listId: string, label: string, groupId?: string) => {
      const trimmed = label.trim()
      if (!trimmed) return
      const item: ChecklistItem = {
        id: newId('item'),
        label: trimmed,
        ...(groupId ? { groupId } : {}),
      }
      updateList(listId, (l) => ({ ...l, items: [...l.items, item] }))
    },
    [updateList],
  )

  const updateItem = useCallback(
    (listId: string, itemId: string, label: string) => {
      const trimmed = label.trim()
      if (!trimmed) return
      updateList(listId, (l) => ({
        ...l,
        items: l.items.map((it) => (it.id === itemId ? { ...it, label: trimmed } : it)),
      }))
    },
    [updateList],
  )

  const removeItem = useCallback(
    (listId: string, itemId: string) => {
      updateList(listId, (l) => ({ ...l, items: l.items.filter((it) => it.id !== itemId) }))
      // Abhak-Status dieses Items ebenfalls entfernen (sauber halten).
      const done = getDone(listId)
      if (itemId in done) {
        const { [itemId]: _drop, ...rest } = done
        void _drop
        setDone(listId, rest)
      }
    },
    [updateList, getDone, setDone],
  )

  // --- Gruppen ---
  const addGroup = useCallback(
    (listId: string, title: string): string | null => {
      const trimmed = title.trim()
      if (!trimmed) return null
      const group: ChecklistGroup = { id: newId('grp'), title: trimmed }
      updateList(listId, (l) => ({ ...l, groups: [...(l.groups ?? []), group] }))
      return group.id
    },
    [updateList],
  )

  const updateGroup = useCallback(
    (listId: string, groupId: string, title: string) => {
      const trimmed = title.trim()
      if (!trimmed) return
      updateList(listId, (l) => ({
        ...l,
        groups: (l.groups ?? []).map((g) => (g.id === groupId ? { ...g, title: trimmed } : g)),
      }))
    },
    [updateList],
  )

  const removeGroup = useCallback(
    (listId: string, groupId: string) => {
      updateList(listId, (l) => ({
        ...l,
        groups: (l.groups ?? []).filter((g) => g.id !== groupId),
        // Items der gelöschten Gruppe behalten (groupId wird lediglich entfernt),
        // damit keine Einträge verloren gehen — sie erscheinen dann „ohne Gruppe".
        items: l.items.map((it) =>
          it.groupId === groupId ? { ...it, groupId: undefined } : it,
        ),
      }))
    },
    [updateList],
  )

  // --- Listen ---
  const addList = useCallback(
    (title: string): string | null => {
      const trimmed = title.trim()
      if (!trimmed) return null
      // Neue Liste ans Ende (höchste order + 1).
      const maxOrder = lists.reduce((mx, l) => Math.max(mx, l.order), 0)
      const list: Checklist = {
        id: newId('list'),
        title: trimmed,
        icon: '📝',
        kind: 'todo',
        order: maxOrder + 1,
        items: [],
      }
      setLists((prev) => [...prev, list])
      return list.id
    },
    [lists, setLists],
  )

  const removeList = useCallback(
    (listId: string) => {
      setLists((prev) => prev.filter((l) => l.id !== listId))
      // Abhak-Status der Liste aufräumen.
      try {
        localStorage.removeItem(DONE_KEY(listId))
      } catch {
        /* ignorieren */
      }
    },
    [setLists],
  )

  return {
    lists: sorted,
    getDone,
    setDone,
    toggleItem,
    reset,
    addItem,
    updateItem,
    removeItem,
    addGroup,
    updateGroup,
    removeGroup,
    addList,
    removeList,
  }
}
