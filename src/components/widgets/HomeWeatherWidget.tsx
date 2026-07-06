// HomeWeatherWidget.tsx — Zuhause-Wetter kompakt (v0.4).
// „Zuhause: 19 °C, Regen · Woche: 16–24 °C". Antippen → WetterDetail mit Tagesverlauf.
import { useNavigate } from 'react-router-dom'
import { WeatherIcon } from '@/components/ui/WeatherIcon'
import { useWeather } from '@/hooks/useWeather'
import { homeLocation } from '@/data/tripData'

export function HomeWeatherWidget() {
  const navigate = useNavigate()
  // Heimatort-Zeitzone Europe/Berlin — eigener WeatherProvider-Aufruf.
  const { data } = useWeather({
    name: homeLocation.name,
    lat: homeLocation.lat,
    lon: homeLocation.lon,
    timezone: 'Europe/Berlin',
  })

  if (!data) {
    return (
      <button
        type="button"
        onClick={() => navigate('/wetter/home')}
        className="card-base w-full text-left"
      >
        <p className="text-sm font-semibold">🏠 Zuhause</p>
        <p className="text-xs text-slate-400">Lade Wetter …</p>
      </button>
    )
  }

  const week = data.daily[0]
  const weekRange = data.daily.slice(0, 7)
  const minWeek = Math.round(Math.min(...weekRange.map((d) => d.tempMin)))
  const maxWeek = Math.round(Math.max(...weekRange.map((d) => d.tempMax)))

  return (
    <button
      type="button"
      onClick={() => navigate('/wetter/home')}
      className="card-base w-full text-left"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            🏠 Zuhause ({homeLocation.name})
          </p>
          <div className="mt-1 text-2xl font-bold text-zypern-blue dark:text-sky-300">
            {Math.round(data.current.temperature)} °C
          </div>
        </div>
        <WeatherIcon code={data.current.weatherCode} />
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Woche: {minWeek}–{maxWeek} °C
      </p>
      {week && (
        <p className="text-[11px] text-slate-400">
          💧 Niederschlag + UV über Detailansicht.
        </p>
      )}
    </button>
  )
}
