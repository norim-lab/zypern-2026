// Shopping.tsx — Einkaufen-Untertab (v0.4): Märkte nach Entfernung + Angebote.
import { useContext } from 'react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Card } from '@/components/ui/Card'
import { RefreshBar } from '@/components/layout/RefreshBar'
import { MarketCard } from '@/components/discover/MarketCard'
import { OfferCard } from '@/components/discover/OfferCard'
import { useDistance } from '@/hooks/useDistance'
import { useOffers } from '@/hooks/useOffers'
import { markets } from '@/data/tripData'
import { GeolocationContext } from './geolocationContext'

export function Shopping() {
  const geo = useContext(GeolocationContext)!
  const sorted = useDistance(markets, geo.location)
  const { items, linkSources, loading, error, updatedAt, refresh } = useOffers()

  return (
    <div className="space-y-3">
      <SectionTitle icon="🏪">Märkte</SectionTitle>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {sorted.length} Märkte · sortiert nach Entfernung.
      </p>
      <div className="space-y-3">
        {sorted.map((m) => (
          <MarketCard key={m.item.id} market={m} />
        ))}
      </div>

      <SectionTitle icon="🛒">Angebote & Prospekte</SectionTitle>
      {linkSources.length === 0 && items.length === 0 && !loading && (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Keine Angebote geladen — unten aktualisieren oder Prospekt öffnen.
          </p>
        </Card>
      )}

      {items.length > 0 && (
        <Card title="Gefundene Angebote" icon="🏷️">
          <ul className="space-y-1 text-sm">
            {items.slice(0, 20).map((o, i) => (
              <li key={i} className="border-b border-slate-100 py-1 last:border-0 dark:border-slate-700">
                <span className="font-medium">{o.title}</span>
                <span className="ml-2 text-xs text-slate-500">{o.market}{o.price ? ` · ${o.price}` : ''}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="space-y-3">
        {linkSources.map((s) => (
          <OfferCard key={s.url} source={s} />
        ))}
      </div>

      <RefreshBar updatedAt={updatedAt} loading={loading} error={error} onRefresh={refresh} label="Angebote" />
    </div>
  )
}
