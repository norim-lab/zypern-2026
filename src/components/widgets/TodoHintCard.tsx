// TodoHintCard.tsx — Hinweiskarte mit den wichtigsten offenen To-dos.
// Wird auf dem Dashboard gezeigt; zählt die offenen Punkte der To-do-Liste.
// v0.7: liest jetzt die editierbaren Listen via useChecklists (statt statischer
// tripData), damit hinzugefügte/umbenannte/gelöschte Einträge korrekt gezählt
// werden. Der Abhak-Key (zyp2026:checklist:todos-open) bleibt identisch.
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useChecklists } from '@/hooks/useChecklists'
import { useNavigate } from 'react-router-dom'

export function TodoHintCard() {
  const { lists, getDone } = useChecklists()
  const todos = lists.find((c) => c.id === 'todos-open')
  const navigate = useNavigate()
  if (!todos) return null

  const done = getDone('todos-open')
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
