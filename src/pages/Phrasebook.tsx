// Phrasebook.tsx — Griechisch-Spickzettel (v0.5 §12), statisch offline.
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Card } from '@/components/ui/Card'
import { phrasebook, travelTips } from '@/data/phrasebook'

export function Phrasebook() {
  return (
    <div className="space-y-4 p-4 pb-24">
      <SectionTitle icon="🗣️">Griechisch-Spickzettel</SectionTitle>

      {phrasebook.map((group) => (
        <Card key={group.title} title={group.title} icon={group.icon}>
          <ul className="space-y-2">
            {group.phrases.map((p) => (
              <li key={p.de} className="border-b border-slate-100 pb-1.5 last:border-0 dark:border-slate-700">
                <p className="text-sm font-medium">{p.de}</p>
                <p className="text-sm text-zypern-blue-dark dark:text-sky-300">{p.el}</p>
                <p className="text-[11px] italic text-slate-400">[{p.pron}]</p>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <SectionTitle icon="💡">Knigge & Tipps</SectionTitle>
      <div className="space-y-2">
        {travelTips.map((t) => (
          <Card key={t.title} className="!p-3">
            <div className="flex items-start gap-2">
              <span className="text-lg">{t.icon}</span>
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.text}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
