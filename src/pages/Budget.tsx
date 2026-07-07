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
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>(undefined)
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)

  async function submit() {
    const amt = parseFloat(amount.replace(',', '.'))
    if (!isNaN(amt) && amt > 0) {
      await add({
        amount: amt, category,
        note: note.trim() || undefined,
        receiptPhoto,
        date: new Date().toISOString(),
      })
      setAmount(''); setNote(''); setReceiptPhoto(undefined)
    }
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const dataUrl = await resizeImage(file, 1280)
      setReceiptPhoto(dataUrl)
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
          {/* Foto-Vorschau vor dem Speichern */}
          {receiptPhoto && (
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
              <img src={receiptPhoto} alt="Beleg-Vorschau" className="h-16 w-16 rounded-lg object-cover" />
              <button type="button" onClick={() => setReceiptPhoto(undefined)} className="text-xs text-slate-400 hover:text-danger">✕ entfernen</button>
            </div>
          )}
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
                <div className="flex items-start gap-2">
                  {/* Thumbnail (Tap = groß) */}
                  {e.receiptPhoto && (
                    <button onClick={() => setViewPhoto(e.receiptPhoto!)} className="shrink-0">
                      {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                      <img src={e.receiptPhoto} alt="Beleg" className="h-12 w-12 rounded-lg object-cover" />
                    </button>
                  )}
                  <div>
                    <span className="text-sm font-medium">{formatEur(e.amount)}</span>
                    <span className="ml-2 text-xs text-slate-500">{e.category}</span>
                    {e.note && <p className="text-[11px] text-slate-400">{e.note}</p>}
                    <p className="text-[10px] text-slate-400">{new Date(e.date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
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

      {/* Vollbild-Belegfoto */}
      {viewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setViewPhoto(null)}>
          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
          <img src={viewPhoto} alt="Beleg (groß)" className="max-h-[90vh] max-w-[90vw] rounded-lg" />
        </div>
      )}
    </div>
  )
}

/** Verkleinert ein Bild auf maxWidth via Canvas; liefert dataURL (JPEG). */
async function resizeImage(file: File, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas nicht verfügbar'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
