// =============================================================================
// HermesFlightStatusProvider.ts — Echter Live-Flugstatus via Hermes Airports (v0.5 §2).
// Lädt die PFO-Ankünfte/Abflüge-Seite über die Proxy-Kette und parst HTML nach
// FR3878/FR3879. Fallback: ScheduledTimeProvider (Planzeiten + Flightradar24-Link).
// =============================================================================
import type { FlightStatusProvider, FlightStatus } from './FlightStatusProvider'
import type { Flight } from '@/data/types'
import { fetchViaProxy } from '@/lib/proxyChain'

export class HermesFlightStatusProvider implements FlightStatusProvider {
  readonly name = 'Hermes Airports'

  async fetchStatus(flight: Flight): Promise<FlightStatus> {
    try {
      const html = await fetchViaProxy('hermes-pfo', 'https://www.hermesairports.com/flight-info/arrivals-and-departures-pfo')
      if (html === null) throw new Error('Hermes nicht erreichbar')

      // HTML nach Flugnummer durchsuchen (sehr robust, tolerant bei Layout-Änderungen).
      const fn = flight.flightNumber // FR3878 / FR3879
      const idx = html.toUpperCase().indexOf(fn.toUpperCase())
      if (idx === -1) throw new Error(`${fn} nicht auf Hermes-Seite gefunden`)

      // Kontext um den Treffer (Status-Spalte ist meist rechts vom Flug).
      const context = html.slice(idx, idx + 500).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

      // Status-Schlüsselwörter erkennen.
      const lower = context.toLowerCase()
      let state: FlightStatus['state'] = 'scheduled'
      let message = 'Auf Hermes-Seite gefunden — Status siehe Flightradar24.'
      if (lower.includes('departed') || lower.includes('gone')) { state = 'departed'; message = 'Abgeflogen (laut Hermes).' }
      else if (lower.includes('arrived') || lower.includes('landed')) { state = 'arrived'; message = 'Gelandet (laut Hermes).' }
      else if (lower.includes('delay') || lower.includes('verspät')) { state = 'delayed'; message = 'Verspätet (laut Hermes).' }
      else if (lower.includes('boarding')) { state = 'boarding'; message = 'Boarding (laut Hermes).' }
      else if (lower.includes('scheduled') || lower.includes('geplant')) { state = 'scheduled'; message = 'Geplant (laut Hermes).' }

      return { flightNumber: fn, state, message, fetchedAt: Date.now(), source: this.name }
    } catch {
      // Sauberer Fallback: Planzeiten-Status.
      throw new Error('Hermes nicht erreichbar — auf Planzeiten/Flightradar24 zurückgefallen.')
    }
  }
}
