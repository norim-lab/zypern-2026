// LocalSpotCard.tsx — Kuratierter Lokal-Spot mit Favorit + „Waren wir schon"-Haken.
// KEINE erfundenen Namen — nur Orts-/Gegend-Beschreibungen; Details via Maps-Link.
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FavButton } from '@/components/ui/FavButton'
import { Tag } from '@/components/ui/Tag'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { mapsSearch } from '@/lib/deepLinks'
import type { LocalSpot } from '@/data/types'

const CAT_ICONS: Record<LocalSpot['category'], string> = {
  'Taverne/Meze': '🍽️',
  Fisch: '🐟',
  'Souvlaki/Grill': '🥙',
  'Café & Eis': '🍦',
  kinderfreundlich: '🧒',
}

export interface LocalSpotCardProps {
  spot: LocalSpot
}

export function LocalSpotCard({ spot }: LocalSpotCardProps) {
  const [fav, setFav] = useLocalStorage<Record<string, boolean>>('zyp2026:local-fav', {})
  const [visited, setVisited] = useLocalStorage<Record<string, boolean>>('zyp2026:local-visited', {})
  const [notes, setNotes] = useLocalStorage<Record<string, string>>('zyp2026:local-notes', {})

  const id = spot.id
  const isFav = !!fav[id]
  const isVisited = !!visited[id]

  return (
    <Card className="!p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-lg">{CAT_ICONS[spot.category]}</span>
            <h3 className="text-sm font-bold">{spot.name}</h3>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Tag tone="blue">{spot.category}</Tag>
            {isVisited && <Tag tone="green" icon="✓">schon gewesen</Tag>}
          </div>
        </div>
        <FavButton active={isFav} onToggle={() => setFav((p) => ({ ...p, [id]: !p[id] }))} label="Favorit" />
      </div>

      {spot.note && (
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{spot.note}</p>
      )}

      {/* Eigene Notiz (editierbar). */}
      <input
        type="text"
        value={notes[id] ?? ''}
        onChange={(e) => setNotes((p) => ({ ...p, [id]: e.target.value }))}
        placeholder="Eigene Notiz (z. B. Tagesteller super)…"
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
      />

      <div className="mt-3 grid grid-cols-1 gap-2">
        <Button href={mapsSearch(spot.query)} external variant="primary" icon="🗺️" className="w-full">
          Details in Maps prüfen
        </Button>
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={isVisited}
            onChange={() => setVisited((p) => ({ ...p, [id]: !p[id] }))}
            className="h-4 w-4 accent-ok"
          />
          schon gewesen
        </label>
      </div>
    </Card>
  )
}
