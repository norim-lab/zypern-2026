// =============================================================================
// weatherCodes.ts — Übersetzt WMO-Wettercodes (Open-Meteo) in DE-Text + Emoji.
// Quelle der Codes: WMO 4677 / Open-Meteo-Dokumentation.
// =============================================================================

export interface WeatherCodeInfo {
  /** Emoji-Icon */
  emoji: string
  /** Deutsche Beschreibung */
  label: string
}

/** Vollständige WMO-Code-Tabelle (Open-Meteo). */
const WMO_CODES: Record<number, WeatherCodeInfo> = {
  0: { emoji: '☀️', label: 'Klarer Himmel' },
  1: { emoji: '🌤️', label: 'Überwiegend klar' },
  2: { emoji: '⛅', label: 'Teilweise bewölkt' },
  3: { emoji: '☁️', label: 'Bedeckt' },
  45: { emoji: '🌫️', label: 'Nebel' },
  48: { emoji: '🌫️', label: 'Reifnebel' },
  51: { emoji: '🌦️', label: 'Leichter Nieselregen' },
  53: { emoji: '🌦️', label: 'Mäßiger Nieselregen' },
  55: { emoji: '🌧️', label: 'Starker Nieselregen' },
  56: { emoji: '🌧️', label: 'Leichter gefrierender Nieselregen' },
  57: { emoji: '🌧️', label: 'Starker gefrierender Nieselregen' },
  61: { emoji: '🌦️', label: 'Leichter Regen' },
  63: { emoji: '🌧️', label: 'Mäßiger Regen' },
  65: { emoji: '🌧️', label: 'Starker Regen' },
  66: { emoji: '🌧️', label: 'Leichter gefrierender Regen' },
  67: { emoji: '🌧️', label: 'Starker gefrierender Regen' },
  71: { emoji: '🌨️', label: 'Leichter Schneefall' },
  73: { emoji: '🌨️', label: 'Mäßiger Schneefall' },
  75: { emoji: '❄️', label: 'Starker Schneefall' },
  77: { emoji: '🌨️', label: 'Schneegriesel' },
  80: { emoji: '🌦️', label: 'Leichter Regenschauer' },
  81: { emoji: '🌧️', label: 'Mäßiger Regenschauer' },
  82: { emoji: '⛈️', label: 'Heftiger Regenschauer' },
  85: { emoji: '🌨️', label: 'Schneeschauer' },
  86: { emoji: '❄️', label: 'Heftige Schneeschauer' },
  95: { emoji: '⛈️', label: 'Gewitter' },
  96: { emoji: '⛈️', label: 'Gewitter mit leichtem Hagel' },
  99: { emoji: '⛈️', label: 'Gewitter mit starkem Hagel' },
}

/** Liefert die deutsche Beschreibung + Emoji zu einem WMO-Code. */
export function describeWeatherCode(code: number): WeatherCodeInfo {
  return WMO_CODES[code] ?? { emoji: '❓', label: `Unbekannt (Code ${code})` }
}

/** UV-Index als deutsche Bewertung (wichtig mit Kindern!). */
export function describeUvIndex(uv: number): { label: string; risk: 'low' | 'moderate' | 'high' | 'very-high' } {
  if (uv < 3) return { label: 'Niedrig', risk: 'low' }
  if (uv < 6) return { label: 'Mäßig', risk: 'moderate' }
  if (uv < 8) return { label: 'Hoch', risk: 'high' }
  if (uv < 11) return { label: 'Sehr hoch', risk: 'very-high' }
  return { label: 'Extrem', risk: 'very-high' }
}
