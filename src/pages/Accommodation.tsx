// Accommodation.tsx — Unterkunft „Damian Home" + Poolsicherheit + Umgebung.
import { Card } from '@/components/ui/Card'
import { WarningCard } from '@/components/ui/WarningCard'
import { Button } from '@/components/ui/Button'
import { InfoRow } from '@/components/ui/InfoRow'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { accommodation } from '@/data/tripData'

export function Accommodation() {
  return (
    <div className="space-y-4 p-4 pb-24">
      <SectionTitle icon="🏡">Damian Home · Aradippou</SectionTitle>

      {/* Poolsicherheit — rote Warnkarte ganz oben */}
      <WarningCard
        level="danger"
        title="Poolsicherheit — NICHT gesichert!"
        icon="⚠️"
        bullets={accommodation.poolSafety.rules}
      >
        {accommodation.poolSafety.warning}
      </WarningCard>

      <Card title="Adresse & Kontakt" icon="📍">
        <dl>
          <InfoRow label="Adresse">{accommodation.address}</InfoRow>
          <InfoRow label="Plus Code" mono>{accommodation.plusCode}</InfoRow>
          <InfoRow label="Eigentümer">{accommodation.owner}</InfoRow>
        </dl>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button href={accommodation.navigationUrl} external variant="primary" icon="🧭">
            Navigation zum Haus
          </Button>
          <Button href={accommodation.placeUrl} external variant="secondary" icon="🗺️">
            Eintrag anzeigen
          </Button>
        </div>
      </Card>

      <Card title="Ausstattung" icon="🛏️">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {accommodation.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Card>

      <Card title="Wichtige Orte in der Umgebung" icon="🏪">
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {accommodation.nearby.map((p) => (
            <li key={p.name} className="flex items-center justify-between gap-2 py-2">
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{p.category}</p>
              </div>
              <Button href={p.mapsUrl} external variant="ghost" icon="🗺️" className="!min-h-0 !py-1.5 text-xs">
                Karte
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <WarningCard level="info" title="WLAN & Versorgung" icon="📶">
        WLAN/Waschmaschine bei Damian erfragen (siehe To-dos). Leitungswasser ist trinkbar.
      </WarningCard>
    </div>
  )
}
