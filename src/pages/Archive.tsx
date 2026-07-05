// Archive.tsx — Vollbild-Archivseite (übergreifend für alle Module).
import { SectionTitle } from '@/components/ui/SectionTitle'
import { ArchiveView } from '@/components/discover/ArchiveView'

export function Archive() {
  return (
    <div className="p-4 pb-24">
      <SectionTitle icon="🗄️">Archiv</SectionTitle>
      <ArchiveView />
    </div>
  )
}
