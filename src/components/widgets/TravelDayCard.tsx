// =============================================================================
// TravelDayCard.tsx — Reisetags-Karte für Fahrtstrecken (v0.7).
//
// Zeht eine konkrete Fahrt an einem Reisetag (Flughafen, Haus, Heimfahrt) mit
// Streckenbeschreibung, geschätzter Fahrzeit (immer „ohne Verkehr") und einem
// Google-Maps-Routenlink (Maps zeigt Live-Verkehr automatisch).
//
// Nur an dem jeweiligen Reisetag sichtbar — die Sichtbarkeit steuert das
// Dashboard über isTravelDay() (nicht diese Komponente selbst).
//
// Ehrlichkeit: Es gibt keine kostenlose verlässliche Live-Verkehrs-API. Daher
// alle Zeiten „ohne Verkehr", und Live-Verkehr bewusst über den Maps-Link.
// =============================================================================
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { mapsDirOriginDest } from '@/lib/deepLinks'

export type TravelDayKind = 'to-airport' | 'to-home-cy' | 'homebound'

export interface TravelDayCardProps {
  kind: TravelDayKind
  /** Titel der Karte (z. B. „Fahrt zum Flughafen Weeze"). */
  title: string
  /** Start-Ort als Text (für Maps-Deep-Link). */
  origin: string
  /** Ziel-Ort als Text. */
  destination: string
  /** Streckenbeschreibung + geschätzte Fahrzeit (immer „ohne Verkehr"). */
  description: string
  /** Emoji-Icon für die Karte. */
  icon?: string
}

export function TravelDayCard({
  title,
  origin,
  destination,
  description,
  icon = '🚗',
}: TravelDayCardProps) {
  return (
    <Card title={`${icon} ${title}`}>
      <p className="text-sm text-slate-700 dark:text-slate-200">{description}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {origin} → {destination}
      </p>
      <div className="mt-3">
        <Button
          href={mapsDirOriginDest(origin, destination)}
          external
          variant="primary"
          icon="🧭"
          className="w-full"
        >
          🚦 Route mit Verkehr in Maps
        </Button>
      </div>
    </Card>
  )
}

/**
 * Die drei Reisetags-Karten als fertige Konfiguration (Daten zentral, nicht
 * im Dashboard verstreut). Das Dashboard wählt über kind+sichtbarkeit aus.
 */
export const TRAVEL_DAY_CARDS: Record<
  TravelDayKind,
  Omit<TravelDayCardProps, 'kind'>
> = {
  'to-airport': {
    title: 'Fahrt zum Flughafen Weeze',
    icon: '✈️',
    origin: 'Bad Neuenahr',
    destination: 'Flughafen-Ring 1, 47652 Weeze',
    description:
      'Bad Neuenahr → Flughafen Weeze (ca. 140 km / ~1 h 40 ohne Verkehr). Einfahrt P2 ca. 10:30.',
  },
  'to-home-cy': {
    title: 'Fahrt zum Haus',
    icon: '🏠',
    origin: 'Flughafen Paphos',
    destination: 'Damian Home, Aradippou',
    description: 'Flughafen Paphos → Damian Home (~1 h 20 ohne Verkehr).',
  },
  homebound: {
    title: 'Heimfahrt',
    icon: '🏠',
    origin: 'Flughafen Weeze',
    destination: 'Bad Neuenahr',
    description: 'Flughafen Weeze → Bad Neuenahr (~1 h 40 ohne Verkehr).',
  },
}
