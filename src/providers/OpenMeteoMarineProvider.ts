// =============================================================================
// OpenMeteoMarineProvider.ts — keyless Marine- + Forecast-Daten via Open-Meteo.
// Kombiniert zwei Endpoints:
//   1) marine-api.open-meteo.com  → Wassertemperatur + Wellenhöhe (current)
//   2) api.open-meteo.com         → Lufttemp, UV, Wind, Sonnenuntergang (daily)
// =============================================================================
import type { MarineProvider, BeachConditions } from './MarineProvider'
import type { LatLng } from '@/lib/geo'

interface MarineResponse {
  current?: {
    sea_surface_temperature?: number
    wave_height?: number
  }
}
interface ForecastResponse {
  current?: { temperature_2m?: number; wind_speed_10m?: number }
  daily?: { time?: string[]; uv_index_max?: number[]; sunset?: string[] }
}

export class OpenMeteoMarineProvider implements MarineProvider {
  readonly name = 'Open-Meteo Marine'

  async fetch(point: LatLng): Promise<BeachConditions> {
    const marineParams = new URLSearchParams({
      latitude: String(point.lat),
      longitude: String(point.lon),
      current: 'sea_surface_temperature,wave_height',
      timezone: 'Asia/Nicosia',
    })
    const forecastParams = new URLSearchParams({
      latitude: String(point.lat),
      longitude: String(point.lon),
      current: 'temperature_2m,wind_speed_10m',
      daily: 'uv_index_max,sunset',
      timezone: 'Asia/Nicosia',
      forecast_days: '1',
    })

    const [marineRes, forecastRes] = await Promise.all([
      fetch(`https://marine-api.open-meteo.com/v1/marine?${marineParams}`),
      fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams}`),
    ])

    // Marine-Endpoint kann an Landpunkten 400/4xx liefern → fallback 0.
    const marine: MarineResponse = marineRes.ok ? await marineRes.json() : {}
    const forecast: ForecastResponse = forecastRes.ok ? await forecastRes.json() : {}

    return {
      lat: point.lat,
      lon: point.lon,
      tempWater: marine.current?.sea_surface_temperature ?? 0,
      waveHeight: marine.current?.wave_height ?? 0,
      tempAir: forecast.current?.temperature_2m ?? 0,
      uvIndex: forecast.daily?.uv_index_max?.[0] ?? 0,
      windSpeed: forecast.current?.wind_speed_10m ?? 0,
      sunset: forecast.daily?.sunset?.[0] ?? '',
    }
  }
}
