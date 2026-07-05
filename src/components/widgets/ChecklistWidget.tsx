// ChecklistWidget.tsx — Wiederverwendbare, abhakbare Checkliste.
// Zustand persistent in localStorage (Key = checklist.id).
import { Card } from '@/components/ui/Card'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { Checklist } from '@/data/types'

export interface ChecklistWidgetProps {
  checklist: Checklist
  /** Kompakte Darstellung (für Dashboard-Vorschau auf die ersten 5 Einträge) */
  preview?: boolean
}

export function ChecklistWidget({ checklist, preview }: ChecklistWidgetProps) {
  // Map von itemId → done. Initial leer (nichts angehakt).
  const [done, setDone] = useLocalStorage<Record<string, boolean>>(
    `zyp2026:checklist:${checklist.id}`,
    {},
  )

  const items = preview ? checklist.items.slice(0, 5) : checklist.items
  const total = checklist.items.length
  const checkedCount = checklist.items.filter((i) => done[i.id]).length
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0

  function toggle(id: string) {
    setDone((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <Card title={`${checklist.icon} ${checklist.title}`}>
      {/* Fortschrittsbalken */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{checkedCount} / {total} erledigt</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-ok transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1">
        {items.map((item) => {
          const isDone = !!done[item.id]
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggle(item.id)}
                  className="mt-0.5 h-5 w-5 accent-ok"
                />
                <span className="flex-1 text-sm">
                  <span className={isDone ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}>
                    {item.label}
                  </span>
                  {item.hint && (
                    <span className="ml-1 text-xs text-slate-400">({item.hint})</span>
                  )}
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      {preview && total > items.length && (
        <p className="mt-2 text-xs text-slate-400">
          +{total - items.length} weitere …
        </p>
      )}
    </Card>
  )
}
