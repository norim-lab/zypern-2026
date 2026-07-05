// Excursions.tsx — Ausflüge mit Distanzsortierung + Abreisetag-Hinweis.
import { useContext } from 'react'
import { ExcursionCard } from '@/components/discover/ExcursionCard'
import { WarningCard } from '@/components/ui/WarningCard'
import { useDistance } from '@/hooks/useDistance'
import { excursions } from '@/data/tripData'
import { GeolocationContext } from './geolocationContext'

export function Excursions() {
  const geo = useContext(GeolocationContext)!
  const sorted = useDistance(excursions, geo.location)

  return (
    <div className="space-y-3">
      <WarningCard level="warn" title="Mittagshitze meiden" icon="🌡️">
        Juli/August 35 °C+. Immer Wasser + Sonnencreme LSF 50+ + Kopfbedeckung dabei!
      </WarningCard>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {sorted.length} Ziele · sortiert nach Entfernung.
      </p>

      <div className="space-y-3">
        {sorted.map((e) => (
          <ExcursionCard key={e.item.name} excursion={e} />
        ))}
      </div>
    </div>
  )
}
