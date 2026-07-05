// QuickActions.tsx — Schnellzugriffe auf dem Dashboard.
// Navigation zum Haus / Parkplatz Weeze / Notfall 112 / Buchungscodes.
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { accommodation, parking, bookingCodes } from '@/data/tripData'
import { tel } from '@/lib/deepLinks'
import { useState } from 'react'

export function QuickActions() {
  const [showCodes, setShowCodes] = useState(false)

  return (
    <Card title="Schnellzugriffe" icon="⚡">
      <div className="grid grid-cols-2 gap-2">
        <Button href={accommodation.navigationUrl} external variant="primary" icon="🏡">
          Navigation zum Haus
        </Button>
        <Button href={parking.navigationUrl} external variant="secondary" icon="🅿️">
          Parkplatz Weeze
        </Button>
        <Button href={tel('112')} variant="danger" icon="🚑" className="col-span-2 text-base">
          Notruf 112
        </Button>
        <Button
          variant="ghost"
          icon="🔑"
          onClick={() => setShowCodes((v) => !v)}
          className="col-span-2"
        >
          {showCodes ? 'Buchungscodes verbergen' : 'Buchungscodes anzeigen'}
        </Button>
      </div>

      {showCodes && (
        <dl className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/40">
          {bookingCodes.map((c) => (
            <div
              key={c.code}
              className="flex items-center justify-between border-b border-slate-200 py-1.5 last:border-0 dark:border-slate-600"
            >
              <dt className="text-xs text-slate-500 dark:text-slate-400">{c.label}</dt>
              <dd className="font-mono text-sm font-semibold">{c.code}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  )
}
