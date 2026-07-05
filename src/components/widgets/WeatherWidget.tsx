// WeatherWidget.tsx — Aktuelles Wetter + 7-Tage-Vorschau + UV-Index.
// Standort über Props umschaltbar (Aradippou / Weeze).
import { useState } from 'react'
import { useWeather } from '@/hooks/useWeather'
import { weatherLocations } from '@/data/tripData'
import { WeatherIcon } from '@/components/ui/WeatherIcon'
import { RefreshBar } from '@/components/layout/RefreshBar'
import { describeUvIndex } from '@/lib/weatherCodes'
import type { WeatherLocation } from '@/data/types'

export function WeatherWidget() {
  // Aktiven Standort im localStorage merken (Default: Aradippou).
  const [locationIndex, setLocationIndex] = useState<number>(() => {
    const saved = Number(localStorage.getItem('zyp2026:weather-loc'))
    return Number.isFinite(saved) && saved >= 0 && saved < weatherLocations.length
      ? saved
      : 0
  })
  const location: WeatherLocation = weatherLocations[locationIndex]
  const { data, loading, error, updatedAt, refresh } = useWeather(location)

  function selectLocation(idx: number) {
    setLocationIndex(idx)
    localStorage.setItem('zyp2026:weather-loc', String(idx))
  }

  return (
    <section className="card-base">
      {/* Standort-Umschalter */}
      <div className="mb-3 flex flex-wrap gap-2">
        {weatherLocations.map((loc, idx) => (
          <button
            key={loc.name}
            onClick={() => selectLocation(idx)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              idx === locationIndex
                ? 'bg-zypern-blue text-white'
                : 'bg-zypern-blue-light text-zypern-blue-dark hover:bg-sky-100 dark:bg-slate-700 dark:text-sky-200'
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>

      {data ? (
        <>
          {/* Aktuelle Werte */}
          <div className="flex items-center justify-between">
            <WeatherIcon code={data.current.weatherCode} />
            <div className="text-right">
              <div className="text-4xl font-extrabold text-zypern-blue dark:text-sky-300">
                {Math.round(data.current.temperature)}°C
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                💨 {Math.round(data.current.windSpeed)} km/h
              </div>
            </div>
          </div>

          {/* UV-Index (wichtig mit Kindern!) */}
          {data.daily[0] && (
            <p className="mt-2 text-xs">
              <span className="font-semibold">UV-Index heute:</span>{' '}
              {data.daily[0].uvIndexMax.toFixed(1)} ·{' '}
              <span className={
                describeUvIndex(data.daily[0].uvIndexMax).risk === 'very-high'
                  ? 'font-semibold text-danger'
                  : 'text-slate-600 dark:text-slate-300'
              }>
                {describeUvIndex(data.daily[0].uvIndexMax).label}
              </span>{' '}
              — Sonnencreme LSF 50+ nicht vergessen!
            </p>
          )}

          {/* 7-Tage-Vorschau kompakt */}
          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {data.daily.map((d) => (
              <div
                key={d.date}
                className="rounded-lg bg-zypern-blue/5 p-1 dark:bg-sky-900/20"
              >
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {new Date(d.date).toLocaleDateString('de-DE', { weekday: 'short' })}
                </div>
                <div className="text-lg" aria-hidden>
                  {describeWeatherEmoji(d.weatherCode)}
                </div>
                <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-100">
                  {Math.round(d.tempMax)}°
                </div>
                <div className="text-[10px] text-slate-400">{Math.round(d.tempMin)}°</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500">{loading ? 'Lade Wetter …' : 'Keine Daten.'}</p>
      )}

      <RefreshBar updatedAt={updatedAt} loading={loading} error={error} onRefresh={refresh} label="Wetter" />
    </section>
  )
}

/** Kompaktes Emoji für die 7-Tage-Vorschau. */
function describeWeatherEmoji(code: number): string {
  // Trick: Wir importieren nicht das ganze Modul hier erneut, sondern nutzen
  // eine kleine Inline-Map für die häufigsten Codes (Kompaktheit in der Vorschau).
  const map: Record<number, string> = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌧️',
    61: '🌦️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '❄️',
    80: '🌦️', 81: '🌧️', 82: '⛈️',
    95: '⛈️', 96: '⛈️', 99: '⛈️',
  }
  return map[code] ?? '🌡️'
}
