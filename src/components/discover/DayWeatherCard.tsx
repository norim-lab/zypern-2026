// DayWeatherCard.tsx — Tageswetter-Detail direkt auf dem Dashboard (v0.5 §1).
// Aktuelle + gefühlte Temp groß, Stundenverlauf, Min/Max, UV-Spitze, Sonnenzeiten.
import { Card } from '@/components/ui/Card'
import { WeatherIcon } from '@/components/ui/WeatherIcon'
import { HourlyForecast } from '@/components/discover/HourlyForecast'
import { HomeSunLine } from '@/components/widgets/HomeSunLine'
import { formatDualTime } from '@/lib/format'
import { CY_TZ } from '@/lib/timezone'
import type { HourlyForecast as HourlyPoint, SunTimes } from '@/data/types'
import type { CurrentWeather } from '@/providers'

export interface DayWeatherCardProps {
  current: CurrentWeather
  hourly: HourlyPoint[]
  sun: SunTimes
  tempMin: number
  tempMax: number
}

export function DayWeatherCard({ current, hourly, sun, tempMin, tempMax }: DayWeatherCardProps) {
  // „Heute"-Filterung nach Datum in Asia/Nicosia (nicht Geräte-Lokalzeit!).
  const cyDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: CY_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  const todayHours = hourly.filter((h) => h.time.startsWith(cyDateStr))

  // Aktuelle Stunde = die „jetzt" am nächsten liegende Stunde.
  const nowMs = Date.now()
  const currentHour = todayHours.length > 0
    ? todayHours.reduce((best, h) =>
        Math.abs(new Date(h.time).getTime() - nowMs) < Math.abs(new Date(best.time).getTime() - nowMs) ? h : best,
      todayHours[0])
    : null

  const uvPeak = todayHours.length > 0
    ? todayHours.reduce((max, h) => (h.uvIndex > max.uvIndex ? h : max), todayHours[0])
    : null
  const uvPeakTime = uvPeak ? new Date(uvPeak.time).getTime() : 0

  return (
    <Card title="Wetter heute · Aradippou" icon="🌤️">
      {/* Aktuelle Werte groß */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-extrabold text-zypern-blue dark:text-sky-300">
            {Math.round(current.temperature)}°C
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            gefühlt {Math.round(currentHour?.apparentTemp ?? current.temperature)}°C · 💨 {Math.round(current.windSpeed)} km/h
          </div>
        </div>
        <WeatherIcon code={current.weatherCode} />
      </div>

      {/* Min/Max + UV-Spitze */}
      <div className="mt-2 flex justify-between text-xs">
        <span>📊 {Math.round(tempMin)}° / {Math.round(tempMax)}°</span>
        {uvPeak && uvPeak.uvIndex >= 6 && (
          <span className="font-medium text-warn dark:text-amber-300">
            UV {Math.round(uvPeak.uvIndex)} um {new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: CY_TZ }).format(uvPeakTime)}
          </span>
        )}
      </div>
      {uvPeak && uvPeak.uvIndex >= 8 && (
        <p className="mt-1 text-xs text-warn dark:text-amber-300">
          ☀️ UV {Math.round(uvPeak.uvIndex)} — Strand erst ab 16 Uhr!
        </p>
      )}

      {/* Stundenverlauf (horizontal scrollbar) */}
      <div className="mt-3">
        <HourlyForecast points={todayHours.length > 0 ? todayHours : hourly} />
      </div>

      {/* Sonnenauf-/untergang in Doppelzeit */}
      {sun.sunriseMs > 0 && (
        <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>🌅 {formatDualTime(sun.sunriseMs)}</span>
          <span>🌇 {formatDualTime(sun.sunsetMs)}</span>
        </div>
      )}
      {/* v0.7: Heimatort-Sonnenzeiten ergänzend darunter. */}
      <div className="mt-1">
        <HomeSunLine />
      </div>
    </Card>
  )
}
