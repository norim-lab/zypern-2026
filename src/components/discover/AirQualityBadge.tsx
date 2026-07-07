// AirQualityBadge.tsx — Luftqualitäts-Ampel + Saharastaub-Warnung (v0.5 §5).
import { WarningCard } from '@/components/ui/WarningCard'
import { Tag } from '@/components/ui/Tag'
import { pm25Level, pm10Level, DUST_WARNING_THRESHOLD } from '@/providers/AirQualityProvider'
import type { AirQualityData } from '@/providers/AirQualityProvider'

const LEVEL_STYLE = {
  green: { tone: 'ok' as const, label: 'gut', icon: '🟢' },
  yellow: { tone: 'warn' as const, label: 'mäßig', icon: '🟡' },
  red: { tone: 'danger' as const, label: 'schlecht', icon: '🔴' },
}

export function AirQualityBadge({ data }: { data: AirQualityData | null }) {
  if (!data) return null
  const pm25 = pm25Level(data.pm25)
  const pm10 = pm10Level(data.pm10)
  // Schlimmstes Level gewinnt.
  const worst = [pm25, pm10].includes('red') ? 'red' : [pm25, pm10].includes('yellow') ? 'yellow' : 'green'
  const style = LEVEL_STYLE[worst]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>{style.icon}</span>
        <span className="text-sm font-semibold">Luftqualität: {style.label}</span>
        <Tag tone="slate">PM2.5 {data.pm25.toFixed(0)}</Tag>
        <Tag tone="slate">PM10 {data.pm10.toFixed(0)}</Tag>
      </div>
      {data.dust >= DUST_WARNING_THRESHOLD && (
        <WarningCard level="danger" title="Saharastaub heute" icon="🌫️">
          Hoher Staubwert ({Math.round(data.dust)} µg/m³). Mittagszeit drinnen verbringen,
          viel trinken — besonders mit Kindern relevant!
        </WarningCard>
      )}
    </div>
  )
}
