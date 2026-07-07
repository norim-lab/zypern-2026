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
import { NoopTranslationProvider, ApiTranslationProvider } from './TranslationProvider'
import { RssProxyOffersProvider } from './RssProxyOffersProvider'
import { OpenMeteoHourlyProvider } from './WeatherHourlyProvider'
import { GooglePlacesRestaurantProvider } from './PlacesRestaurantProvider'
import { HermesFlightStatusProvider } from './HermesFlightStatusProvider'
import { CyprusOnDutyPharmacyProvider } from './PharmacyProvider'
import { CyprusFuelPriceProvider } from './FuelPriceProvider'
import { OpenMeteoAirQualityProvider } from './AirQualityProvider'
import { EmscEarthquakeProvider } from './EarthquakeProvider'
import type { WeatherProvider } from './WeatherProvider'
import type { FlightStatusProvider } from './FlightStatusProvider'
import type { MarineProvider } from './MarineProvider'
import type { NewsProvider } from './NewsProvider'
import type { EventsProvider } from './EventsProvider'
import type { RestaurantProvider } from './RestaurantProvider'
import type { OffersProvider } from './OffersProvider'
import type { TranslationProvider } from './TranslationProvider'
import type { WeatherHourlyProvider } from './WeatherHourlyProvider'
import type { PlacesRestaurantProvider } from './PlacesRestaurantProvider'

// v0.1 — Wetter & Flugstatus
export const weatherProvider: WeatherProvider = new OpenMeteoProvider()
export const flightStatusProvider: FlightStatusProvider = new ScheduledTimeProvider()

// v0.2 — Entdecken
export const marineProvider: MarineProvider = new OpenMeteoMarineProvider()
export const newsProvider: NewsProvider = new RssProxyNewsProvider()
export const eventsProvider: EventsProvider = new RssProxyEventsProvider()
export const restaurantProvider: RestaurantProvider = new NoopRestaurantProvider()

// v0.4 — Angebote, Stunden-Wetter, Übersetzung, Places (optional via Key)
export const offersProvider: OffersProvider = new RssProxyOffersProvider()
export const hourlyWeatherProvider: WeatherHourlyProvider = new OpenMeteoHourlyProvider()
export const translationProvider: TranslationProvider = makeTranslationProvider()
export const placesRestaurantProvider: PlacesRestaurantProvider = new GooglePlacesRestaurantProvider()

// v0.5 — Live-Flugstatus, Apotheken, Tankpreise, Luftqualität, Erdbeben
export const hermesFlightProvider = new HermesFlightStatusProvider()
export const pharmacyProvider = new CyprusOnDutyPharmacyProvider()
export const fuelPriceProvider = new CyprusFuelPriceProvider()
export const airQualityProvider = new OpenMeteoAirQualityProvider()
export const earthquakeProvider = new EmscEarthquakeProvider()

/** Übersetzungs-Provider: API-Variante, falls URL+Key in .env; sonst Noop. */
function makeTranslationProvider(): TranslationProvider {
  const url = import.meta.env.VITE_TRANSLATE_API_URL as string | undefined
  const key = import.meta.env.VITE_TRANSLATE_API_KEY as string | undefined
  if (url) return new ApiTranslationProvider(url, key)
  return new NoopTranslationProvider()
}

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
export type { OffersProvider, OffersResult } from './OffersProvider'
export type { TranslationProvider, TranslateLinks } from './TranslationProvider'
export type { WeatherHourlyProvider, HourlyWeather } from './WeatherHourlyProvider'
export type { PlacesRestaurantProvider } from './PlacesRestaurantProvider'
