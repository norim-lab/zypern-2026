// More.tsx — Bündelt: Parken Weeze, Ausflüge, Notfall & Gesundheit, Roadmap.
import { Card } from '@/components/ui/Card'
import { WarningCard } from '@/components/ui/WarningCard'
import { Button } from '@/components/ui/Button'
import { InfoRow } from '@/components/ui/InfoRow'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { parking, excursions, emergency } from '@/data/tripData'
import { tel } from '@/lib/deepLinks'
import { formatDateTime, formatEur } from '@/lib/format'
import { mask } from '@/hooks/usePrivateMode'

export function More() {
  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Parken Weeze ----------------------------------------------------------*/}
      <SectionTitle icon="🅿️">Parken Flughafen Weeze</SectionTitle>
      <Card title={`Parkplatz ${parking.area}`} icon="🅿️">
        <dl>
          <InfoRow label="Buchungsnr." mono>{mask(parking.bookingNo)}</InfoRow>
          <InfoRow label="Buchender">{mask(parking.bookedBy)}</InfoRow>
          <InfoRow label="Preis">{formatEur(parking.priceEur)}</InfoRow>
          <InfoRow label="Kennzeichen" mono>{mask(parking.licensePlate)}</InfoRow>
          <InfoRow label="Einfahrt">ca. {formatDateTime(parking.entryAt)} Uhr</InfoRow>
          <InfoRow label="Ausfahrt">ca. {formatDateTime(parking.exitAt)} Uhr</InfoRow>
        </dl>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {parking.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <div className="mt-3">
          <Button href={parking.navigationUrl} external variant="primary" icon="🧭">
            Navigation Parkplatz Weeze
          </Button>
        </div>
      </Card>

      {/* Ausflüge -------------------------------------------------------------*/}
      <SectionTitle icon="🗺️">Ausflüge ab Aradippou</SectionTitle>
      <WarningCard level="warn" title="Mittagshitze meiden" icon="🌡️">
        Juli/August 35 °C+. Immer Wasser + Sonnencreme LSF 50+ + Kopfbedeckung dabei!
      </WarningCard>
      <ul className="space-y-2">
        {excursions.map((e) => (
          <li key={e.name}>
            <Card className="!p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{e.name}</p>
                  {e.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{e.description}</p>
                  )}
                  <p className="text-xs text-zypern-blue dark:text-sky-300">🚗 {e.travelTime}</p>
                </div>
                <Button
                  href={e.navigationUrl}
                  external
                  variant="secondary"
                  icon="🧭"
                  className="!min-h-0 !py-2 text-xs"
                >
                  Los
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {/* Notfall & Gesundheit --------------------------------------------------*/}
      <SectionTitle icon="🚨">Notfall & Gesundheit</SectionTitle>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button href={tel(emergency.emergencyNumber)} variant="danger" icon="🚑" className="text-base">
          Notruf 112
        </Button>
        <Button href={emergency.pharmacy.mapsUrl} external variant="secondary" icon="💊">
          Apotheke beim Haus
        </Button>
      </div>
      <WarningCard level="warn" title="EHIC & Nordzypern" icon="🩺">
        {emergency.ehicNote} {emergency.waterNote}
      </WarningCard>

      {/* Archiv (übergreifend) ------------------------------------------------*/}
      <SectionTitle icon="🗄️">Archiv</SectionTitle>
      <Card>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Abgelaufene Events, alte News & erledigte To-dos — zentral gesammelt.
          Nichts verschwindet kommentarlos; löschen nur manuell.
        </p>
        <Button href="/archiv" variant="secondary" icon="🗄️" className="w-full">
          Zum Archiv
        </Button>
      </Card>

      {/* Roadmap-Platzhalter --------------------------------------------------*/}
      <SectionTitle icon="🚀">Bald verfügbar</SectionTitle>
      <Card className="opacity-60">
        <ul className="space-y-2 text-sm">
          <li>📡 <span className="font-medium">v0.3:</span> Sync mit Notion-Hub, geteilte Checklisten, Tagesplaner</li>
          <li>📸 <span className="font-medium">v0.4:</span> Fotos/Erinnerungen, Budget-Tracker, Push-Benachrichtigungen</li>
        </ul>
        <p className="mt-2 text-xs text-slate-400">
          Diese Funktionen sind noch nicht aktiv — nur vorbereitet.
        </p>
      </Card>
    </div>
  )
}
