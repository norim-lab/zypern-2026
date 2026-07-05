// =============================================================================
// MarineProvider.ts — Einheitliches Interface für Strand-/Meeresdaten.
// Implementierungen sind austauschbar. v0.2 nutzt Open-Meteo Marine (keyless).
// =============================================================================
import type { LatLng } from '@/lib/geo'

/** Live-Bedingungen an einem Strand. */
export interface BeachConditions {
  /** Position */
  lat: number
  lon: number
  /** Wassertemperatur in °C */
  tempWater: number
  /** Wellenhöhe in m */
  waveHeight: number
  /** Lufttemperatur in °C (vom Forecast-Endpoint) */
  tempAir: number
  /** UV-Index (Tagesmax, vom Forecast-Endpoint) */
  uvIndex: number
  /** Windgeschwindigkeit in km/h (vom Forecast-Endpoint) */
  windSpeed: number
  /** Sonnenuntergang ISO (vom Forecast-Endpoint) */
  sunset: string
}

/** Einheitliches Provider-Interface für Strände. */
export interface MarineProvider {
  readonly name: string
  /** Liefert aktuelle Meeres- + Wetterbedingungen für einen Punkt. */
  fetch(point: LatLng): Promise<BeachConditions>
  /**
   * v0.3 (Performance): Liefert Bedingungen für VIELE Punkte in EINEM Request.
   * Open-Meteo unterstützt kommagetrennte latitude/longitude; Antwort = Array
   * in gleicher Reihenfolge. Reduziert 13 Einzel-Calls auf 1 (Marine + 1 Forecast).
   * Default-Implementierung fällt auf Einzelfetches zurück.
   */
  fetchBatch(points: LatLng[]): Promise<BeachConditions[]>
}
