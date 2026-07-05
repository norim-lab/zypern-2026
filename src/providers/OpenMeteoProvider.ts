// =============================================================================
// OpenMeteoProvider.ts — keyless Wetter-Provider über Open-Meteo.
// Kostenlos, kein API-Key nötig. Liefert aktuelle Werte + 7-Tage-Vorschau
// inkl. UV-Index. Zeitzonen-Konvertierung übernimmt die API (Asia/Nicosia).
// =============================================================================
import type { WeatherProvider, WeatherData } from './WeatherProvider'
import type { WeatherLocation } from '@/data/types'

/** Roher Open-Meteo-Response (nur die Felder, die wir abfragen). */
interface OpenMeteoResponse {
  current: {
    time: string
    temperature_2m: number
    weather_code: number
    wind_speed_10m: number
  }
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
    uv_index_max: number[]
  }
}

export class OpenMeteoProvider implements WeatherProvider {
  readonly name = 'Open-Meteo'

  async fetch(location: WeatherLocation): Promise<WeatherData> {
    const params = new URLSearchParams({
      latitude: String(location.lat),
      longitude: String(location.lon),
      current: 'temperature_2m,weather_code,wind_speed_10m',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,uv_index_max',
      timezone: location.timezone,
      forecast_days: '7',
    })
    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Open-Meteo Fehler ${res.status}: ${res.statusText}`)
    }
    const data = (await res.json()) as OpenMeteoResponse

    const daily = data.daily.time.map((date, i) => ({
      date,
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      weatherCode: data.daily.weather_code[i],
      uvIndexMax: data.daily.uv_index_max[i],
    }))

    return {
      location,
      current: {
        time: data.current.time,
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        windSpeed: data.current.wind_speed_10m,
      },
      daily,
    }
  }
}
