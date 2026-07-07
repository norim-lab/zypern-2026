// =============================================================================
// seedEvents.ts — Einspielen fester Event-Seeds OHNE React-Hooks (v0.5.1 Fix #1).
// `useSeedEvents` war ein Hook und wurde auf Modulebene in main.tsx aufgerufen
// → „Invalid hook call" → App-Crash. Diese normale Funktion liest/schreibt
// localStorage direkt und kann vor dem Render aufgerufen werden.
// =============================================================================
import { seedEvents } from '@/data/tripData'
import type { ManualEvent } from '@/data/types'

const SEED_FLAG = 'zyp2026:seeds-v05-injected'
const EVENTS_KEY = 'zyp2026:manual-events'

/**
 * Einspielen der Seed-Events (Larnaka Festival, Wochenmarkt) beim ersten Start.
 * Pure Funktion — KEINE React-Hooks. Einmalig vor dem Render aufrufen.
 */
export function injectSeedEvents(): void {
  try {
    const done = localStorage.getItem(SEED_FLAG)
    if (done) return

    const raw = localStorage.getItem(EVENTS_KEY)
    const existing: ManualEvent[] = raw ? JSON.parse(raw) : []
    const seedIds = new Set(seedEvents.map((s) => s.id))
    const filtered = existing.filter((e) => !seedIds.has(e.id))
    const next = [...seedEvents, ...filtered]
    localStorage.setItem(EVENTS_KEY, JSON.stringify(next))
    localStorage.setItem(SEED_FLAG, 'true')
  } catch {
    // localStorage nicht verfügbar — still ignorieren.
  }
}
