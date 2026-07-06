// EventCard.tsx — Eine Veranstaltung (RSS oder manuell).
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { formatDate } from '@/lib/format'
import { mapsSearch } from '@/lib/deepLinks'
import { downloadIcs } from '@/lib/ics'
import type { ManualEvent } from '@/data/types'
import type { RssEvent } from '@/hooks/useEvents'

export type AnyEvent = ManualEvent | (RssEvent & { kind: 'manual' })

export interface EventCardProps {
  event: ManualEvent | RssEvent
  onDelete?: (id: string) => void
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const isManual = 'date' in event
  const dateMs = isManual ? new Date(event.date).getTime() : event.dateMs

  return (
    <Card className="!p-3">
      <div className="flex items-center gap-2">
        {isManual ? <Tag tone="green" icon="✍️">eigenes Event</Tag> : <Tag tone="blue">{event.source}</Tag>}
        {dateMs && (
          <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">
            {formatDate(new Date(dateMs).toISOString())}
          </span>
        )}
      </div>
      <h3 className="mt-1 text-sm font-semibold leading-snug">{event.title}</h3>

      {isManual && (
        <>
          {event.locationName && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">📍 {event.locationName}</p>
          )}
          {event.note && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{event.note}</p>}
        </>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {isManual && event.locationName && (
          <Button href={mapsSearch(event.locationName)} external variant="secondary" icon="🗺️" className="!min-h-0 !py-1.5 text-xs">
            Karte
          </Button>
        )}
        {isManual && event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zypern-blue hover:underline dark:text-sky-300"
          >
            Link ↗
          </a>
        )}
        {!isManual && event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zypern-blue hover:underline dark:text-sky-300"
          >
            Öffnen ↗
          </a>
        )}
        {isManual && (
          <button
            type="button"
            onClick={() => downloadIcs(event as ManualEvent)}
            className="text-xs font-medium text-zypern-blue hover:underline dark:text-sky-300"
          >
            📅 Zum Kalender
          </button>
        )}
        {isManual && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(event.id)}
            className="ml-auto text-xs text-slate-400 hover:text-danger dark:hover:text-red-400"
          >
            🗑️ löschen
          </button>
        )}
      </div>
    </Card>
  )
}
