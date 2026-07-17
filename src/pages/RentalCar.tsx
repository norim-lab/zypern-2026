// RentalCar.tsx — Mietwagen: Reservierung, Bedingungen, Hotline.
import { Card } from '@/components/ui/Card'
import { WarningCard } from '@/components/ui/WarningCard'
import { Button } from '@/components/ui/Button'
import { InfoRow } from '@/components/ui/InfoRow'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { rentalCar, outboundFlight, JOURNEY_BUFFERS_OUTBOUND } from '@/data/tripData'
import { tel, mailto } from '@/lib/deepLinks'
import { formatDateTime, formatEur, formatDualTime, formatCountdownHrsMin } from '@/lib/format'
import { mask } from '@/hooks/usePrivateMode'
import { useJourneyETA } from '@/hooks/useJourneyETA'

export function RentalCar() {
  const { eta } = useJourneyETA()

  // Geschätzte Übernahme-Uhrzeit: Landung + Gepäck + Übernahme-Puffer.
  // Bei Live-ETA (Hinflug) wird die Landung aus dem Tracker genommen,
  // sonst die Plan-Landezeit. Schätzung → „≈"-Kennzeichnung.
  const landingBase =
    eta && eta.direction === 'outbound' ? eta.landingMs : new Date(outboundFlight.arrivalAt).getTime()
  const pickupMs =
    landingBase +
    (JOURNEY_BUFFERS_OUTBOUND.luggageMin + JOURNEY_BUFFERS_OUTBOUND.carPickupMin) * 60_000
  const isLivePickup = !!(eta && eta.direction === 'outbound')

  // Rückgabe-Countdown: geplant auf 15:30 am 07.08.
  const returnDeadlineMs = new Date('2026-08-07T15:30:00').getTime()
  const now = Date.now()
  const msUntilReturn = returnDeadlineMs - now
  const showReturnCountdown = msUntilReturn > 0 && msUntilReturn < 36 * 60 * 60_000 // ≤36h vor Deadline

  return (
    <div className="space-y-4 p-4 pb-24">
      <SectionTitle icon="🚗">Mietwagen · {rentalCar.localVendor}</SectionTitle>

      {/* Wichtig: Rückgabezeit ändern */}
      {rentalCar.returnTimeChangeNeeded && (
        <WarningCard level="warn" title="Rückgabezeit prüfen" icon="⏰">
          {rentalCar.returnTimeChangeNeeded}
        </WarningCard>
      )}

      {/* v0.7.2: Geschätzte Übernahme-Uhrzeit (live, falls Tracker läuft). */}
      <Card title="Übernahme heute" icon="🕐">
        <p className="text-sm">
          Voraussichtliche Abholung am Get-Your-Car-Schalter:
        </p>
        <p className="mt-1 text-lg font-semibold text-zypern-blue dark:text-sky-300">
          {isLivePickup ? '≈ ' : '≈ '}
          {formatDualTime(pickupMs)}
          {isLivePickup && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              📡 live
            </span>
          )}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Aus {isLivePickup ? 'Live-ETA' : 'Plan-Landezeit'} + Gepäck ({JOURNEY_BUFFERS_OUTBOUND.luggageMin} min)
          + Übernahme ({JOURNEY_BUFFERS_OUTBOUND.carPickupMin} min). Schätzwert.
        </p>
      </Card>

      {/* v0.7.2: Rückgabe-Countdown am Abreisetag (≤36h vor Deadline). */}
      {showReturnCountdown && (
        <WarningCard level="warn" title="Mietwagen-Rückgabe" icon="⏰">
          <p className="text-sm">
            Noch <strong>{formatCountdownHrsMin(msUntilReturn)}</strong> bis zur Rückgabe
            (geplant 15:30 Uhr PFO).
          </p>
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

      {/* Tankpreise (v0.5 §4) */}
      <SectionTitle icon="⛽">Tankpreise & Volltanken</SectionTitle>
      <Card title="Tankpreis-Vergleich" icon="⛽">
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Preisunterschiede bis 17–23 Cent/Liter — lohnt sich!
        </p>
        <div className="grid grid-cols-1 gap-2">
          <Button href="https://www.gov.cy/en/service/retail-fuel-price-observatory/" external variant="secondary" icon="🏛️" className="text-xs">
            Retail Fuel Price Observatory (gov.cy)
          </Button>
          <Button href="https://cyprusfuelguide.com/" external variant="secondary" icon="⛽" className="text-xs">
            cyprusfuelguide.com
          </Button>
        </div>
      </Card>
      <WarningCard level="warn" title="Volltanken vor Rückgabe" icon="⛽">
        Tankregel: voll/voll. Günstigste Station nahe Flughafen Paphos in Maps prüfen!
      </WarningCard>
    </div>
  )
}
