// UpcomingEventsCard.tsx — Dashboard-Karte „Demnächst 🎉": nächste 3 Events.
// Events am selben/nächsten Tag werden gelb hervorgehoben.
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useEvents } from '@/hooks/useEvents'
import { formatDate } from '@/lib/format'

export function UpcomingEventsCard() {
  const { upcoming } = useEvents()
  const navigate = useNavigate()
  const now = Date.now()
  const tomorrow = now + 24 * 3600_000

  // Nur zukünftige, max. 3.
  const next = upcoming
    .filter((e) => {
      const ms = 'date' in e ? new Date(e.date).getTime() : e.dateMs ?? 0
      return ms >= now - 12 * 3600_000
    })
    .slice(0, 3)

  if (next.length === 0) return null

  return (
    <Card title="Demnächst 🎉" icon="🎉">
      <ul className="space-y-2">
        {next.map((ev, i) => {
          const ms = 'date' in ev ? new Date(ev.date).getTime() : ev.dateMs ?? 0
          const soon = ms <= tomorrow
          return (
            <li
              key={('date' in ev ? ev.id : ev.url) + i}
              className={`rounded-lg p-2 text-sm ${
                soon ? 'bg-warn-soft dark:bg-amber-900/30' : 'bg-slate-50 dark:bg-slate-700/40'
              }`}
            >
              <p className="font-semibold">{ev.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ms ? formatDate(new Date(ms).toISOString()) : 'Datum offen'}
                {'locationName' in ev && ev.locationName ? ` · 📍 ${ev.locationName}` : ''}
              </p>
              {'url' in ev && ev.url && (
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-zypern-blue hover:underline dark:text-sky-300"
                >
                  Link ↗
                </a>
              )}
            </li>
          )
        })}
      </ul>
      <Button variant="secondary" onClick={() => navigate('/entdecken/events')} icon="📅" className="mt-2 w-full">
        Alle Events
      </Button>
    </Card>
  )
}
