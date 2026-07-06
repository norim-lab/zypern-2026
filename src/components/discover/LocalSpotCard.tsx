// LocalSpotCard.tsx — Kuratierter Lokal-Spot (v0.4 erweitert).
// NEU: Familien-Sterne, „Bewertungen in Maps", „Speisekarte in Maps",
//      Foto-Upload (Speisekarten-Fotos in IndexedDB), Link-Feld, Places-Platzhalter.
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FavButton } from '@/components/ui/FavButton'
import { Tag } from '@/components/ui/Tag'
import { StarRating } from '@/components/ui/StarRating'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useFamilyRating } from '@/hooks/useFamilyRating'
import { mapsSearch } from '@/lib/deepLinks'
import { useMenuPhotos } from '@/hooks/useMenuPhotos'
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
  const [menuUrl, setMenuUrl] = useLocalStorage<Record<string, string>>('zyp2026:local-menuurl', {})
  const { rating, setRating } = useFamilyRating(`local:${spot.id}`)
  const { photos, addPhoto, removePhoto } = useMenuPhotos(`local:${spot.id}`)

  const id = spot.id
  const isFav = !!fav[id]
  const isVisited = !!visited[id]

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      await addPhoto(file)
      e.target.value = ''
    }
  }

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

      {spot.note && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{spot.note}</p>}

      {/* Familien-Sterne + Notiz */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] text-slate-500">Familie:</span>
        <StarRating value={rating.stars} onChange={(s) => setRating({ stars: s })} size="sm" />
      </div>
      <input
        type="text"
        value={notes[id] ?? ''}
        onChange={(e) => setNotes((p) => ({ ...p, [id]: e.target.value }))}
        placeholder="Eigene Notiz (z. B. Tagesteller super)"
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
      />

      {/* Maps-Buttons: Bewertungen + Speisekarte */}
      <div className="mt-3 grid grid-cols-1 gap-2">
        <Button href={mapsSearch(spot.query)} external variant="secondary" icon="⭐" className="w-full text-xs">
          Bewertungen & Fotos in Maps
        </Button>
        <Button href={mapsSearch(`${spot.query} menu`)} external variant="secondary" icon="📄" className="w-full text-xs">
          Speisekarte in Maps
        </Button>
      </div>

      {/* Online-Speisekarten-Link (editierbar) */}
      <label className="mt-2 block">
        <span className="mb-0.5 block text-[11px] text-slate-500">Online-Speisekarte (Link)</span>
        <input
          type="url"
          value={menuUrl[id] ?? ''}
          onChange={(e) => setMenuUrl((p) => ({ ...p, [id]: e.target.value }))}
          placeholder="https://…"
          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
        />
      </label>

      {/* Speisekarten-Foto-Upload (IndexedDB) */}
      <div className="mt-2">
        <p className="mb-1 text-[11px] text-slate-500">📸 Eigene Speisekarten-Fotos</p>
        <div className="flex flex-wrap gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative">
              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
              <img src={p.dataUrl} alt="Speisekarte" className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                className="absolute -right-1 -top-1 rounded-full bg-danger px-1 text-xs text-white"
                aria-label="Foto entfernen"
              >
                ✕
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-center text-xs text-slate-400 hover:border-zypern-blue">
            <span>+ Foto</span>
            <input type="file" accept="image/*" capture="environment" onChange={onUpload} className="hidden" />
          </label>
        </div>
      </div>

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={isVisited}
          onChange={() => setVisited((p) => ({ ...p, [id]: !p[id] }))}
          className="h-4 w-4 accent-ok"
        />
        schon gewesen
      </label>
    </Card>
  )
}
