// MarketCard.tsx — Ein Supermarkt/Markt mit Distanz + Maps + Bewertung + Familie-Sterne.
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { DistanceBadge } from './DistanceBadge'
import { useFamilyRating } from '@/hooks/useFamilyRating'
import { mapsSearch, mapsDirLatLon, mapsDirLatLonWithOrigin } from '@/lib/deepLinks'
import type { Market } from '@/data/types'
import type { WithDistance } from '@/hooks/useDistance'

export interface MarketCardProps {
  market: WithDistance<Market>
}

export function MarketCard({ market }: MarketCardProps) {
  const { item, km, driveMin } = market
  const { rating, setRating } = useFamilyRating(`market:${item.id}`)

  return (
    <Card className="!p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold">{item.name}</h3>
          <div className="mt-1">
            <DistanceBadge km={km} driveMin={driveMin} />
          </div>
        </div>
      </div>

      {/* Familien-Sterne */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] text-slate-500">Familie:</span>
        <StarRating value={rating.stars} onChange={(s) => setRating({ stars: s })} size="sm" />
        {rating.note && <span className="text-[11px] text-slate-400">· {rating.note}</span>}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button href={mapsDirLatLon(item.lat, item.lon)} external variant="primary" icon="🧭" className="text-xs">
          Navigation
        </Button>
        <Button href={mapsSearch(item.query)} external variant="secondary" icon="⭐" className="text-xs">
          Bewertungen in Maps
        </Button>
        {/* v0.7: Live-Verkehrslage via Google Maps (keine eigene Fake-API). */}
        <Button
          href={mapsDirLatLonWithOrigin(item.lat, item.lon)}
          external
          variant="ghost"
          icon="🚦"
          className="text-xs sm:col-span-2"
        >
          Route mit Verkehr in Maps
        </Button>
      </div>
    </Card>
  )
}
