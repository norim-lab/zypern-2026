// RentalCar.tsx — Mietwagen: Reservierung, Bedingungen, Hotline.
import { Card } from '@/components/ui/Card'
import { WarningCard } from '@/components/ui/WarningCard'
import { Button } from '@/components/ui/Button'
import { InfoRow } from '@/components/ui/InfoRow'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { rentalCar } from '@/data/tripData'
import { tel, mailto } from '@/lib/deepLinks'
import { formatDateTime, formatEur } from '@/lib/format'
import { mask } from '@/hooks/usePrivateMode'

export function RentalCar() {
  return (
    <div className="space-y-4 p-4 pb-24">
      <SectionTitle icon="🚗">Mietwagen · {rentalCar.localVendor}</SectionTitle>

      {/* Wichtig: Rückgabezeit ändern */}
      {rentalCar.returnTimeChangeNeeded && (
        <WarningCard level="warn" title="Rückgabezeit prüfen" icon="⏰">
          {rentalCar.returnTimeChangeNeeded}
        </WarningCard>
      )}

      <Card title="Reservierung" icon="📄">
        <dl>
          <InfoRow label="Plattform">{rentalCar.platform}</InfoRow>
          <InfoRow label="Reservierungsnr." mono>{mask(rentalCar.reservationNo)}</InfoRow>
          <InfoRow label="Status">
            {rentalCar.confirmed ? '✅ Bestätigt' : '⏳ Ausstehend'}
          </InfoRow>
          <InfoRow label="Vermieter vor Ort">{rentalCar.localVendor}</InfoRow>
          <InfoRow label="Schalter">{rentalCar.counter}</InfoRow>
        </dl>
      </Card>

      <Card title="Fahrzeug" icon="🔑">
        <dl>
          <InfoRow label="Klasse">{rentalCar.carClass}</InfoRow>
          <InfoRow label="Modell">{rentalCar.exampleModel}</InfoRow>
          <InfoRow label="Getriebe">{rentalCar.transmission}</InfoRow>
        </dl>
      </Card>

      <Card title="Abholung & Rückgabe" icon="📅">
        <dl>
          <InfoRow label="Abholung">{formatDateTime(rentalCar.pickupAt)} Uhr</InfoRow>
          <InfoRow label="Abholort">{rentalCar.pickupLocation}</InfoRow>
          <InfoRow label="Rückgabe">{formatDateTime(rentalCar.returnAt)} Uhr</InfoRow>
          <InfoRow label="Rückgabeort">{rentalCar.returnLocation}</InfoRow>
        </dl>
      </Card>

      <Card title="Preis & Gutschein" icon="💶">
        <dl>
          <InfoRow label="Preis bezahlt">{formatEur(rentalCar.priceEur)}</InfoRow>
          {rentalCar.voucherCode && (
            <>
              <InfoRow label="Gutscheincode" mono>{mask(rentalCar.voucherCode)}</InfoRow>
              <InfoRow label="Erstattung">
                −{formatEur(rentalCar.voucherRefundEur ?? 0)} nach Rückkehr
              </InfoRow>
            </>
          )}
        </dl>
        <p className="mt-2 text-xs text-warn dark:text-amber-300">
          ⚠️ Bankverbindung eintragen, Frist 30 Tage nach Rückkehr!
        </p>
      </Card>

      {/* Wichtige Bedingungen */}
      <WarningCard
        level="danger"
        title="Wichtige Bedingungen"
        icon="🚨"
        bullets={rentalCar.conditions}
      />

      <Card title="Hotline" icon="📞">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button href={tel(rentalCar.hotlinePhone)} variant="primary" icon="📞">
            {mask(rentalCar.hotlinePhone)}
          </Button>
          <Button href={mailto(rentalCar.hotlineEmail, 'Mietwagen Zypern 2026')} variant="secondary" icon="✉️">
            E-Mail
          </Button>
        </div>
      </Card>
    </div>
  )
}
