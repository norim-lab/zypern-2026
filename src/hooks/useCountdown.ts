// =============================================================================
// useCountdown.ts — Countdown bis zu einem Zielpunkt (Sekundenaktualisierung).
// Das Dashboard zielt zunächst auf den Abflug; nach dessen Überschreitung
// automatisch auf den Rückflug. Siehe getActiveTarget().
// =============================================================================
import { useEffect, useMemo, useState } from 'react'
import { outboundFlight, returnFlight } from '@/data/tripData'

export interface CountdownValue {
  /** Verbleibende Tage */
  days: number
  /** Verbleibende Stunden */
  hours: number
  /** Verbleibende Minuten */
  minutes: number
  /** Verbleibende Sekunden */
  seconds: number
  /** Totale ms bis zum Ziel */
  totalMs: number
}

function diff(targetMs: number): CountdownValue {
  const totalMs = Math.max(0, targetMs - Date.now())
  const totalSec = Math.floor(totalMs / 1000)
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    totalMs,
  }
}

export interface CountdownTarget {
  /** Anzeigelabel */
  label: string
  /** ISO-Datum-Uhrzeit */
  target: string
}

/**
 * Liefert den aktiven Countdown-Zielzeitpunkt:
 * vor dem Abflug → Abflug, danach → Rückflug; nach der Rückkehr → null.
 */
export function getActiveTarget(): CountdownTarget | null {
  const now = Date.now()
  const outbound = new Date(outboundFlight.departureAt).getTime()
  const ret = new Date(returnFlight.departureAt).getTime()

  if (now < outbound) {
    return { label: 'Abflug', target: outboundFlight.departureAt }
  }
  if (now < ret) {
    return { label: 'Rückflug', target: returnFlight.departureAt }
  }
  return null
}

/** Hook: Sekundenaktiver Countdown auf das aktive Ziel. */
export function useCountdown() {
  const target = useMemo(getActiveTarget, [])
  const [value, setValue] = useState<CountdownValue>(() =>
    target ? diff(new Date(target.target).getTime()) : { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 },
  )

  useEffect(() => {
    if (!target) return
    const targetMs = new Date(target.target).getTime()
    const id = setInterval(() => setValue(diff(targetMs)), 1000)
    return () => clearInterval(id)
  }, [target])

  return { target, value }
}
