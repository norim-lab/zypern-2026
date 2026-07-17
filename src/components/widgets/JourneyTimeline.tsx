// =============================================================================
// JourneyTimeline.tsx — Vertikaler Reise-Zeitstrahl (v0.7.2).
//
// Zeigt die Etappen einer Reisekette (Hinflug oder Rückreise) mit geplanten
// bzw. geschätzten Uhrzeiten in Doppelzeit 🇨🇾/🇩🇪. Basis: Plan-Etappen aus
// tripData. Sobald eine Live-ETA aus dem Tracker vorliegt (useJourneyETA),
// wird die Landung überschrieben und alle nachgelagerten Etappen automatisch
// neu berechnet (Landung + Puffer) — Kennzeichnung wechselt von „Plan" auf
// „≈ live".
//
// Vergangene Etappen werden ausgegraut, die aktuelle Etappe hervorgehoben.
// Alle Schätzungen tragen ein „≈"-Präfix. Puffer sind Konstanten in tripData.
// =============================================================================
import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { useJourneyETA } from '@/hooks/useJourneyETA'
import type { JourneyDirection } from '@/hooks/useJourneyETA'
import { formatDualTime } from '@/lib/format'
import {
  outboundJourneyStages,
  returnJourneyStages,
  JOURNEY_BUFFERS_OUTBOUND,
  JOURNEY_BUFFERS_RETURN,
} from '@/data/tripData'
import type { JourneyStage } from '@/data/tripData'

export interface JourneyTimelineProps {
  /** Welche Reisekette anzeigen (Hinflug oder Rückreise). */
  direction: JourneyDirection
  /** Optionaler Titel der Karte. */
  title?: string
  /** Optional: nur die nächsten N Etappen (Kompaktansicht für Dashboard). */
  maxStages?: number
}

/**
 * Berechnet die Etappen neu, sobald eine Live-ETA vorliegt.
 * Die Landung wird auf die Live-ETA gesetzt; alle nachfolgenden Etappen
 * erhalten times = landing + kumulierter Puffer.
 */
function applyLiveETA(
  stages: JourneyStage[],
  liveLandingMs: number,
  direction: JourneyDirection,
): JourneyStage[] {
  // Index der Lande-Etappe finden (bei Hinflug: 'out-landing', Rück: 'ret-landing').
  const landingId = direction === 'outbound' ? 'out-landing' : 'ret-landing'
  const landingIdx = stages.findIndex((s) => s.id === landingId)
  if (landingIdx < 0) return stages

  // Kumulierte Puffer ab der Landung — abhängig von der Richtung.
  // Reihenfolge entspricht der stages ab landingIdx+1.
  const offsetsMin: Record<string, number> =
    direction === 'outbound'
      ? {
          'out-luggage': JOURNEY_BUFFERS_OUTBOUND.luggageMin,
          'out-car':
            JOURNEY_BUFFERS_OUTBOUND.luggageMin + JOURNEY_BUFFERS_OUTBOUND.carPickupMin,
          'out-drive':
            JOURNEY_BUFFERS_OUTBOUND.luggageMin +
            JOURNEY_BUFFERS_OUTBOUND.carPickupMin +
            JOURNEY_BUFFERS_OUTBOUND.driveToHomeMin,
          'out-arrival':
            JOURNEY_BUFFERS_OUTBOUND.luggageMin +
            JOURNEY_BUFFERS_OUTBOUND.carPickupMin +
            JOURNEY_BUFFERS_OUTBOUND.driveToHomeMin,
        }
      : {
          'ret-luggage': JOURNEY_BUFFERS_RETURN.luggageMin,
          'ret-walk':
            JOURNEY_BUFFERS_RETURN.luggageMin + JOURNEY_BUFFERS_RETURN.walkToParkingMin,
          'ret-drive':
            JOURNEY_BUFFERS_RETURN.luggageMin +
            JOURNEY_BUFFERS_RETURN.walkToParkingMin +
            JOURNEY_BUFFERS_RETURN.driveHomeMin,
          'ret-arrival':
            JOURNEY_BUFFERS_RETURN.luggageMin +
            JOURNEY_BUFFERS_RETURN.walkToParkingMin +
            JOURNEY_BUFFERS_RETURN.driveHomeMin,
        }

  return stages.map((s, i) => {
    if (s.id === landingId) {
      // Landung = Live-ETA, als „live" kennzeichnen.
      return { ...s, at: new Date(liveLandingMs).toISOString(), estimate: true }
    }
    if (i > landingIdx && offsetsMin[s.id] != null) {
      // Nachgelagerte Etappe = landing + Puffer.
      return {
        ...s,
        at: new Date(liveLandingMs + offsetsMin[s.id] * 60_000).toISOString(),
        estimate: true,
      }
    }
    return s
  })
}

