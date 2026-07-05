// =============================================================================
// FlightStatusProvider.ts — Einheitliches Interface für Flugstatus-Dienste.
// Implementierungen sind austauschbar:
//   - ScheduledTimeProvider (Default): zeigt Planzeiten + externe Live-Buttons.
//   - OpenSkyProvider / AeroDataBoxProvider (später): echter Live-Status.
// =============================================================================
import type { Flight } from '@/data/types'

/** Status eines Flugs zur Laufzeit. */
export type FlightState =
  | 'scheduled' // geplant (Planzeiten)
  | 'delayed' // verspätet
  | 'boarding' // Boarding
  | 'departed' // gestartet
  | 'enroute' // in der Luft
  | 'landed' // gelandet
  | 'arrived' // angekommen
  | 'cancelled' // entfallen
  | 'unknown' // unbekannt / kein Live-Status verfügbar

/** Ergebnis eines Flugstatus-Providers. */
export interface FlightStatus {
  /** Flugnummer, z. B. „FR3878" */
  flightNumber: string
  /** Live-Status (falls bekannt, sonst 'scheduled'/'unknown'). */
  state: FlightState
  /** Tatsächliche Abflugszeit (ISO), falls abweichend von Plan. */
  actualDepartureAt?: string
  /** Tatsächliche Ankunftszeit (ISO), falls abweichend von Plan. */
  actualArrivalAt?: string
  /** Verspätung in Minuten (optional). */
  delayMin?: number
  /** Menschenlesbarer Hinweis zum Status. */
  message: string
  /** Zeitpunkt der Abfrage (ms). */
  fetchedAt: number
  /** Quelle des Status (z. B. „Planzeiten", „OpenSky"). */
  source: string
}

/** Einheitliches Provider-Interface. */
export interface FlightStatusProvider {
  /** Eindeutiger Name. */
  readonly name: string
  /** Liefert den (Live-)Status eines Flugs. */
  fetchStatus(flight: Flight): Promise<FlightStatus>
}
