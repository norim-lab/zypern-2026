// =============================================================================
// useJourneyETA.ts — Tab-übergreifend geteilte Live-ETA für die Reise-Kette (v0.7.2).
//
// Aufgaben:
//  - Hält die aktuelle Live-ETA der Landung (Epoch-ms) als localStorage-Wert,
//    damit Tracker (Schreiber im Flüge-Tab) und Timeline/Dashboard (Leser in
//    anderen Tabs) denselben Stand sehen — auch ohne Context-Provider.
//  - Reaktivität über ein Custom-Event ('zyp2026:journey-eta-changed'), das bei
//    jeder Aktualisierung gefeuert wird. Alle useJourneyETA-Konsumenten hören
//    darauf und re-rendern.
//  - Richtung (Hin-/Rückflug) wird mitgeführt, da die Etappen unterschiedlich
//    sind und die ETA sich auf die jeweilige Landung bezieht.
//
// Fallback: Ohne Live-ETA (null) zeigen Timeline/Dashboard die Planzeiten.
// =============================================================================
import { useCallback, useEffect, useState } from 'react'

const ETA_KEY = 'zyp2026:journey-eta'
const ETA_EVENT = 'zyp2026:journey-eta-changed'

export type JourneyDirection = 'outbound' | 'return'

interface StoredETA {
  /** Richtung, auf die sich die ETA bezieht. */
  direction: JourneyDirection
  /** Voraussichtliche Landezeit als Epoch-ms. */
  landingMs: number
  /** Aktualisiert am (Epoch-ms). */
  updatedAt: number
}

function readStored(): StoredETA | null {
  try {
    const raw = localStorage.getItem(ETA_KEY)
    return raw ? (JSON.parse(raw) as StoredETA) : null
  } catch {
    return null
  }
}

function writeStored(value: StoredETA | null): void {
  try {
    if (value) localStorage.setItem(ETA_KEY, JSON.stringify(value))
    else localStorage.removeItem(ETA_KEY)
    // Reaktivität: alle Konsumenten benachrichtigen (auch andere Tabs).
    window.dispatchEvent(new CustomEvent(ETA_EVENT))
  } catch {
    /* Speicher nicht verfügbar — ignorieren */
  }
}

export interface UseJourneyETAResult {
  /** Aktuelle Live-ETA (null = keine, zeige Planzeiten). */
  eta: StoredETA | null
  /** Live-ETA setzen (vom Tracker aufgerufen). */
  setETA: (direction: JourneyDirection, landingMs: number | null) => void
}

/**
 * Hook für Konsumenten der Live-ETA. Schreibende Seite (Tracker) ruft setETA,
 * lesende Seite (Timeline/Dashboard) reagiert automatisch auf Änderungen.
 */
export function useJourneyETA(): UseJourneyETAResult {
  const [eta, setEta] = useState<StoredETA | null>(() => readStored())

  useEffect(() => {
    const handler = () => setEta(readStored())
    const storageHandler = (e: StorageEvent) => {
      if (e.key === ETA_KEY) handler()
    }
    window.addEventListener(ETA_EVENT, handler)
    window.addEventListener('storage', storageHandler)
    return () => {
      window.removeEventListener(ETA_EVENT, handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [])

  const setETA = useCallback(
    (direction: JourneyDirection, landingMs: number | null) => {
      if (landingMs == null) {
        writeStored(null)
      } else {
        writeStored({ direction, landingMs, updatedAt: Date.now() })
      }
    },
    [],
  )

  return { eta, setETA }
}
