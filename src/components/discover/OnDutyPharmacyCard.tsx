// OnDutyPharmacyCard.tsx — Heutige Notdienst-Apotheke (Larnaka) mit tel:+Maps (v0.5 §3).
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { usePharmacy } from '@/hooks/usePharmacy'
import { tel, mapsSearch } from '@/lib/deepLinks'

export function OnDutyPharmacyCard() {
  const { pharmacies, loading, error, updatedAt } = usePharmacy()

  return (
    <Card title="🚑 Notdienst-Apotheken (Larnaka)" icon="">
      {loading && <p className="text-xs text-slate-400">Lade …</p>}
      {!loading && pharmacies.length === 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {error ?? 'Aktuelle Liste konnte nicht geladen werden — direkt prüfen:'}
        </p>
      )}
      {pharmacies.length === 0 && (
        <div className="mt-2 grid grid-cols-1 gap-2">
          <Button href="https://www.farmakeia.com.cy/" external variant="secondary" icon="💊" className="text-xs">
            farmakeia.com.cy
          </Button>
          <Button href="https://cynightmeds.com/" external variant="secondary" icon="💊" className="text-xs">
            cynightmeds.com
          </Button>
        </div>
      )}
      {pharmacies.length > 0 && (
        <ul className="space-y-2">
          {pharmacies.slice(0, 3).map((p, i) => (
            <li key={i} className="rounded-lg bg-slate-50 p-2 dark:bg-slate-700/40">
              <p className="text-sm font-semibold">{p.name}</p>
              {p.address && <p className="text-xs text-slate-500">{p.address}</p>}
              <div className="mt-1 flex gap-2">
                {p.phone && (
                  <Button href={tel(p.phone)} variant="primary" icon="📞" className="!min-h-0 !py-1 text-xs">
                    {p.phone}
                  </Button>
                )}
                <Button href={mapsSearch(p.name + ' Larnaca')} external variant="secondary" icon="🧭" className="!min-h-0 !py-1 text-xs">
                  Navigation
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {updatedAt && (
        <p className="mt-2 text-[10px] text-slate-400">
          Zuletzt aktualisiert: {new Date(updatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </Card>
  )
}
