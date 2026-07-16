// Lists.tsx — To-dos + Packlisten (abhakbar + editierbar, persistent) (v0.7).
//
// Nutzt useChecklists (zentraler Hook): Items/Gruppen/Listen editierbar,
// Seeds werden einmalig eingespielt, Änderungen überleben Updates.
// Packliste Miron (personenbezogen) wird im Privat-Modus ausgeblendet.
import { SectionTitle } from '@/components/ui/SectionTitle'
import { ChecklistWidget } from '@/components/widgets/ChecklistWidget'
import { useChecklists } from '@/hooks/useChecklists'
import { PRIVATE_MODE } from '@/hooks/usePrivateMode'

export function Lists() {
  const api = useChecklists()

  // Privat-Modus: personenbezogene Packliste Miron ausblenden (Medikamente!).
  const visibleLists = api.lists.filter((l) => l.id !== 'pack-miron' || !PRIVATE_MODE)

  return (
    <div className="space-y-4 p-4 pb-24">
      <SectionTitle icon="✅">Listen & Packlisten</SectionTitle>

      {visibleLists.map((list) => (
        <ChecklistWidget
          key={list.id}
          checklist={list}
          done={api.getDone(list.id)}
          onToggle={(itemId) => api.toggleItem(list.id, itemId)}
          onAddItem={(label, groupId) => api.addItem(list.id, label, groupId)}
          onUpdateItem={(itemId, label) => api.updateItem(list.id, itemId, label)}
          onRemoveItem={(itemId) => api.removeItem(list.id, itemId)}
          onAddGroup={(title) => api.addGroup(list.id, title)}
          onUpdateGroup={(groupId, title) => api.updateGroup(list.id, groupId, title)}
          onRemoveGroup={(groupId) => api.removeGroup(list.id, groupId)}
          // Reset nur für zurücksetzbare Listen (Strandtasche).
          onReset={list.id === 'strandtasche' ? () => api.reset(list.id) : undefined}
        />
      ))}

      <p className="text-center text-xs text-slate-400">
        Einträge werden lokal gespeichert und überstehen App-Updates (v0.7).
      </p>
    </div>
  )
}
