// Food.tsx — Kuratierte Lokale + „In der Nähe suchen"-Kacheln.
import { SectionTitle } from '@/components/ui/SectionTitle'
import { WarningCard } from '@/components/ui/WarningCard'
import { LocalSpotCard } from '@/components/discover/LocalSpotCard'
import { LocalSearchTile } from '@/components/discover/LocalSearchTile'
import { localSpots, localSearchTiles } from '@/data/tripData'

export function Food() {
  return (
    <div className="space-y-3">
      <WarningCard level="info" title="Live-Infos immer in Maps prüfen" icon="🗺️">
        Ohne API-Key gibt es keine verlässlichen Live-Restaurantdaten. Daher:
        kuratierte Startpunkte + „In der Nähe suchen". Bewertungen/Öffnungszeiten
        ändern sich — immer live prüfen.
      </WarningCard>

      <SectionTitle icon="🔎">In der Nähe suchen</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {localSearchTiles.map((t) => (
          <LocalSearchTile key={t.label} tile={t} />
        ))}
      </div>

      <SectionTitle icon="📍">Kuratierte Startpunkte</SectionTitle>
      <div className="space-y-3">
        {localSpots.map((s) => (
          <LocalSpotCard key={s.id} spot={s} />
        ))}
      </div>
    </div>
  )
}
