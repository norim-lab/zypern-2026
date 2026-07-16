// DistanceBadge.tsx — „x km · ca. y min mit dem Auto (ohne Verkehr)".
// v0.7: Kennzeichnung „ohne Verkehr", da driveMin nur eine Faustregel aus der
// Luftlinie ist (keine echte Verkehrslage). Live-Verkehr via Maps-Button.
import { formatKm } from '@/lib/format'

export interface DistanceBadgeProps {
  km: number
  driveMin: number
}

export function DistanceBadge({ km, driveMin }: DistanceBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zypern-blue/10 px-2 py-0.5 text-[11px] font-medium text-zypern-blue-dark dark:bg-sky-900/30 dark:text-sky-200">
      🚗 {formatKm(km)} · ca. {driveMin} min (ohne Verkehr)
    </span>
  )
}
