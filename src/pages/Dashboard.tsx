// Dashboard.tsx — Startscreen: Countdown, Wetter, Flugstatus, Schnellzugriffe, To-dos.
import { useCountdown } from '@/hooks/useCountdown'
import { Countdown } from '@/components/ui/Countdown'
import { WeatherWidget } from '@/components/widgets/WeatherWidget'
import { FlightCard } from '@/components/widgets/FlightCard'
import { QuickActions } from '@/components/widgets/QuickActions'
import { TodoHintCard } from '@/components/widgets/TodoHintCard'
import { Card } from '@/components/ui/Card'
import { outboundFlight, returnFlight, accommodation } from '@/data/tripData'

/** Wahr, wenn heute ein Reisetag ist (dann Flugkarte prominent). */
function isTravelDay(iso: string): boolean {
  const t = new Date(iso)
  const n = new Date()
  return t.getDate() === n.getDate() && t.getMonth() === n.getMonth() && t.getFullYear() === n.getFullYear()
}

export function Dashboard() {
  const { target, value } = useCountdown()
  const showOutbound = isTravelDay(outboundFlight.departureAt)
  const showReturn = isTravelDay(returnFlight.departureAt)

  return (
    <div className="space-y-4 p-4 pb-24">
      <Countdown target={target} value={value} />

      <WeatherWidget />

      {/* Flugstatus am jeweiligen Reisetag prominent */}
      {showOutbound && <FlightCard flight={outboundFlight} kind="Hinflug" />}
      {showReturn && <FlightCard flight={returnFlight} kind="Rückflug" />}

      <QuickActions />
      <TodoHintCard />

      <Card title="Reise" icon="🧭">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {outboundFlight.origin.city} → {accommodation.name} (Aradippou) → {returnFlight.origin.city}.
          Mietwagen über Get Your Car (Paphos).
        </p>
      </Card>
    </div>
  )
}
