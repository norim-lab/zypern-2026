// =============================================================================
// OpenSkyProvider.ts — Stub für späteren Live-Status über OpenSky Network.
//
// WICHTIG: OpenSky ist nicht mehr keyless nutzbar (Pflicht eines Accounts +
// OAuth-Token, strenge Rate-Limits). Dieser Provider ist therefore in v0.1
// NICHT aktiv. Er skizziert, wie später ein Key-basierter Dienst eingesteckt
// wird — das einheitliche FlightStatusProvider-Interface bleibt stabil.
//
// Aktivierung später:
//   1) In index.ts den aktiven Provider tauschen.
//   2) Token via Umgebungsvariable / Einstellungen injizieren.
// =============================================================================
import type { FlightStatusProvider, FlightStatus } from './FlightStatusProvider'
import type { Flight } from '@/data/types'

export interface OpenSkyConfig {
  /** OAuth2-Token (Basic-AUTH user:password). */
  token?: string
}

export class OpenSkyProvider implements FlightStatusProvider {
  readonly name = 'OpenSky'
  private readonly config: OpenSkyConfig

  constructor(config: OpenSkyConfig = {}) {
    this.config = config
  }

  async fetchStatus(flight: Flight): Promise<FlightStatus> {
    if (!this.config.token) {
      // Kein Token → sauberer Fallback auf Planzeiten-Status.
      return {
        flightNumber: flight.flightNumber,
        state: 'unknown',
        message:
          'OpenSky nicht konfiguriert (Token fehlt). Nutze Planzeiten + Flightradar24.',
        fetchedAt: Date.now(),
        source: this.name,
      }
    }

    // ECHTE IMPLEMENTIERUNG (später):
    //   GET https://opensky-network.org/api/states/all
    //     ?icao24=<aus callsign FR3878>
    //   mit Authorization: Basic <token>.
    //   → Zustand ableiten (enroute / landed / unknown) und zurückgeben.
    //
    // Bis dahin liefert dieser Stub einen Unknown-Status, sodass das UI
    // automatisch auf den in den Buttons angebotenen Flightradar24-Fallback
    // verweist.
    return {
      flightNumber: flight.flightNumber,
      state: 'unknown',
      message: 'OpenSky-Live-Status noch nicht implementiert (v0.1).',
      fetchedAt: Date.now(),
      source: this.name,
    }
  }
}
