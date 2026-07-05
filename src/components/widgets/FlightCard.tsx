// FlightCard.tsx — Kompakte Flugkarte mit Live-Status + externen Buttons.
import { useFlightStatus } from '@/hooks/useFlightStatus'
import { Card } from '@/components/ui/Card'
import { InfoRow } from '@/components/ui/InfoRow'
import { Button } from '@/components/ui/Button'
import { WarningCard } from '@/components/ui/WarningCard'
import { RefreshBar } from '@/components/layout/RefreshBar'
import { formatDateTime, formatDuration, formatTime } from '@/lib/format'
import { ryanairApp } from '@/lib/deepLinks'
import { mask } from '@/hooks/usePrivateMode'
import type { Flight } from '@/data/types'

export interface FlightCardProps {
  flight: Flight
  /** „Hinflug"/„Rückflug" */
  kind: 'Hinflug' | 'Rückflug'
}

/** Status-Farbe abhängig vom Zustand. */
function stateColor(state: string): 'ok' | 'warn' | 'danger' | 'info' {
  switch (state) {
    case 'arrived':
    case 'landed':
      return 'ok'
    case 'delayed':
    case 'cancelled':
      return 'danger'
    case 'boarding':
    case 'departed':
    case 'enroute':
      return 'warn'
    default:
      return 'info'
  }
}

export function FlightCard({ flight, kind }: FlightCardProps) {
  const { status, loading, error, updatedAt, refresh } = useFlightStatus(flight)

  return (
    <Card title={`${kind} · ${flight.airline} ${flight.flightNumber}`} icon={kind === 'Hinflug' ? '🛫' : '🛬'}>
      {/* Strecke */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-center">
          <div className="text-2xl font-bold text-zypern-blue dark:text-sky-300">{flight.origin.code}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{flight.origin.city}</div>
        </div>
        <div className="flex-1 px-2 text-center text-slate-400">
          <div className="text-[11px]">{formatDuration(flight.durationMin)}</div>
          <div className="relative my-1 h-px bg-slate-300 dark:bg-slate-600">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm">✈️</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-zypern-blue dark:text-sky-300">{flight.destination.code}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{flight.destination.city}</div>
        </div>
      </div>

      <dl>
        <InfoRow label="Abflug">{formatDateTime(flight.departureAt)} Uhr</InfoRow>
        <InfoRow label="Ankunft">{formatDateTime(flight.arrivalAt)} Uhr</InfoRow>
        <InfoRow label="Buchungscode" mono>{mask(flight.bookingCode)}</InfoRow>
        <InfoRow label="Kontakt">{mask(flight.contact)}</InfoRow>
      </dl>

      {/* Live-Status-Badge */}
      {status && (
        <div className="mt-3">
          <WarningCard level={stateColor(status.state)} title={`Status: ${status.state}`} icon="📍">
            {status.message}
          </WarningCard>
        </div>
      )}

      {/* Bordkarten-Hinweis */}
      <div className="mt-3">
        <WarningCard level="danger" title="Bordkarten nur digital" icon="🎫">
          Check-in & Bordkarten ausschließlich über die Ryanair-App.
        </WarningCard>
      </div>

      {/* Sitzplätze + Gepäck (akkordeonartig, hier direkt) */}
      <details className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/40">
        <summary className="cursor-pointer text-sm font-semibold">Sitzplätze & Gepäck</summary>
        <div className="mt-2 space-y-2 text-sm">
          <p className="font-medium">Sitzplätze:</p>
          <ul className="list-disc space-y-1 pl-5">
            {flight.seats.map((s) => (
              <li key={s.seat}>
                <span className="font-mono font-semibold">{s.seat}</span> · {mask(s.person)}
                {s.note && <span className="text-slate-500"> ({s.note})</span>}
              </li>
            ))}
          </ul>
          <p className="mt-2 font-medium">Gepäck:</p>
          <ul className="list-disc space-y-1 pl-5">
            {flight.luggage.map((l) => (
              <li key={l.person}>
                {mask(l.person)}: {l.holdKg ? `${l.holdKg} kg Aufgabegepäck · ` : ''}{l.note}
              </li>
            ))}
          </ul>
        </div>
      </details>

      {/* Externe Live-Buttons */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button href={flight.flightradarUrl} external variant="secondary" icon="📡">
          Live auf Flightradar24
        </Button>
        <Button href={ryanairApp()} external variant="primary" icon="🎫">
          Ryanair-App öffnen
        </Button>
      </div>

      <RefreshBar updatedAt={updatedAt} loading={loading} error={error} onRefresh={refresh} label="Status" />

      <p className="mt-2 text-[11px] text-slate-400">
        Ankunft am {formatTime(flight.arrivalAt)} Uhr lokal am Zielflughafen.
      </p>
    </Card>
  )
}
