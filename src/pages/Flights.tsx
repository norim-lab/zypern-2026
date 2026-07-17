// Flights.tsx — Beide Flüge (Hin & Rück) mit Live-Status.
import { FlightCard } from '@/components/widgets/FlightCard'
import { OfflineFlightTracker } from '@/components/widgets/OfflineFlightTracker'
import { JourneyTimeline } from '@/components/widgets/JourneyTimeline'
import { WarningCard } from '@/components/ui/WarningCard'
import { outboundFlight, returnFlight } from '@/data/tripData'

export function Flights() {
  return (
    <div className="space-y-4 p-4 pb-24">
      <WarningCard
        level="danger"
        title="Bordkarten ausschließlich digital"
        icon="🎫"
        bullets={[
          'Online-Check-in in der Ryanair-App erledigen.',
          'Bordkarten auf dem Handy speichern (Offline!).',
          'Flugnummer FR3878 an Auto Europe melden (Mietwagen-Abholung).',
        ]}
      />

      <FlightCard flight={outboundFlight} kind="Hinflug" />
      {/* v0.7.2: Hinflug-Zeitstrahl (Landung → Mietwagen → Zuhause). */}
      <JourneyTimeline direction="outbound" />

      <FlightCard flight={returnFlight} kind="Rückflug" />
      {/* v0.7.2: Rückreise-Zeitstrahl (Rückgabe → Abflug → Heimfahrt). */}
      <JourneyTimeline direction="return" />

      {/* v0.7.1: Offline-Flug-Tracker „Wo sind wir?" (rein via GPS). */}
      <OfflineFlightTracker />
    </div>
  )
}
