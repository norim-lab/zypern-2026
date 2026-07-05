// =============================================================================
// OpenMeteoMarineProvider.ts — keyless Marine- + Forecast-Daten via Open-Meteo.
//
// v0.3 (Performance): Batch-Support. Open-Meteo nimmt kommagetrennte latitude/
// longitude und liefert die Antwort als Array in gleicher Reihenfolge. So werden
// statt 13 Einzel-Requests (Strände-Tab) nur noch 2 Calls gemacht (1 Marine +
// 1 Forecast). Robustheit: fetchWithTimeout (10 s + Retry) + Validierungs-Guards,
// Teilfehler werden toleriert (Werte dann 0/leer — nie Crash).
// =============================================================================
import type { MarineProvider, BeachConditions } from './MarineProvider'
import type { LatLng } from '@/lib/geo'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import { asNumber, getPath } from '@/lib/validation'

interface MarineEntry {
  current?: { sea_surface_temperature?: number; wave_height?: number }
}
interface ForecastEntry {
  current?: { temperature_2m?: number; wind_speed_10m?: number }
  daily?: { uv_index_max?: number[]; sunset?: string[] }
}

export class OpenMeteoMarineProvider implements MarineProvider {
  readonly name = 'Open-Meteo Marine'

  async fetch(point: LatLng): Promise<BeachConditions> {
    const [single] = await this.fetchBatch([point])
    return (
      single ?? {
        lat: point.lat,
        lon: point.lon,
        tempWater: 0,
        waveHeight: 0,
        tempAir: 0,
        uvIndex: 0,
        windSpeed: 0,
        sunset: '',
      }
    )
  }

  async fetchBatch(points: LatLng[]): Promise<BeachConditions[]> {
    if (points.length === 0) return []

    const lats = points.map((p) => p.lat).join(',')
    const lons = points.map((p) => p.lon).join(',')
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lons}&current=sea_surface_temperature,wave_height&timezone=Asia/Nicosia`
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,wind_speed_10m&daily=uv_index_max,sunset&timezone=Asia/Nicosia&forecast_days=1`

    // Beide Endpoints parallel; Teilfehler werden toleriert (Werte dann 0).
    const [marineData, forecastData] = await Promise.all([
      safeJson<MarineEntry | MarineEntry[]>(marineUrl),
      safeJson<ForecastEntry | ForecastEntry[]>(forecastUrl),
    ])

    const marineArr: MarineEntry[] = Array.isArray(marineData) ? marineData : marineData ? [marineData] : []
    const forecastArr: ForecastEntry[] = Array.isArray(forecastData) ? forecastData : forecastData ? [forecastData] : []

    return points.map((p, i) => ({
      lat: p.lat,
      lon: p.lon,
      tempWater: asNumber(getPath(marineArr[i], ['current', 'sea_surface_temperature'])) ?? 0,
      waveHeight: asNumber(getPath(marineArr[i], ['current', 'wave_height'])) ?? 0,
      tempAir: asNumber(getPath(forecastArr[i], ['current', 'temperature_2m'])) ?? 0,
      uvIndex: asNumber(getPath(forecastArr[i], ['daily', 'uv_index_max', 0])) ?? 0,
      windSpeed: asNumber(getPath(forecastArr[i], ['current', 'wind_speed_10m'])) ?? 0,
      sunset: (getPath(forecastArr[i], ['daily', 'sunset', 0]) as string | undefined) ?? '',
    }))
  }
}

/** Sicheres fetch+JSON mit Timeout/Retry; null bei jedem Fehler (kein Crash). */
async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}
