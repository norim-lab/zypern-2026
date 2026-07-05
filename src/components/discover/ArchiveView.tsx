// ArchiveView.tsx — Archiv: abgelaufene Events, alte News, erledigte To-dos.
// Filter nach Typ + Suchfeld; nur manuelles Löschen.
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useArchive } from '@/hooks/useArchive'
import { formatDate, formatRelativeTime } from '@/lib/format'
import type { ArchivedItem } from '@/data/types'

const KIND_LABELS: Record<ArchivedItem['kind'], string> = {
  event: 'Events',
  news: 'News',
  todo: 'To-dos',
}

export function ArchiveView() {
  const { items, remove } = useArchive()
  const [filter, setFilter] = useState<'all' | ArchivedItem['kind']>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return items
      .filter((i) => (filter === 'all' ? true : i.kind === filter))
      .filter((i) => (query ? i.title.toLowerCase().includes(query.toLowerCase()) : true))
  }, [items, filter, query])

  return (
    <Card title="Archiv" icon="🗄️">
      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
        Abgelaufene Events, alte News & erledigte To-dos. Nichts verschwindet
        kommentarlos — löschen nur manuell.
      </p>

      {/* Suchfeld */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Suchen …"
        className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700"
      />

      {/* Filter */}
      <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1">
        {(['all', 'event', 'news', 'todo'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === k
                ? 'bg-zypern-blue text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            {k === 'all' ? 'Alle' : KIND_LABELS[k]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">Noch nichts archiviert.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((i) => (
            <li key={i.id} className="rounded-xl bg-slate-50 p-2 dark:bg-slate-700/40">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">{KIND_LABELS[i.kind]}</p>
                  <p className="text-sm font-medium">{i.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {i.originalDate ? formatDate(new Date(i.originalDate).toISOString()) : ''} · archiviert {formatRelativeTime(i.archivedAt)}
                  </p>
                  {i.payload && <p className="text-[11px] text-slate-500 dark:text-slate-400">{i.payload}</p>}
                </div>
                <Button variant="ghost" onClick={() => remove(i.id)} className="!min-h-0 !py-1 text-xs">
                  🗑️
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
