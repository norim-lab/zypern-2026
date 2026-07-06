// =============================================================================
// WeatherHourlyProvider.ts — Stunden-Wetter + Sonnenzeiten (v0.4).
// Nutzt Open-Meteo hourly=temperature_2m,apparent_temperature,precipitation_probability,
// uv_index,wind_speed_10m + daily=sunrise,sunset. Keyless.
// =============================================================================
import type { HourlyForecast, SunTimes } from '@/data/types'
import type { LatLng } from '@/lib/geo'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import { asNumber, getPath } from '@/lib/validation'

/** Ergebnis: Stundenverlauf + Sonnenzeiten eines Standorts. */
export interface HourlyWeather {
  hourly: HourlyForecast[]
  sun: SunTimes
}

export interface WeatherHourlyProvider {
  readonly name: string
  fetch(point: LatLng, days?: number): Promise<HourlyWeather>
}

export class OpenMeteoHourlyProvider implements WeatherHourlyProvider {
  readonly name = 'Open-Meteo Hourly'

  async fetch(point: LatLng, days = 2): Promise<HourlyWeather> {
    const params = new URLSearchParams({
      latitude: String(point.lat),
      longitude: String(point.lon),
      hourly: 'temperature_2m,apparent_temperature,precipitation_probability,uv_index,wind_speed_10m',
      daily: 'sunrise,sunset',
      timezone: 'Asia/Nicosia',
      forecast_days: String(days),
    })
    const res = await fetchWithTimeout(
      `https://api.open-meteo.com/v1/forecast?${params}`,
    )
    if (!res.ok) throw new Error(`Hourly HTTP ${res.status}`)
    const data = await res.json()

    const times: string[] = (getPath(data, ['hourly', 'time']) as string[]) ?? []
    const temp: number[] = (getPath(data, ['hourly', 'temperature_2m']) as number[]) ?? []
    const app: number[] = (getPath(data, ['hourly', 'apparent_temperature']) as number[]) ?? []
    const precip: number[] = (getPath(data, ['hourly', 'precipitation_probability']) as number[]) ?? []
    const uv: number[] = (getPath(data, ['hourly', 'uv_index']) as number[]) ?? []
    const wind: number[] = (getPath(data, ['hourly', 'wind_speed_10m']) as number[]) ?? []

    const hourly: HourlyForecast[] = times.map((time, i) => ({
      time,
      temperature: asNumber(temp[i]) ?? 0,
      apparentTemp: asNumber(app[i]) ?? 0,
      precipProb: asNumber(precip[i]) ?? 0,
      uvIndex: asNumber(uv[i]) ?? 0,
      windSpeed: asNumber(wind[i]) ?? 0,
    }))

    const sunriseIso: string = (getPath(data, ['daily', 'sunrise', 0]) as string) ?? ''
    const sunsetIso: string = (getPath(data, ['daily', 'sunset', 0]) as string) ?? ''
    const sun: SunTimes = {
      sunriseMs: sunriseIso ? Date.parse(sunriseIso) : 0,
      sunsetMs: sunsetIso ? Date.parse(sunsetIso) : 0,
    }

    return { hourly, sun }
  }
}
