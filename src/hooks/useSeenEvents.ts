// =============================================================================
// useSeenEvents.ts — Hinweis-Badge am Events-Tab bei neuen Events (v0.4).
// Merkt sich der letzte „gesehene" Stand (Anzahl). Wenn aktuelle Anzahl größer,
// gibt es neue Events → Badge sichtbar. Beim Öffnen des Events-Tabs markSeen().
// =============================================================================
import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useSeenEvents(currentCount: number) {
  const [seenCount, setSeenCount] = useLocalStorage<number>('zyp2026:seen-events', 0)
  const hasNew = currentCount > seenCount

  const markSeen = useCallback(() => {
    setSeenCount(currentCount)
  }, [currentCount, setSeenCount])

  return { hasNew, markSeen }
}
