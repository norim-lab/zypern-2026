// =============================================================================
// useLocalStorage.ts — Generischer, persistenter State.
// v0.1: Checklisten-Zustand bleibt lokal pro Gerät erhalten. v0.2+ kann der
// State später über einen Sync-Mechanismus (Notion) ausgetauscht werden.
// =============================================================================
import { useCallback, useEffect, useState } from 'react'

/** Liest den initialen Wert aus localStorage oder nimmt den Default. */
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/**
 * State, der transparent in localStorage persistiert wird.
 * @param key   localStorage-Schlüssel
 * @param initial  Default-Wert beim ersten Aufruf
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => load(key, initial))

  // Bei Keys-Wechsel den Wert aus dem neuen Key nachladen.
  useEffect(() => {
    setValue(load(key, initial))
    // initial bewusst nicht in Deps (nur key-Wechsel soll triggern).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Wertänderung persistieren.
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // Speicher voll/defekt — ignorieren (Privatgerät).
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set] as const
}
