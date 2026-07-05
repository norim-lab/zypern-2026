// =============================================================================
// useRefreshTask.ts — React-Wrapper für den zentralen RefreshScheduler.
// Registriert eine Task beim Mount, entfernt sie beim Unmount. Stabile run-Fn
// via useRef, damit der Scheduler immer die aktuelle Closure hat.
// =============================================================================
import { useEffect, useRef } from 'react'
import { registerRefreshTask, unregisterRefreshTask } from '@/lib/refreshScheduler'

export interface UseRefreshTaskOptions {
  /** Eindeutige Task-ID. */
  id: string
  /** Intervall in ms. */
  intervalMs: number
  /** Refresh-Funktion. */
  run: () => void | Promise<void>
  /** Wenn true (default): Task aktiv; false = pausiert (z. B. Flugstatus nicht an Reisetagen). */
  enabled?: boolean
}

export function useRefreshTask({ id, intervalMs, run, enabled = true }: UseRefreshTaskOptions) {
  // Stabile Referenz auf die aktuellste run-Fn (verhindert Re-Registrierung).
  const runRef = useRef(run)
  runRef.current = run

  useEffect(() => {
    if (!enabled) return
    registerRefreshTask({ id, intervalMs, run: () => void runRef.current() })
    return () => unregisterRefreshTask(id)
  }, [id, intervalMs, enabled])
}
