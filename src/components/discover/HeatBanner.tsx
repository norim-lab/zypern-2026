// HeatBanner.tsx — Auffällige Warnung bei Hitze (≥38 °C) oder hohem UV (≥10).
// Hinweis: „Mittags Programm drinnen/Pool — Strand erst ab spätem Nachmittag".
import { WarningCard } from '@/components/ui/WarningCard'

export interface HeatBannerProps {
  /** Maximaltemperatur des Tages in °C (optional) */
  tempMax?: number
  /** Maximaler UV-Index des Tages (optional) */
  uvIndexMax?: number
}

export function HeatBanner({ tempMax, uvIndexMax }: HeatBannerProps) {
  const heat = tempMax !== undefined && tempMax >= 38
  const uv = uvIndexMax !== undefined && uvIndexMax >= 10
  if (!heat && !uv) return null

  const reasons: string[] = []
  if (heat) reasons.push(`≥ 38 °C (${Math.round(tempMax as number)} °C)`)
  if (uv) reasons.push(`UV-Index ≥ 10 (${Math.round(uvIndexMax as number)})`)

  return (
    <WarningCard level="danger" title="Hitze-Warnung" icon="🌡️">
      Heute {reasons.join(' und ')}: Mittags Programm drinnen / Pool — Strand erst ab
      spätem Nachmittag (~16:30). Viel Wasser + LSF 50+ + Kopfbedeckung!
    </WarningCard>
  )
}
