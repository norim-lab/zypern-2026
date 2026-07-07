// Dashboard.tsx — Startscreen (v0.5).
// Reihenfolge: Warnbanner → Countdown/Flugstatus → Tageswetter-Detail →
// „Was machen wir heute?" → Demnächst-Events → Zuhause-Wetter → Schnellzugriffe.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCountdown } from '@/hooks/useCountdown'
import { useWeather } from '@/hooks/useWeather'
import { useWeatherHourly } from '@/hooks/useWeatherHourly'
import { useAirQuality } from '@/hooks/useAirQuality'
import { useEarthquakes } from '@/hooks/useEarthquakes'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useNews } from '@/hooks/useNews'
import { Countdown } from '@/components/ui/Countdown'
import { WeatherWidget } from '@/components/widgets/WeatherWidget'
import { FlightCard } from '@/components/widgets/FlightCard'
import { QuickActions } from '@/components/widgets/QuickActions'
import { TodoHintCard } from '@/components/widgets/TodoHintCard'
import { UpcomingEventsCard } from '@/components/widgets/UpcomingEventsCard'
import { HomeWeatherWidget } from '@/components/widgets/HomeWeatherWidget'
import { RecommendationsCard } from '@/components/widgets/RecommendationsCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { HeatBanner } from '@/components/discover/HeatBanner'
import { DayWeatherCard } from '@/components/discover/DayWeatherCard'
import { AirQualityBadge } from '@/components/discover/AirQualityBadge'
import { FireBanner } from '@/components/discover/FireBanner'
import { EarthquakeCard } from '@/components/discover/EarthquakeCard'
import { WarningCard } from '@/components/ui/WarningCard'
import { checklists, outboundFlight, returnFlight, accommodation, weatherLocations } from '@/data/tripData'
import { formatDualTime } from '@/lib/format'

function isTravelDay(iso: string): boolean {
  const t = new Date(iso)
  const n = new Date()
  return t.getDate() === n.getDate() && t.getMonth() === n.getMonth() && t.getFullYear() === n.getFullYear()
}

export function Dashboard() {
  const { target, value } = useCountdown()
  const { data: weather } = useWeather(weatherLocations[0])
  const { data: hourlyData } = useWeatherHourly({ lat: accommodation.lat, lon: accommodation.lon })
  const { data: airQuality } = useAirQuality({ lat: accommodation.lat, lon: accommodation.lon })
  const { quakes } = useEarthquakes({ lat: accommodation.lat, lon: accommodation.lon })
  const { relevant: relevantNews } = useNews()
  const navigate = useNavigate()
  const showOutbound = isTravelDay(outboundFlight.departureAt)
  const showReturn = isTravelDay(returnFlight.departureAt)

  // Strandtasche.
  const beachBag = checklists.find((c) => c.id === 'strandtasche')!
  const [bagState, setBagState] = useLocalStorage<Record<string, boolean>>(`zyp2026:checklist:${beachBag.id}`, {})
  const [bagOpen, setBagOpen] = useState(false)

  const sunsetMs = hourlyData?.sun.sunsetMs ?? 0

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Warnbanner (Hitze/Saharastaub/Waldbrand) ganz oben. */}
      {weather?.daily[0] && (
        <HeatBanner tempMax={weather.daily[0].tempMax} uvIndexMax={weather.daily[0].uvIndexMax} />
      )}
      {airQuality && <AirQualityBadge data={airQuality} />}
      <FireBanner newsTitles={relevantNews.map((n) => n.title)} />

      <Countdown target={target} value={value} />

      {/* Flugstatus an Reisetagen prominent. */}
      {showOutbound && <FlightCard flight={outboundFlight} kind="Hinflug" />}
      {showReturn && <FlightCard flight={returnFlight} kind="Rückflug" />}

      {/* Tageswetter-Detail direkt auf dem Dashboard (v0.5 §1). */}
      {weather && hourlyData && (
        <DayWeatherCard
          current={weather.current}
          hourly={hourlyData.hourly}
          sun={hourlyData.sun}
          tempMin={weather.daily[0]?.tempMin ?? 0}
          tempMax={weather.daily[0]?.tempMax ?? 0}
        />
      )}

      {/* „Was machen wir heute?" (v0.5 §10). */}
      <RecommendationsCard />

      {/* Erdbeben-Info (dezent, nur bei M ≥ 4). */}
      <EarthquakeCard quakes={quakes} />

      {/* Sonnenuntergang + goldene Stunde — tappbar. */}
      {sunsetMs > 0 && (
        <button type="button" onClick={() => navigate('/wetter')} className="block w-full text-left">
          <WarningCard level="info" title="Sonne" icon="🌅">
            <p>Sonnenuntergang: <strong>{formatDualTime(sunsetMs)}</strong>.</p>
            <p className="mt-0.5">🌅 Goldene Stunde ab {formatDualTime(sunsetMs - 3600_000)}.</p>
          </WarningCard>
        </button>
      )}

      {/* 7-Tage-Vorschau kompakt (bestehend). */}
      <WeatherWidget />

      {/* Demnächst-Events. */}
      <UpcomingEventsCard />

      {/* Zuhause-Wetter. */}
      <HomeWeatherWidget />

      <QuickActions />

      {/* Strandtasche */}
      <Card title="🏖️ Strandtasche">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {beachBag.items.filter((i) => bagState[i.id]).length} / {beachBag.items.length} gepackt · Reset pro Ausflug.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setBagOpen((v) => !v)} className="!min-h-0 !py-1.5 text-xs">
              {bagOpen ? 'Verbergen' : 'Anzeigen'}
            </Button>
            <Button variant="ghost" onClick={() => setBagState({})} className="!min-h-0 !py-1.5 text-xs">↺ Reset</Button>
          </div>
        </div>
        {bagOpen && (
          <ul className="mt-2 space-y-1">
            {beachBag.items.map((item) => {
              const done = !!bagState[item.id]
              return (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <input type="checkbox" checked={done} onChange={() => setBagState((p) => ({ ...p, [item.id]: !p[item.id] }))} className="h-4 w-4 accent-ok" />
                    <span className={`text-sm ${done ? 'text-slate-400 line-through' : ''}`}>{item.label}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <TodoHintCard />
    </div>
  )
}
