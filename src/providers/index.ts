// =============================================================================
// index.ts — Hier werden alle aktiven Provider gebunden.
// Um später z. B. auf eine Edge-Function oder Google Places umzusteigen, nur
// diese Datei anpassen — das UI bleibt unberührt (Dependency-Inversion via
// Interface).
// =============================================================================
import { OpenMeteoProvider } from './OpenMeteoProvider'
import { ScheduledTimeProvider } from './ScheduledTimeProvider'
import { OpenMeteoMarineProvider } from './OpenMeteoMarineProvider'
import { RssProxyNewsProvider } from './RssProxyNewsProvider'
import { RssProxyEventsProvider } from './RssProxyEventsProvider'
import { NoopRestaurantProvider } from './RestaurantProvider'
import type { WeatherProvider } from './WeatherProvider'
import type { FlightStatusProvider } from './FlightStatusProvider'
import type { MarineProvider } from './MarineProvider'
import type { NewsProvider } from './NewsProvider'
import type { EventsProvider } from './EventsProvider'
import type { RestaurantProvider } from './RestaurantProvider'

// v0.1 — Wetter & Flugstatus
export const weatherProvider: WeatherProvider = new OpenMeteoProvider()
export const flightStatusProvider: FlightStatusProvider = new ScheduledTimeProvider()

// v0.2 — Entdecken
export const marineProvider: MarineProvider = new OpenMeteoMarineProvider()
export const newsProvider: NewsProvider = new RssProxyNewsProvider()
export const eventsProvider: EventsProvider = new RssProxyEventsProvider()
export const restaurantProvider: RestaurantProvider = new NoopRestaurantProvider()

// Typ-Reexports
export type { WeatherProvider, WeatherData, CurrentWeather, DailyForecast } from './WeatherProvider'
export type {
  FlightStatusProvider,
  FlightStatus,
  FlightState,
} from './FlightStatusProvider'
export type { MarineProvider, BeachConditions } from './MarineProvider'
export type { NewsProvider, NewsResult } from './NewsProvider'
export type { EventsProvider, EventsResult } from './EventsProvider'
export type { RestaurantProvider, RestaurantInfo } from './RestaurantProvider'
