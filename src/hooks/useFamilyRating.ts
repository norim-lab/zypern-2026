// =============================================================================
// useFamilyRating.ts — Familien-Sterne + Notiz pro Eintrag (v0.4).
// Persistiert in localStorage. Nutzbar für Restaurants, Strände, Ausflüge, Märkte.
// =============================================================================
import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { FamilyRating } from '@/data/types'

/** Liefert Rating-Get/Set für einen Eintrag (id). */
export function useFamilyRating(id: string) {
  const [ratings, setRatings] = useLocalStorage<Record<string, FamilyRating>>(
    'zyp2026:family-ratings',
    {},
  )

  const rating = ratings[id] ?? { stars: 0 }

  const setRating = useCallback(
    (next: Partial<FamilyRating>) => {
      setRatings((prev) => ({
        ...prev,
        [id]: { ...{ stars: 0 }, ...prev[id], ...next },
      }))
    },
    [id, setRatings],
  )

  const clear = useCallback(() => {
    setRatings((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }, [id, setRatings])

  return { rating, setRating, clear }
}
