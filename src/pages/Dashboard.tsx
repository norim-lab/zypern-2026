// Dashboard.tsx — Startscreen: Countdown, Wetter, Flugstatus, Schnellzugriffe, To-dos.
// v0.2: HeatBanner + Sonnenuntergang + Strandtasche.
// v0.4: + UpcomingEventsCard + HomeWeatherWidget + doppelte Zeitanzeige + goldene Stunde.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCountdown } from '@/hooks/useCountdown'
import { useWeather } from '@/hooks/useWeather'
import { useMarine } from '@/hooks/useMarine'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Countdown } from '@/components/ui/Countdown'
import { WeatherWidget } from '@/components/widgets/WeatherWidget'
import { FlightCard } from '@/components/widgets/FlightCard'
import { QuickActions } from '@/components/widgets/QuickActions'
import { TodoHintCard } from '@/components/widgets/TodoHintCard'
import { UpcomingEventsCard } from '@/components/widgets/UpcomingEventsCard'
import { HomeWeatherWidget } from '@/components/widgets/HomeWeatherWidget'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { HeatBanner } from '@/components/discover/HeatBanner'
import { WarningCard } from '@/components/ui/WarningCard'
import { checklists, outboundFlight, returnFlight, accommodation, weatherLocations } from '@/data/tripData'
import { formatDualTime } from '@/lib/format'

/** Wahr, wenn heute ein Reisetag ist (dann Flugkarte prominent). */
function isTravelDay(iso: string): boolean {
  const t = new Date(iso)
  const n = new Date()
  return t.getDate() === n.getDate() && t.getMonth() === n.getMonth() && t.getFullYear() === n.getFullYear()
}

export function Dashboard() {
  const { target, value } = useCountdown()
  const { data: weather } = useWeather(weatherLocations[0])
  const { data: marine } = useMarine({ lat: accommodation.lat, lon: accommodation.lon })
  const showOutbound = isTravelDay(outboundFlight.departureAt)
  const showReturn = isTravelDay(returnFlight.departureAt)

  // Strandtasche: wiederverwendbare Mini-Checkliste mit Reset.
  const beachBag = checklists.find((c) => c.id === 'strandtasche')!
  const [bagState, setBagState] = useLocalStorage<Record<string, boolean>>(
    `zyp2026:checklist:${beachBag.id}`,
    {},
  )
  const [bagOpen, setBagOpen] = useState(false)
  const navigate = useNavigate()

  // Sonnenuntergang als ms (für doppelte Zeitanzeige + goldene Stunde).
  const sunsetMs = marine?.sunset ? Date.parse(marine.sunset) : 0

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* HeatBanner ganz oben — auffällige Mittags-Warnung. */}
      {weather?.daily[0] && (
        <HeatBanner tempMax={weather.daily[0].tempMax} uvIndexMax={weather.daily[0].uvIndexMax} />
      )}

      <Countdown target={target} value={value} />

      {/* Sonnenuntergang + goldene Stunde — tappbar zur Wetter-Detailansicht. */}
      {sunsetMs > 0 && (
        <button
          type="button"
          onClick={() => navigate('/wetter')}
          className="block w-full text-left"
        >
          <WarningCard level="info" title="Sonne" icon="🌅">
            <p>Sonnenuntergang heute: <strong>{formatDualTime(sunsetMs)}</strong>.</p>
            <p className="mt-0.5">
              🌅 Goldene Stunde (Strandfotos) ab {formatDualTime(sunsetMs - 3600_000)} —
              schönste Strandzeit mit Kindern ab ca. 16:30.
            </p>
          </WarningCard>
        </button>
      )}

      <WeatherWidget />

      {/* v0.4: Zuhause-Wetter kompakt */}
      <HomeWeatherWidget />

      {/* v0.4: Nächste Events */}
      <UpcomingEventsCard />

      {/* Flugstatus am jeweiligen Reisetag prominent */}
      {showOutbound && <FlightCard flight={outboundFlight} kind="Hinflug" />}
      {showReturn && <FlightCard flight={returnFlight} kind="Rückflug" />}

      <QuickActions />

      {/* Strandtasche — Schnellzugriff + Reset pro Ausflug */}
      <Card title="🏖️ Strandtasche">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {beachBag.items.filter((i) => bagState[i.id]).length} / {beachBag.items.length} gepackt · Reset pro Ausflug.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setBagOpen((v) => !v)} className="!min-h-0 !py-1.5 text-xs">
              {bagOpen ? 'Verbergen' : 'Anzeigen'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setBagState({})}
              className="!min-h-0 !py-1.5 text-xs"
            >
              ↺ Reset
            </Button>
          </div>
        </div>
        {bagOpen && (
          <ul className="mt-2 space-y-1">
            {beachBag.items.map((item) => {
              const done = !!bagState[item.id]
              return (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => setBagState((p) => ({ ...p, [item.id]: !p[item.id] }))}
                      className="h-4 w-4 accent-ok"
                    />
                    <span className={`text-sm ${done ? 'text-slate-400 line-through' : ''}`}>{item.label}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <TodoHintCard />

      <Card title="Reise" icon="🧭">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {outboundFlight.origin.city} → {accommodation.name} (Aradippou) → {returnFlight.origin.city}.
          Mietwagen über Get Your Car (Paphos).
        </p>
      </Card>
    </div>
  )
}
