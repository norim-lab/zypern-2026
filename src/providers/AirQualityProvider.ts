// =============================================================================
// AirQualityProvider.ts — Open-Meteo Air Quality API (v0.5 §5).
// Keyless, wie das Wetter. PM2.5/PM10/dust/ozone/uv_index für Ampel + Saharastaub.
// =============================================================================
import type { LatLng } from '@/lib/geo'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import { asNumber, getPath } from '@/lib/validation'

export interface AirQualityData {
  /** PM2.5 Tagesmittel (µg/m³) */
  pm25: number
  /** PM10 Tagesmittel (µg/m³) */
  pm10: number
  /** Saharastaub (dust, µg/m³) — Tagespeak */
  dust: number
  /** Ozon (µg/m³) */
  ozone: number
  /** UV-Index Tagespeak */
  uvIndex: number
  /** Stündliche Werte für Detailansicht */
  hourly: { time: string; pm25: number; pm10: number; dust: number }[]
}

export interface AirQualityProvider {
  readonly name: string
  fetch(point: LatLng): Promise<AirQualityData>
}

/** EU-Grenzwert-Ampel für PM2.5. */
export function pm25Level(pm25: number): 'green' | 'yellow' | 'red' {
  if (pm25 <= 15) return 'green' // WHO-Richtwert
  if (pm25 <= 25) return 'yellow' // EU-Grenzwert
  return 'red'
}

/** EU-Grenzwert-Ampel für PM10. */
export function pm10Level(pm10: number): 'green' | 'yellow' | 'red' {
  if (pm10 <= 30) return 'green'
  if (pm10 <= 50) return 'yellow'
  return 'red'
}

/** Saharastaub-Schwelle (dust µg/m³) — ab hier Warnung. */
export const DUST_WARNING_THRESHOLD = 50

export class OpenMeteoAirQualityProvider implements AirQualityProvider {
  readonly name = 'Open-Meteo Air Quality'

  async fetch(point: LatLng): Promise<AirQualityData> {
    const params = new URLSearchParams({
      latitude: String(point.lat),
      longitude: String(point.lon),
      hourly: 'pm10,pm2_5,dust,ozone,uv_index',
      timezone: 'Asia/Nicosia',
    })
    const res = await fetchWithTimeout(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`)
    if (!res.ok) throw new Error(`Air Quality HTTP ${res.status}`)
    const data = await res.json()

    const times: string[] = (getPath(data, ['hourly', 'time']) as string[]) ?? []
    const pm25h: number[] = (getPath(data, ['hourly', 'pm2_5']) as number[]) ?? []
    const pm10h: number[] = (getPath(data, ['hourly', 'pm10']) as number[]) ?? []
    const dusth: number[] = (getPath(data, ['hourly', 'dust']) as number[]) ?? []
    const ozoneh: number[] = (getPath(data, ['hourly', 'ozone']) as number[]) ?? []
    const uvh: number[] = (getPath(data, ['hourly', 'uv_index']) as number[]) ?? []

    const hourly = times.map((time, i) => ({
      time,
      pm25: asNumber(pm25h[i]) ?? 0,
      pm10: asNumber(pm10h[i]) ?? 0,
      dust: asNumber(dusth[i]) ?? 0,
    }))

    // Tageswerte: Mittel (PM) bzw. Peak (dust, ozone, uv).
    const avg = (arr: number[]) => arr.filter((n) => !isNaN(n)).reduce((a, b) => a + b, 0) / Math.max(1, arr.length)
    const peak = (arr: number[]) => Math.max(0, ...arr.filter((n) => !isNaN(n)))

    return {
      pm25: avg(pm25h),
      pm10: avg(pm10h),
      dust: peak(dusth),
      ozone: peak(ozoneh),
      uvIndex: peak(uvh),
      hourly,
    }
  }
}
