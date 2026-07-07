// =============================================================================
// recommendations.ts — „Was machen wir heute?" — reine Logik, kein API (v0.5 §10).
// Erzeugt 3 Vorschläge aus vorhandenen Daten (Wetter, Strände, Events, Datum).
// Gut kommentiert und leicht erweiterbar.
// =============================================================================
import type { HourlyForecast, Beach, ManualEvent } from '@/data/types'
import type { WithDistance } from '@/hooks/useDistance'

export interface Recommendation {
  icon: string
  title: string
  detail: string
  /** Optional: Navigations-/Maps-Link */
  url?: string
}

export interface RecommendationInput {
  /** Stundenverlauf (für Temperatur/UV) */
  hourly?: HourlyForecast[]
  /** Tages-Maximaltemperatur */
  tempMax?: number
  /** Sortierte Strände (mit Marine-Daten in conditions) */
  beaches?: { beach: WithDistance<Beach>; waveHeight?: number; windSpeed?: number }[]
  /** Kommende Events */
  events?: ManualEvent[]
  /** „Jetzt" (für Testbarkeit) */
  now?: Date
}

/**
 * Erzeugt bis zu 3 Vorschläge für den Tag — datengetrieben, fallspezifisch.
 */
export function recommend(input: RecommendationInput): Recommendation[] {
  const now = input.now ?? new Date()
  const out: Recommendation[] = []
  const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/Nicosia' }).format(now).toLowerCase()
  const tempMax = input.tempMax
  const hourly = input.hourly ?? []

  // UV-Spitze + Uhrzeit für Strandzeit-Empfehlung.
  const uvPeak = hourly.length > 0
    ? hourly.reduce((max, h) => (h.uvIndex > max.uvIndex ? h : max), hourly[0])
    : null

  // Regel 1: Hitzewelle (≥ 38 °C) → Troodos/Pool/Indoor.
  if (tempMax !== undefined && tempMax >= 38) {
    out.push({
      icon: '🏔️',
      title: 'Troodos-Berge oder Pool',
      detail: `Heute ${Math.round(tempMax)} °C — zu heiß für Strand. Ab in die Höhenlage (kühler) oder Pool-Vormittag, ab 16 Uhr wird's erträglicher.`,
    })
  }

  // Regel 2: Ruhiger Strand, falls Wellen + Wind ok.
  if (tempMax === undefined || tempMax < 38) {
    const calm = (input.beaches ?? [])
      .filter((b) => (b.waveHeight ?? 99) < 0.5 && (b.windSpeed ?? 99) < 25)
      .sort((a, b) => a.beach.km - b.beach.km)[0]
    if (calm) {
      const bestWindow = uvPeak && uvPeak.uvIndex >= 8 ? 'erst ab 16 Uhr' : 'auch vormittags'
      out.push({
        icon: '🏖️',
        title: `Strand: ${calm.beach.item.name}`,
        detail: `Ruhiges Meer (${calm.waveHeight?.toFixed(1)} m Welle, ${Math.round(calm.windSpeed ?? 0)} km/h Wind), ${calm.beach.driveMin} min entfernt. Strandzeit ${bestWindow}.`,
        url: `https://www.google.com/maps/dir/?api=1&destination=${calm.beach.item.lat},${calm.beach.item.lon}`,
      })
    }
  }

  // Regel 3: Samstag → Wochenmarkt.
  if (day === 'sat') {
    out.push({
      icon: '🛍️',
      title: 'Wochenmarkt Larnaca Agora',
      detail: 'Samstagvormittag — frisches Obst, Gemüse, locale Spezialitäten. Früh da sein!',
      url: 'https://www.google.com/maps/search/?api=1&query=Larnaca+Agora+Market',
    })
  }

  // Regel 4: Event heute/morgen.
  const todayMs = now.getTime()
  const tomorrowMs = todayMs + 24 * 3600_000
  const nextEvent = (input.events ?? []).find((e) => {
    const eMs = new Date(e.date).getTime()
    return eMs >= todayMs - 12 * 3600_000 && eMs <= tomorrowMs
  })
  if (nextEvent) {
    out.push({
      icon: '🎉',
      title: `Event: ${nextEvent.title}`,
      detail: nextEvent.locationName ? `Heute/morgen in ${nextEvent.locationName}.` : 'Heute oder morgen.',
      url: nextEvent.url,
    })
  }

  // Fallback, falls weniger als 1 Vorschlag: Pool-Orientierung.
  if (out.length === 0) {
    out.push({
      icon: '🏊',
      title: 'Pool-Tag am Haus',
      detail: 'Kein klarer Favorit — entspannter Pool-Vormittag, am Nachmittag Ausflug planen.',
    })
  }

  return out.slice(0, 3)
}
