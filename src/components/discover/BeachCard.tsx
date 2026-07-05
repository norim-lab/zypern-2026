// BeachCard.tsx — Strand-Karte: große Wassertemperatur, Wellen/Wind, „Heute gut"-Badge.
// „Heute gut"-Logik: Wellenhöhe < 0,5 m UND Wind < 25 km/h → ruhiges Meer (gut mit Kleinkind).
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { DistanceBadge } from './DistanceBadge'
import { useMarine } from '@/hooks/useMarine'
import { mapsDirLatLon } from '@/lib/deepLinks'
import { formatSunset } from '@/lib/format'
import type { Beach } from '@/data/types'
import type { WithDistance } from '@/hooks/useDistance'

const TAG_LABELS: Record<string, string> = {
  flach: 'flach',
  ruhig: 'ruhig',
  rettungsschwimmer: 'Rettungsschwimmer',
  tavernen: 'Tavernen',
  wc: 'WC',
  sandstrand: 'Sandstrand',
  flugspotting: 'flugspotting ✈️',
}

export interface BeachCardProps {
  beach: WithDistance<Beach>
}

export function BeachCard({ beach }: BeachCardProps) {
  const { item, km, driveMin } = beach
  const { data, loading } = useMarine({ lat: item.lat, lon: item.lon })
  const [expanded, setExpanded] = useState(false)

  const waveOk = data ? data.waveHeight < 0.5 : false
  const windOk = data ? data.windSpeed < 25 : false
  const calm = waveOk && windOk

  return (
    <Card className="!p-3">
      {/* Kopf: Name + Distanz */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold">{item.name}</h3>
          <div className="mt-1">
            <DistanceBadge km={km} driveMin={driveMin} />
          </div>
        </div>
        {/* „Heute gut"-Badge */}
        {data && (
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
              calm
                ? 'bg-ok text-white'
                : 'bg-warn-soft text-warn dark:bg-amber-900/40 dark:text-amber-200'
            }`}
          >
            {calm ? '✅ ruhiges Meer' : '⚠️ Wellen/Wind'}
          </span>
        )}
      </div>

      {/* Große Wassertemperatur + Wellen/Wind */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="text-3xl font-extrabold text-zypern-blue dark:text-sky-300">
            {data ? `${Math.round(data.tempWater)}°C` : loading ? '…' : '—'}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Wasser
          </div>
        </div>
        <div className="text-right text-xs">
          <div>🌊 {data ? `${data.waveHeight.toFixed(1)} m` : '…'}</div>
          <div>💨 {data ? `${Math.round(data.windSpeed)} km/h` : '…'}</div>
          <div>🌡️ {data ? `${Math.round(data.tempAir)} °C` : '…'}</div>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-2 flex flex-wrap gap-1">
        {item.tags.map((t) => (
          <Tag key={t} tone="blue">{TAG_LABELS[t] ?? t}</Tag>
        ))}
      </div>

      {/* Detail-Akkordeon */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-xs font-medium text-zypern-blue dark:text-sky-300"
      >
        {expanded ? '▼ Details verbergen' : '▶ Details'}
      </button>
      {expanded && (
        <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
          <p>{item.description}</p>
          {item.bestTime && <p>🕐 Beste Zeit: {item.bestTime}</p>}
          {data?.sunset && <p>{formatSunset(data.sunset)}</p>}
          <p className="text-slate-400">
            Tipp: Öffnungszeiten/Bewertungen immer live in Google Maps prüfen.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-3">
        <Button href={mapsDirLatLon(item.lat, item.lon)} external variant="primary" icon="🧭" className="w-full">
          Navigation
        </Button>
      </div>
    </Card>
  )
}
