// DistanceBadge.tsx — „x km · ca. y min mit dem Auto".
import { formatKm } from '@/lib/format'

export interface DistanceBadgeProps {
  km: number
  driveMin: number
}

export function DistanceBadge({ km, driveMin }: DistanceBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zypern-blue/10 px-2 py-0.5 text-[11px] font-medium text-zypern-blue-dark dark:bg-sky-900/30 dark:text-sky-200">
      🚗 {formatKm(km)} · ca. {driveMin} min
    </span>
  )
}
