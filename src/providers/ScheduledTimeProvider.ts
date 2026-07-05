// =============================================================================
// ScheduledTimeProvider.ts — Default-Provider: zeigt Planzeiten.
//
// Hintergrund: OpenSky ist nicht mehr keyless verfügbar (Account/Token-Pflicht),
// AeroDataBox benötigt ebenfalls einen API-Key. Damit die App sofort ohne Key
// funktioniert, liefert dieser Provider die verlässlichen Planzeiten aus den
// Buchungsdaten plus Hinweis, Live-Status über Flightradar24/Ryanair-App zu
// holen. So ist das Interface vorbereitet, ein späterer Key-Dienst kann
// eingesteckt werden (siehe OpenSkyProvider / index.ts).
// =============================================================================
import type { FlightStatusProvider, FlightStatus } from './FlightStatusProvider'
import type { Flight } from '@/data/types'

export class ScheduledTimeProvider implements FlightStatusProvider {
  readonly name = 'Planzeiten'

  async fetchStatus(flight: Flight): Promise<FlightStatus> {
    // Keine Netzabhängigkeit: Planzeiten kommen aus den Buchungsdaten.
    const now = Date.now()
    const dep = new Date(flight.departureAt).getTime()
    const arr = new Date(flight.arrivalAt).getTime()

    let state: FlightStatus['state'] = 'scheduled'
    let message = 'Geplant laut Buchung — Live-Status via Flightradar24/Ryanair-App.'

    if (now >= arr) {
      state = 'arrived'
      message = 'Ankunft geplant erfolgt (Live-Bestätigung via Flightradar24).'
    } else if (now >= dep) {
      state = 'enroute'
      message = 'Abflug geplant erfolgt — Live-Position via Flightradar24.'
    }

    return {
      flightNumber: flight.flightNumber,
      state,
      message,
      fetchedAt: now,
      source: this.name,
    }
  }
}
