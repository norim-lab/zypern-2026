// Lists.tsx — To-dos + beide Packlisten (abhakbar, persistent).
import { SectionTitle } from '@/components/ui/SectionTitle'
import { ChecklistWidget } from '@/components/widgets/ChecklistWidget'
import { checklists } from '@/data/tripData'

export function Lists() {
  return (
    <div className="space-y-4 p-4 pb-24">
      <SectionTitle icon="✅">Listen & Packlisten</SectionTitle>

      {checklists.map((list) => (
        <ChecklistWidget key={list.id} checklist={list} />
      ))}

      <p className="text-center text-xs text-slate-400">
        Zustand wird lokal auf diesem Gerät gespeichert (v0.1).
      </p>
    </div>
  )
}
