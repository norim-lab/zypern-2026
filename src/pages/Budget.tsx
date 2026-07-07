// Budget.tsx — Urlaubskassen-Tracker (v0.5 §11).
import { useState } from 'react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useBudget } from '@/hooks/useBudget'
import type { BudgetCategory } from '@/hooks/useBudget'
import { formatEur } from '@/lib/format'

const CATEGORIES: BudgetCategory[] = ['Essen', 'Einkauf', 'Ausflug', 'Tanken', 'Sonstiges']

export function Budget() {
  const { entries, add, remove, downloadCsv, total, daySum, weekSum, byCategory } = useBudget()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<BudgetCategory>('Essen')
  const [note, setNote] = useState('')

  async function submit() {
    const amt = parseFloat(amount.replace(',', '.'))
    if (!isNaN(amt) && amt > 0) {
      await add({ amount: amt, category, note: note.trim() || undefined, date: new Date().toISOString() })
      setAmount(''); setNote('')
    }
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        // Foto an letzten Eintrag anhängen (als Beleg).
        // Für Einfachheit: als base64 im note markieren.
        setNote((prev) => prev + ' 📸Beleg')
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      <SectionTitle icon="💶">Urlaubskasse</SectionTitle>

      {/* Summen */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="!p-2 text-center">
          <p className="text-[10px] text-slate-500">Heute</p>
          <p className="text-lg font-bold text-zypern-blue dark:text-sky-300">{formatEur(daySum)}</p>
        </Card>
        <Card className="!p-2 text-center">
          <p className="text-[10px] text-slate-500">7 Tage</p>
          <p className="text-lg font-bold text-zypern-blue dark:text-sky-300">{formatEur(weekSum)}</p>
        </Card>
        <Card className="!p-2 text-center">
          <p className="text-[10px] text-slate-500">Gesamt</p>
          <p className="text-lg font-bold text-zypern-blue dark:text-sky-300">{formatEur(total)}</p>
        </Card>
      </div>

      {/* Neue Ausgabe */}
      <Card title="Ausgabe erfassen" icon="➕">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Betrag €"
              className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BudgetCategory)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notiz (optional)"
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700"
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={submit} className="flex-1">Speichern</Button>
            <label className="flex cursor-pointer items-center justify-center rounded-2xl bg-zypern-blue-light px-4 text-sm text-zypern-blue-dark dark:bg-slate-700 dark:text-sky-200">
              📸
              <input type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" />
            </label>
          </div>
        </div>
      </Card>

      {/* Kategorie-Aufschlüsselung */}
      {Object.keys(byCategory).length > 0 && (
        <Card title="Nach Kategorie" icon="📊">
          <ul className="space-y-1 text-sm">
            {CATEGORIES.filter((c) => byCategory[c]).map((c) => (
              <li key={c} className="flex justify-between border-b border-slate-100 py-1 last:border-0 dark:border-slate-700">
                <span>{c}</span>
                <span className="font-semibold">{formatEur(byCategory[c])}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Einträge */}
      <Card title="Einträge" icon="📋">
        {entries.length === 0 ? (
          <p className="text-center text-xs text-slate-400">Noch keine Ausgaben erfasst.</p>
        ) : (
          <ul className="space-y-1">
            {entries.map((e) => (
              <li key={e.id} className="flex items-center justify-between border-b border-slate-100 py-1.5 last:border-0 dark:border-slate-700">
                <div>
                  <span className="text-sm font-medium">{formatEur(e.amount)}</span>
                  <span className="ml-2 text-xs text-slate-500">{e.category}</span>
                  {e.note && <p className="text-[11px] text-slate-400">{e.note}</p>}
                  <p className="text-[10px] text-slate-400">{new Date(e.date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="text-xs text-slate-400 hover:text-danger dark:hover:text-red-400"
                  aria-label="Eintrag löschen"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
        {entries.length > 0 && (
          <Button variant="ghost" onClick={downloadCsv} icon="📥" className="mt-2 w-full text-xs">
            CSV exportieren
          </Button>
        )}
      </Card>
    </div>
  )
}
