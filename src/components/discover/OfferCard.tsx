// OfferCard.tsx — Eine Angebots-/Prospekt-Quelle als Karte (v0.4).
// Translate-Buttons (DE/EN) via Google-Wrapper; Original öffnen.
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { translationProvider } from '@/providers'
import { formatDualTime } from '@/lib/format'
import type { OfferSource } from '@/data/types'

export interface OfferCardProps {
  source: OfferSource
}

export function OfferCard({ source }: OfferCardProps) {
  const links = translationProvider.linksForUrl(source.url, 'el')

  return (
    <Card className="!p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold">{source.name}</h3>
          {source.chain && <Tag tone="blue">{source.chain}</Tag>}
        </div>
        <span className="text-lg" aria-hidden>🛒</span>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Pro­spekt öffnen & aktuelle Angebote prüfen. Zeiten immer live prüfen.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2">
        <Button href={source.url} external variant="primary" icon="📄" className="w-full">
          Original öffnen
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button href={links.de} external variant="secondary" icon="🇩🇪" className="text-xs">
            Auf Deutsch
          </Button>
          <Button href={links.en} external variant="secondary" icon="🇬🇧" className="text-xs">
            In English
          </Button>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-400">
        Stand {formatDualTime(Date.now())}
      </p>
    </Card>
  )
}
