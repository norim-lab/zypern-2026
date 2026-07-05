// NewsCard.tsx — Eine News-Meldung mit Quelle, Zeit, Link + „gelesen" archivieren.
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { formatRelativeTime } from '@/lib/format'
import type { FeedItem } from '@/lib/rss'

export interface NewsCardProps {
  item: FeedItem
  relevant: boolean
  onMarkRead: () => void
}

export function NewsCard({ item, relevant, onMarkRead }: NewsCardProps) {
  return (
    <Card className="!p-3">
      <div className="flex items-center gap-2">
        {relevant && <Tag tone="amber" icon="📌">Für uns relevant</Tag>}
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.source}</span>
        {item.pubDateMs && (
          <span className="ml-auto text-[11px] text-slate-400">
            {formatRelativeTime(item.pubDateMs)}
          </span>
        )}
      </div>
      <h3 className="mt-1 text-sm font-semibold leading-snug">{item.title}</h3>
      <div className="mt-2 flex items-center gap-3">
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zypern-blue hover:underline dark:text-sky-300"
          >
            Öffnen ↗
          </a>
        )}
        <button
          type="button"
          onClick={onMarkRead}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          ✓ als gelesen
        </button>
      </div>
    </Card>
  )
}
