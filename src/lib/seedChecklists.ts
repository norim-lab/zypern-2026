// =============================================================================
// seedChecklists.ts — Einspielen der Seed-Checklisten OHNE React-Hooks (v0.7).
//
// Lehre aus dem v0.5-Crash: seedEvents war früher ein Hook und wurde auf
// Modulebene in main.tsx aufgerufen → „Invalid hook call" → App-Crash. Diese
// normale Funktion liest/schreibt localStorage direkt und kann vor dem Render
// aufgerufen werden. Sie ist eine PURE FUNKTION (kein React-Import, keine Hooks).
//
// Aufgabe: Beim ERSTEN Start die Seed-Checklisten (statische Listen aus
// tripData + personenbezogene „Packliste Miron" aus privateData) in den
// editierbaren localStorage-Speicher einspielen. Ein Merge-Flag verhindert,
// dass spätere App-Updates Nutzeränderungen überschreiben oder duplizieren.
// =============================================================================
import { checklists } from '@/data/tripData'
import { packlisteMironSeed } from '@/data/privateData'
import { PRIVATE_MODE } from '@/hooks/usePrivateMode'
import type { Checklist } from '@/data/types'

const SEED_FLAG = 'zyp2026:checklist-seeds-v1-injected'
const CHECKLISTS_KEY = 'zyp2026:checklists'

/**
 * Einspielen der Seed-Checklisten beim ersten Start.
 * Pure Funktion — KEINE React-Hooks. Einmalig vor dem Render aufrufen.
 *
 * Regeln (analog seedEvents.ts):
 *  - Ist das Versions-Flag bereits gesetzt → sofort zurück (nichts tun).
 *  - Bestehende nutzer-editierte Checklisten werden nach id dedupliziert;
 *    NUTZER-EINTRÄGE GEWINNEN (werden behalten), Seeds werden nur ergänzt.
 *  - Im Privat-Modus (VITE_PRIVATE_MODE=true) wird die personenbezogene
 *    „Packliste Miron" NICHT eingespielt (Medikamente/Dokumente sensitiv).
 */
export function injectSeedChecklists(): void {
  try {
    const done = localStorage.getItem(SEED_FLAG)
    if (done) return

    // Seeds zusammenstellen: statische Listen + (im Nicht-Privat-Modus)
    // personenbezogene „Packliste Miron".
    const seeds: Checklist[] = [...checklists]
    if (!PRIVATE_MODE) {
      seeds.push(packlisteMironSeed)
    }

    const raw = localStorage.getItem(CHECKLISTS_KEY)
    const existing: Checklist[] = raw ? JSON.parse(raw) : []
    const seedIds = new Set(seeds.map((s) => s.id))
    // Nutzer-Listen behalten (die nicht in den Seeds sind); Seeds ergänzen.
    const userLists = existing.filter((c) => !seedIds.has(c.id))
    const next = [...seeds, ...userLists]
    localStorage.setItem(CHECKLISTS_KEY, JSON.stringify(next))
    localStorage.setItem(SEED_FLAG, 'true')
  } catch {
    // localStorage nicht verfügbar — still ignorieren (App läuft ohne Seeds).
  }
}

/** localStorage-Schlüssel für die editierbaren Checklisten (für useChecklists). */
export const CHECKLISTS_STORAGE_KEY = CHECKLISTS_KEY
