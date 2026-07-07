// FireBanner.tsx — Waldbrand-Warnstufe „Red Alert" (v0.5 §7).
// Erscheint rot auf dem Dashboard, falls News-Titel auf Brandgefahr hinweisen.
import { WarningCard } from '@/components/ui/WarningCard'

const FIRE_KEYWORDS = [
  'red alert', 'fire risk', 'wildfire', 'forest fire', 'πυρκαγιά',
  'waldbrand', 'brandgefahr', 'fire warning', 'high fire',
]

export function FireBanner({ newsTitles }: { newsTitles: string[] }) {
  const fireHit = newsTitles.find((t) =>
    FIRE_KEYWORDS.some((kw) => t.toLowerCase().includes(kw.toLowerCase())),
  )
  if (!fireHit) return null

  return (
    <WarningCard level="danger" title="🔥 Waldbrand-Warnstufe (Red Alert)" icon="🔥">
      Aktuelle Warnung: „{fireHit.slice(0, 80)}". Keine offenen Feuer, keine Zigaretten
      im Freien! Brandgefahrenkarte:{' '}
      <a
        href="https://effis.jrc.ec.europa.eu/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline"
      >
        EFFIS öffnen ↗
      </a>
    </WarningCard>
  )
}
