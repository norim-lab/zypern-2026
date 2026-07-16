// =============================================================================
// HomeSunLine.tsx — Kompakte Heimatort-Sonnenzeiten-Zeile (v0.7).
//
// Zeigt „Zuhause: ↑ 05:41 · ↓ 21:33 (DE)" für Bad Neuenahr — ergänzend zu den
// Zypern-Doppelzeiten überall dort, wo Sonnenzeiten stehen. Lädt die Daten
// einmal pro Stunde via useHomeSunTimes. Sind keine Daten da (Offline/Fehler),
// wird NICHTS gerendert (nicht erfinden, leise weg lassen).
// =============================================================================
import { useHomeSunTimes } from '@/hooks/useHomeSunTimes'
import { formatSunLine } from '@/lib/format'
import { DE_TZ } from '@/lib/timezone'

export function HomeSunLine() {
  const { data } = useHomeSunTimes()
  if (!data) return null
  return (
    <p className="text-xs text-slate-400 dark:text-slate-500">
      Zuhause: {formatSunLine(data, DE_TZ, 'DE')}
    </p>
  )
}
