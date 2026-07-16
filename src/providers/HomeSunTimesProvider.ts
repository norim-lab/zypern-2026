// =============================================================================
// HomeSunTimesProvider.ts — Sonnenzeiten (Auf-/Untergang) für den Heimatort.
//
// V0.7: Eigener, minimaler Provider, weil der bestehende WeatherHourlyProvider
// die Zeitzone 'Asia/Nicosia' hartkodiert hat. Für Bad Neuenahr brauchen wir
// aber die Zeiten in Europe/Berlin. Dieser Provider fragt EINMAL täglich
// sunrise/sunset ab (keine Stundenwerte, kein Wetter — nur die Sonne).
// Austauschbar nach dem WeatherProvider-Muster.
// =============================================================================
import type { WeatherLocation } from '@/data/types'

/** Sonnenzeiten-Paar (Epoch-Millisekunden, zeitzonen-unabhängig). */
export interface HomeSunTimes {
  sunriseMs: number
  sunsetMs: number
}

export interface HomeSunTimesProvider {
  readonly name: string
  fetch(location: WeatherLocation): Promise<HomeSunTimes | null>
}

/** Roher Open-Meteo-Response (nur sunrise/sunset). */
interface SunResponse {
  daily: { sunrise: string[]; sunset: string[] }
}

export class OpenMeteoHomeSunProvider implements HomeSunTimesProvider {
  readonly name = 'Open-Meteo Sonne (Heimat)'

  async fetch(location: WeatherLocation): Promise<HomeSunTimes | null> {
    const params = new URLSearchParams({
      latitude: String(location.lat),
      longitude: String(location.lon),
      daily: 'sunrise,sunset',
      timezone: location.timezone,
      forecast_days: '1',
    })
    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Open-Meteo Sonne Fehler ${res.status}: ${res.statusText}`)
    }
    const data = (await res.json()) as SunResponse
    const sunriseIso = data.daily.sunrise?.[0]
    const sunsetIso = data.daily.sunset?.[0]
    if (!sunriseIso || !sunsetIso) return null
    return {
      sunriseMs: new Date(sunriseIso).getTime(),
      sunsetMs: new Date(sunsetIso).getTime(),
    }
  }
}
