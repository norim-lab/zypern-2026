// LocalSearchTile.tsx — „In der Nähe suchen"-Kachel (Maps nutzt automatisch Standort).
import { Button } from '@/components/ui/Button'
import { mapsSearchHere } from '@/lib/deepLinks'
import type { LocalSearchTile as Tile } from '@/data/types'

export interface LocalSearchTileProps {
  tile: Tile
}

export function LocalSearchTile({ tile }: LocalSearchTileProps) {
  return (
    <Button
      href={mapsSearchHere(tile.query)}
      external
      variant="secondary"
      icon={tile.icon}
      className="!flex-col !gap-0 !py-3 text-xs"
    >
      <span className="text-lg" aria-hidden>{tile.icon}</span>
      <span className="leading-tight">{tile.label}</span>
    </Button>
  )
}
