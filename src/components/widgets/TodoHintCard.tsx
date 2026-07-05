// TodoHintCard.tsx — Hinweiskarte mit den wichtigsten offenen To-dos.
// Wird auf dem Dashboard gezeigt; zählt die offenen Punkte der To-do-Liste.
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useNavigate } from 'react-router-dom'
import { checklists } from '@/data/tripData'

export function TodoHintCard() {
  const todos = checklists.find((c) => c.id === 'todos-open')
  const navigate = useNavigate()
  const [done] = useLocalStorage<Record<string, boolean>>('zyp2026:checklist:todos-open', {})
  if (!todos) return null

  const openItems = todos.items.filter((i) => !done[i.id])
  const top = openItems.slice(0, 3)

  return (
    <Card title="Wichtigste offene To-dos" icon="📌">
      {top.length === 0 ? (
        <p className="text-sm text-ok dark:text-green-400">🎉 Alles erledigt — bereit für den Urlaub!</p>
      ) : (
        <ul className="mb-3 list-disc space-y-1 pl-5 text-sm">
          {top.map((i) => (
            <li key={i.id}>{i.label}</li>
          ))}
        </ul>
      )}
      {openItems.length > top.length && (
        <p className="mb-3 text-xs text-slate-400">
          +{openItems.length - top.length} weitere offene Punkte
        </p>
      )}
      <Button variant="secondary" onClick={() => navigate('/listen')} icon="✅">
        Zur To-do-Liste
      </Button>
    </Card>
  )
}
