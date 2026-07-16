// ExcursionCard.tsx — Ausflugsziel-Karte mit Distanz + Kinder-/Schatten-Notes.
// v0.3: memoisiert, damit Listen-Updates die Karten nicht unnötig rerendern.
import { memo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Button } from '@/components/ui/Button'
import { DistanceBadge } from './DistanceBadge'
import { mapsDirLatLon, mapsDirLatLonWithOrigin } from '@/lib/deepLinks'
import type { Excursion } from '@/data/types'
import type { WithDistance } from '@/hooks/useDistance'

export interface ExcursionCardProps {
  excursion: WithDistance<Excursion>
}

export const ExcursionCard = memo(function ExcursionCard({ excursion }: ExcursionCardProps) {
  const { item, km, driveMin } = excursion
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="!p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold">{item.name}</h3>
          {item.departureDayTip && (
            <p className="mt-0.5 text-[11px] font-medium text-warn dark:text-amber-300">
              ✈️ Ideal für den Abreisetag!
            </p>
          )}
          <div className="mt-1">
            <DistanceBadge km={km} driveMin={driveMin} />
          </div>
        </div>
      </div>

      {item.description && (
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{item.description}</p>
      )}

      {expanded && (
        <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
          {item.kidsToddler && <p>👶 Kleinkind: {item.kidsToddler}</p>}
          {item.kidsSchool && <p>🧒 Schulkind: {item.kidsSchool}</p>}
          {item.shadeNote && <p>🌤️ Schatten/Hitze: {item.shadeNote}</p>}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-zypern-blue dark:text-sky-300"
        >
          {expanded ? '▼ weniger' : '▶ Kinder- & Hitze-Infos'}
        </button>
        <span className="text-[11px] text-slate-400">{item.travelTime} (ohne Verkehr)</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {item.kidsToddler && <Tag tone="green" icon="👶">kleinkind-tauglich</Tag>}
        {item.shadeNote?.toLowerCase().includes('schatten') && (
          <Tag tone="amber" icon="🌤️">Schatten-Hinweis</Tag>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-1.5">
        <Button href={mapsDirLatLon(item.lat, item.lon)} external variant="primary" icon="🧭" className="w-full">
          Navigation
        </Button>
        {/* v0.7: Live-Verkehrslage gibt es kostenlos nicht verlässlich →
            ehrlich auf Google Maps weiterleiten (dort ist Verkehr sichtbar). */}
        <Button
          href={mapsDirLatLonWithOrigin(item.lat, item.lon)}
          external
          variant="secondary"
          icon="🚦"
          className="w-full"
        >
          Route mit Verkehr in Maps
        </Button>
      </div>
    </Card>
  )
})
