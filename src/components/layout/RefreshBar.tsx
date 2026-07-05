// RefreshBar.tsx — „Zuletzt aktualisiert"-Anzeige + Refresh-Button.
// Wird von Wetter- und Flug-Widgets genutzt.
import { Button } from '@/components/ui/Button'
import { formatUpdatedAt } from '@/lib/format'

export interface RefreshBarProps {
  updatedAt: number | null
  loading: boolean
  error?: string | null
  onRefresh: () => void
  /** Beschriftung des Buttons */
  label?: string
}

export function RefreshBar({ updatedAt, loading, error, onRefresh, label = 'Aktualisieren' }: RefreshBarProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {error ? (
          <span className="text-danger dark:text-red-400">{error}</span>
        ) : (
          formatUpdatedAt(updatedAt)
        )}
      </p>
      <Button variant="ghost" onClick={onRefresh} disabled={loading} className="!min-h-0 !py-1.5 text-xs">
        {loading ? '⏳ Lädt …' : `🔄 ${label}`}
      </Button>
    </div>
  )
}
