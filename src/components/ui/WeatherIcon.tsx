// WeatherIcon.tsx — Zeigt Emoji + DE-Text zu einem WMO-Wettercode.
import { describeWeatherCode } from '@/lib/weatherCodes'

export interface WeatherIconProps {
  code: number
  /** Nur Emoji anzeigen (kompakt) */
  compact?: boolean
  className?: string
}

export function WeatherIcon({ code, compact, className = '' }: WeatherIconProps) {
  const info = describeWeatherCode(code)
  if (compact) {
    return <span className={`text-2xl ${className}`} aria-label={info.label} role="img">{info.emoji}</span>
  }
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-2xl" aria-hidden>{info.emoji}</span>
      <span className="text-sm">{info.label}</span>
    </span>
  )
}
