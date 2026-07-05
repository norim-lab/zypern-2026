// News.tsx — Nachrichten: relevante oben, weitere eingeklappt + Link-Kacheln.
import { useState } from 'react'
import { useNews } from '@/hooks/useNews'
import { NewsCard } from '@/components/discover/NewsCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RefreshBar } from '@/components/layout/RefreshBar'
import { SectionTitle } from '@/components/ui/SectionTitle'

export function News() {
  const { relevant, further, linkSources, loading, error, updatedAt, refresh, markRead } = useNews()
  const [showFurther, setShowFurther] = useState(false)

  return (
    <div className="space-y-3">
      <SectionTitle icon="📌">Für uns relevant</SectionTitle>
      {relevant.length === 0 && !loading && (
        <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400 dark:bg-slate-700/40">
          Noch keine relevanten Meldungen.
        </p>
      )}
      <div className="space-y-3">
        {relevant.map((n, i) => (
          <NewsCard
            key={(n.pubDateMs ?? i) + n.link + i}
            item={n}
            relevant
            onMarkRead={() => markRead(n)}
          />
        ))}
      </div>

      {/* Weitere Meldungen (eingeklappt) */}
      {further.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowFurther((v) => !v)}
            className="w-full rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200"
          >
            {showFurther ? `▼ Weitere Meldungen (${further.length})` : `▶ Weitere Meldungen (${further.length})`}
          </button>
          {showFurther && (
            <div className="space-y-3">
              {further.map((n, i) => (
                <NewsCard
                  key={'f' + (n.pubDateMs ?? i) + n.link + i}
                  item={n}
                  relevant={false}
                  onMarkRead={() => markRead(n)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Link-Kacheln */}
      {linkSources.length > 0 && (
        <>
          <SectionTitle icon="🔗">Wichtige Quellen</SectionTitle>
          <div className="grid grid-cols-1 gap-2">
            {linkSources.map((s) => (
              <Card key={s.url} className="!p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span aria-hidden>{s.icon}</span>
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                  <Button href={s.url} external variant="secondary" icon="↗" className="!min-h-0 !py-1.5 text-xs">
                    öffnen
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <RefreshBar updatedAt={updatedAt} loading={loading} error={error} onRefresh={refresh} label="News" />
    </div>
  )
}
