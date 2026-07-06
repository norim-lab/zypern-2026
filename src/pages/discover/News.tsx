// News.tsx — Nachrichten: relevante oben, weitere eingeklappt + Link-Kacheln.
// v0.4: Sprach-Filter (DE/EN/Alle) + Themen-Filter + griechisch → Translate-Button.
import { useMemo, useState } from 'react'
import { useNews } from '@/hooks/useNews'
import { NewsCard } from '@/components/discover/NewsCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FilterChips } from '@/components/ui/FilterChips'
import { RefreshBar } from '@/components/layout/RefreshBar'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { isRelevant } from '@/lib/rss'
import { newsTopics } from '@/data/tripData'
import type { FeedItem } from '@/lib/rss'

type LangFilter = 'de' | 'en' | 'all'
type DetectedLang = LangFilter | 'gr'

/** Heuristische Spracherkennung: DE/EN/GR anhand typischer Wörter/Zeichen. */
function detectLang(title: string): DetectedLang {
  const t = title.toLowerCase()
  // Deutsche Signalwörter
  if (/\b(der|die|das|und|in|von|mit|für|auf|ist|war|warnung|streik|hitze)\b/.test(t)) return 'de'
  // Griechisches Alphabet
  if (/[\u0370-\u03ff]/.test(title)) return 'gr'
  // Englische Signalwörter
  if (/\b(the|and|in|of|for|on|is|was|warn|strike|heat|cyprus|beach)\b/.test(t)) return 'en'
  return 'all'
}

export function News() {
  const { relevant, further, linkSources, loading, error, updatedAt, refresh, markRead } = useNews()
  const [showFurther, setShowFurther] = useState(false)
  const [lang, setLang] = useState<LangFilter>('all')
  const [topics, setTopics] = useState<string[]>([])

  /** Filtert nach Sprache + Thema. */
  function applyFilters(items: FeedItem[]): FeedItem[] {
    return items.filter((it) => {
      if (lang !== 'all') {
        const detected = detectLang(it.title)
        if (detected !== lang && detected !== 'all') return false
      }
      if (topics.length > 0) {
        const allKeywords = topics
          .flatMap((id) => newsTopics.find((t) => t.id === id)?.keywords ?? [])
        if (!isRelevant(it.title, allKeywords)) return false
      }
      return true
    })
  }

  // Relevanz-Liste immer oben (Schlagworte wie Hitze/Waldbrand/Streik); themen-/sprach-gefiltert.
  const relevantFiltered = useMemo(() => applyFilters(relevant), [relevant, lang, topics])
  const furtherFiltered = useMemo(() => applyFilters(further), [further, lang, topics])

  function toggleTopic(id: string) {
    setTopics((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-3">
      {/* Sprach-Filter */}
      <FilterChips
        options={['de', 'en', 'all'] as const}
        selected={lang === 'all' ? [] : [lang]}
        onToggle={(opt) => setLang(opt === lang ? 'all' : opt)}
        labels={{ de: '🇩🇪 Deutsch', en: '🇬🇧 English', all: 'Alle' }}
      />
      {/* Themen-Filter */}
      <FilterChips
        options={newsTopics.map((t) => t.id)}
        selected={topics}
        onToggle={toggleTopic}
        labels={Object.fromEntries(newsTopics.map((t) => [t.id, t.label]))}
      />

      <SectionTitle icon="📌">Für uns relevant</SectionTitle>
      {relevantFiltered.length === 0 && !loading && (
        <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400 dark:bg-slate-700/40">
          Noch keine relevanten Meldungen.
        </p>
      )}
      <div className="space-y-3">
        {relevantFiltered.map((n, i) => (
          <NewsCardWithTranslate
            key={(n.pubDateMs ?? i) + n.link + i}
            item={n}
            relevant
            onMarkRead={() => markRead(n)}
          />
        ))}
      </div>

      {/* Weitere Meldungen (eingeklappt) */}
      {furtherFiltered.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowFurther((v) => !v)}
            className="w-full rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200"
          >
            {showFurther ? `▼ Weitere Meldungen (${furtherFiltered.length})` : `▶ Weitere Meldungen (${furtherFiltered.length})`}
          </button>
          {showFurther && (
            <div className="space-y-3">
              {furtherFiltered.map((n, i) => (
                <NewsCardWithTranslate
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

/** NewsCard mit zusätzlichem Translate-Button für griechische Treffer. */
function NewsCardWithTranslate({ item, relevant, onMarkRead }: {
  item: FeedItem
  relevant: boolean
  onMarkRead: () => void
}) {
  const isGreek = detectLang(item.title) === 'gr'
  return (
    <div>
      <NewsCard item={item} relevant={relevant} onMarkRead={onMarkRead} />
      {isGreek && item.link && (
        <a
          href={`https://translate.google.com/translate?sl=el&tl=de&u=${encodeURIComponent(item.link)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs font-medium text-zypern-blue hover:underline dark:text-sky-300"
        >
          🇬🇷 Übersetzt öffnen
        </a>
      )}
    </div>
  )
}
