// WeatherDetail.tsx — Wetter-Detail mit Stundenverlauf + Sonnenzeiten (v0.4).
// Unterstützt Aradippou (Default) und Zuhause via /wetter/home.
import { useParams } from 'react-router-dom'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Card } from '@/components/ui/Card'
import { WarningCard } from '@/components/ui/WarningCard'
import { WeatherWidget } from '@/components/widgets/WeatherWidget'
import { HeatBanner } from '@/components/discover/HeatBanner'
import { HourlyForecast } from '@/components/discover/HourlyForecast'
import { useWeather } from '@/hooks/useWeather'
import { useWeatherHourly } from '@/hooks/useWeatherHourly'
import { useAirQuality } from '@/hooks/useAirQuality'
import { weatherLocations, homeLocation } from '@/data/tripData'
import { formatDualTime } from '@/lib/format'
import { AirQualityBadge } from '@/components/discover/AirQualityBadge'

export function WeatherDetail() {
  const params = useParams()
  const isHome = params['*']?.includes('home') || false

  // Standort wählen: Aradippou (default) oder Zuhause (Europe/Berlin).
  // Beide als stabile Modulkonstanten, sonst Endlos-Re-Render via useWeather-Effect.
  const location = isHome ? homeLocation : weatherLocations[0]

  const { data: weather } = useWeather(location)
  const { data: hourly, loading, error, updatedAt, refresh } = useWeatherHourly({
    lat: location.lat,
    lon: location.lon,
  })
  const { data: airQuality } = useAirQuality({ lat: location.lat, lon: location.lon })

  return (
    <div className="space-y-4 p-4 pb-24">
      <SectionTitle icon={isHome ? '🏠' : '🌤️'}>
        {isHome ? 'Wetter Zuhause' : 'Wetter Aradippou'}
      </SectionTitle>

      {!isHome && weather?.daily[0] && (
        <HeatBanner tempMax={weather.daily[0].tempMax} uvIndexMax={weather.daily[0].uvIndexMax} />
      )}

      <WeatherWidget />

      {/* Sonnenzeiten (doppelte Zeitanzeige Zypern + DE) */}
      {hourly?.sun && (
        <Card title="Sonne" icon="☀️">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-[11px] text-slate-500">Sonnenaufgang</p>
              <p className="text-sm font-semibold">{formatDualTime(hourly.sun.sunriseMs)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Sonnenuntergang</p>
              <p className="text-sm font-semibold">{formatDualTime(hourly.sun.sunsetMs)}</p>
            </div>
          </div>
          {/* Goldene Stunde = letzte Stunde vor Sonnenuntergang. */}
          {hourly.sun.sunsetMs > Date.now() && (
            <p className="mt-2 text-center text-xs text-warn dark:text-amber-300">
              🌅 Goldene Stunde (Strandfotos): ab{' '}
              {formatDualTime(hourly.sun.sunsetMs - 3600_000)}
            </p>
          )}
        </Card>
      )}

      {/* Stundenverlauf heute + morgen */}
      <Card title="Stundenverlauf (heute + morgen)" icon="📈">
        {hourly && <HourlyForecast points={hourly.hourly} tz={location.timezone as 'Europe/Nicosia' | 'Europe/Berlin'} />}
        {loading && <p className="text-xs text-slate-400">Lade …</p>}
        {error && <p className="text-xs text-danger dark:text-red-400">{error}</p>}
      </Card>

      <WarningCard level="info" title="UV & Hitze" icon="🌡️">
        UV-Verlauf hilft bei der Strandplanung: unter UV 6 ist die Mittagssonne erträglich.
        Gefühlte Temperatur beachten (kann durch Wind deutlich kühler sein).
      </WarningCard>

      {/* Luftqualität & Saharastaub (v0.5 §5) */}
      {airQuality && (
        <Card title="Luftqualität & Saharastaub" icon="🌫️">
          <AirQualityBadge data={airQuality} />
        </Card>
      )}

      <p className="text-center text-[11px] text-slate-400">
        {updatedAt ? `Zuletzt aktualisiert: ${new Date(updatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}` : ''}
        {refresh && (
          <button type="button" onClick={refresh} className="ml-2 text-zypern-blue dark:text-sky-300">
            🔄 aktualisieren
          </button>
        )}
      </p>
    </div>
  )
}
