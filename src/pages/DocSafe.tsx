// DocSafe.tsx — Dokumenten-Safe (v0.5 §13): alle Buchungsdaten auf einen Blick.
// Quelle: privateData/tripData. Respektiert VITE_PRIVATE_MODE.
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Card } from '@/components/ui/Card'
import { InfoRow } from '@/components/ui/InfoRow'
import { WarningCard } from '@/components/ui/WarningCard'
import { mask } from '@/hooks/usePrivateMode'
import {
  outboundFlight, returnFlight, rentalCar, parking, accommodation,
  emergency, bookingCodes,
} from '@/data/tripData'
import { tel } from '@/lib/deepLinks'

export function DocSafe() {
  return (
    <div className="space-y-4 p-4 pb-24">
      <SectionTitle icon="📄">Dokumenten-Safe</SectionTitle>
      <WarningCard level="info" title="Alles auf einen Blick" icon="📱">
        Am Schalter nichts in Mails suchen — ein Tap, alles da. Auch offline im Flugzeug.
      </WarningCard>

      {/* Flüge */}
      <Card title="Flüge · Ryanair" icon="✈️">
        <dl>
          <InfoRow label="Buchungscode" mono>{mask(outboundFlight.bookingCode)}</InfoRow>
          <InfoRow label="Hinflug">{outboundFlight.flightNumber} · {outboundFlight.origin.code}→{outboundFlight.destination.code}</InfoRow>
          <InfoRow label="Rückflug">{returnFlight.flightNumber} · {returnFlight.origin.code}→{returnFlight.destination.code}</InfoRow>
          <InfoRow label="Sitzplätze">{outboundFlight.seats.map((s) => s.seat).join(', ')}</InfoRow>
        </dl>
      </Card>

      {/* Mietwagen */}
      <Card title="Mietwagen · Auto Europe" icon="🚗">
        <dl>
          <InfoRow label="Reservierungsnr." mono>{mask(rentalCar.reservationNo)}</InfoRow>
          <InfoRow label="Voucher" mono>{mask(rentalCar.voucherCode)}</InfoRow>
          <InfoRow label="Vermieter">{rentalCar.localVendor}</InfoRow>
          <InfoRow label="Hotline">
            <a href={tel(rentalCar.hotlinePhone)} className="text-zypern-blue hover:underline">{mask(rentalCar.hotlinePhone)}</a>
          </InfoRow>
        </dl>
      </Card>

      {/* Parken */}
      <Card title="Parken Weeze" icon="🅿️">
        <dl>
          <InfoRow label="Buchungsnr." mono>{mask(parking.bookingNo)}</InfoRow>
          <InfoRow label="Kennzeichen" mono>{mask(parking.licensePlate)}</InfoRow>
        </dl>
      </Card>

      {/* Unterkunft */}
      <Card title="Unterkunft · Damian Home" icon="🏡">
        <dl>
          <InfoRow label="Adresse">{mask(accommodation.address)}</InfoRow>
          <InfoRow label="Plus Code" mono>{mask(accommodation.plusCode)}</InfoRow>
        </dl>
      </Card>

      {/* Notfall */}
      <Card title="Notfall" icon="🚨">
        <dl>
          <InfoRow label="Notruf">
            <a href={tel(emergency.emergencyNumber)} className="text-lg font-bold text-danger">{emergency.emergencyNumber}</a>
          </InfoRow>
        </dl>
      </Card>

      {/* Alle Codes kompakt */}
      <Card title="Alle Codes" icon="🔑">
        <dl>
          {bookingCodes.map((c) => (
            <InfoRow key={c.code} label={c.label} mono>{mask(c.code)}</InfoRow>
          ))}
        </dl>
      </Card>
    </div>
  )
}
