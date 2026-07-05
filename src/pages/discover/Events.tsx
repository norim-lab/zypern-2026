// Events.tsx — Veranstaltungen (RSS + manuell) + Link-Kacheln für externe Quellen.
import { useEvents } from '@/hooks/useEvents'
import { EventCard } from '@/components/discover/EventCard'
import { ManualEventForm } from '@/components/discover/ManualEventForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RefreshBar } from '@/components/layout/RefreshBar'
import { WarningCard } from '@/components/ui/WarningCard'
import { SectionTitle } from '@/components/ui/SectionTitle'
import type { ManualEvent } from '@/data/types'

export function Events() {
  const { upcoming, linkSources, loading, error, updatedAt, refresh, addManual, removeManual } = useEvents()

  function handleAdd(ev: ManualEvent) {
    addManual(ev)
  }

  return (
    <div className="space-y-3">
      <WarningCard level="info" title="Quellen-Hinweis" icon="📡">
        Quellen ohne maschinenlesbares Format erscheinen als Link-Kachel. Dorffeste
        (Panigiria) sind im Juli/August üblich — selbst erfasste Events oben
        hinzufügen!
      </WarningCard>

      <ManualEventForm onAdd={handleAdd} />

      <SectionTitle icon="🎉">Kommende Events</SectionTitle>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {upcoming.length} Events · sortiert nach Datum (nächste zuerst).
      </p>

      {upcoming.length === 0 && !loading && (
        <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400 dark:bg-slate-700/40">
          Keine Events gefunden — jetzt eins erfassen oder Quellen öffnen.
        </p>
      )}

      <div className="space-y-3">
        {upcoming.map((ev, i) => (
          <EventCard
            key={('date' in ev ? ev.id : ev.url + i) + String(i)}
            event={ev}
            onDelete={'date' in ev ? removeManual : undefined}
          />
        ))}
      </div>

      {/* Externe Link-Kacheln */}
      {linkSources.length > 0 && (
        <>
          <SectionTitle icon="🔗">Quellen extern öffnen</SectionTitle>
          <div className="grid grid-cols-1 gap-2">
            {linkSources.map((s) => (
              <Card key={s.url} className="!p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{s.name}</span>
                  <Button href={s.url} external variant="secondary" icon="↗" className="!min-h-0 !py-1.5 text-xs">
                    öffnen
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <RefreshBar updatedAt={updatedAt} loading={loading} error={error} onRefresh={refresh} label="Events" />
    </div>
  )
}
