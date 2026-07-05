// =============================================================================
// WeatherProvider.ts — Einheitliches Interface für Wetter-Dienste.
// Implementierungen (z. B. OpenMeteoProvider) werden über dieses Interface
// ausgetauscht, ohne das UI anzufassen. So lässt sich später z. B. eine
// kostenpflichtige Wetter-API mit Key einklinken.
// =============================================================================
import type { WeatherLocation } from '@/data/types'

/** Aktuelle Wetterlage (Live-Werte). */
export interface CurrentWeather {
  /** Temperatur in °C */
  temperature: number
  /** WMO-Wettercode (siehe weatherCodes.ts) */
  weatherCode: number
  /** Windgeschwindigkeit in km/h */
  windSpeed: number
  /** ISO-Zeitpunkt der Messung */
  time: string
}

/** Ein Tag der 7-Tage-Vorschau. */
export interface DailyForecast {
  /** ISO-Datum */
  date: string
  /** Höchsttemperatur in °C */
  tempMax: number
  /** Tiefsttemperatur in °C */
  tempMin: number
  /** WMO-Wettercode */
  weatherCode: number
  /** Maximaler UV-Index des Tages */
  uvIndexMax: number
}

/** Vollständiges Wetterergebnis eines Standorts. */
export interface WeatherData {
  location: WeatherLocation
  current: CurrentWeather
  daily: DailyForecast[]
}

/** Einheitliches Provider-Interface. */
export interface WeatherProvider {
  /** Eindeutiger Name (z. B. „Open-Meteo"). */
  readonly name: string
  /** Liefert aktuelles Wetter + 7-Tage-Vorschau für einen Standort. */
  fetch(location: WeatherLocation): Promise<WeatherData>
}
