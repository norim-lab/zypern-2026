// =============================================================================
// index.ts — Hier wird der aktive Weather- und FlightStatus-Provider gebunden.
// Um später z. B. auf OpenSky umzusteigen, nur diese Datei anpassen — das UI
// bleibt unberührt (Dependency-Inversion via Interface).
// =============================================================================
import { OpenMeteoProvider } from './OpenMeteoProvider'
import { ScheduledTimeProvider } from './ScheduledTimeProvider'
import type { WeatherProvider } from './WeatherProvider'
import type { FlightStatusProvider } from './FlightStatusProvider'

/** Aktiver Wetter-Provider (Open-Meteo, keyless). */
export const weatherProvider: WeatherProvider = new OpenMeteoProvider()

/** Aktiver Flugstatus-Provider (Planzeiten-Default; OpenSky später einklinkbar). */
export const flightStatusProvider: FlightStatusProvider = new ScheduledTimeProvider()

export type { WeatherProvider, WeatherData, CurrentWeather, DailyForecast } from './WeatherProvider'
export type {
  FlightStatusProvider,
  FlightStatus,
  FlightState,
} from './FlightStatusProvider'