export function JourneyTimeline({
  direction,
  title,
  maxStages,
}: JourneyTimelineProps) {
  const { eta } = useJourneyETA()

  const baseStages = direction === 'outbound' ? outboundJourneyStages : returnJourneyStages
  const isLive = eta != null && eta.direction === direction

  const stages = useMemo(() => {
    if (isLive && eta) return applyLiveETA(baseStages, eta.landingMs, direction)
    return baseStages
  }, [baseStages, isLive, eta, direction])

  const now = Date.now()
  // Kompaktmodus: nur die nächsten Etappen ab „jetzt" zeigen.
  const visibleStages = useMemo(() => {
    let list = stages
    if (maxStages) {
      // Aktuelle Etappe = letzte vergangene + 1; dann maxStages ab dort.
      const currentIdx = stages.findIndex((s) => new Date(s.at).getTime() > now)
      const start = currentIdx < 0 ? stages.length : currentIdx
      list = stages.slice(start, start + maxStages)
    }
    return list
  }, [stages, maxStages, now])

  return (
    <Card
      title={title ?? (direction === 'outbound' ? '🕐 Hinflug-Zeitstrahl' : '🕐 Rückreise-Zeitstrahl')}
    >
      {isLive && (
        <p className="mb-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          📡 Live-ETA aktiv — nachgelagerte Zeiten aus geglätteter Geschwindigkeit berechnet.
        </p>
      )}

      <ol className="relative space-y-3 border-l-2 border-slate-200 pl-4 dark:border-slate-600">
        {visibleStages.map((s) => {
          const ms = new Date(s.at).getTime()
          const past = ms < now
          // Aktuelle Etappe = die erste in der Zukunft (nur in der Vollansicht zuverlässig).
          const isCurrent = !past && stages.indexOf(s) === stages.findIndex((x) => new Date(x.at).getTime() > now)
          return (
            <li key={s.id} className="relative">
              {/* Punkt auf der Linie. */}
              <span
                className={`absolute -left-[1.4rem] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 ${
                  past
                    ? 'border-slate-300 bg-slate-300 dark:border-slate-500 dark:bg-slate-500'
                    : isCurrent
                      ? 'border-zypern-blue bg-zypern-blue dark:border-sky-400 dark:bg-sky-400'
                      : 'border-slate-300 bg-white dark:border-slate-500 dark:bg-slate-700'
                }`}
              />
              <div className={past ? 'opacity-50' : isCurrent ? 'font-semibold' : ''}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm">
                    {s.icon} {s.label}
                  </span>
                  <span className="whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                    {s.estimate ? '≈ ' : ''}
                    {formatDualTime(ms)}
                  </span>
                </div>
                {s.place && <p className="text-[11px] text-slate-400">{s.place}</p>}
              </div>
            </li>
          )
        })}
      </ol>

      <p className="mt-3 text-[11px] text-slate-400">
        ≈ Schätzwerte — Puffer anpassbar (siehe tripData). Zeiten in Doppelzeit 🇨🇾/🇩🇪.
      </p>
    </Card>
  )
}
