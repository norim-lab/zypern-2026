// ManualEventForm.tsx — Manuelles Erfassen eines Events (Dorffest/Panigiri etc.).
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { ManualEvent } from '@/data/types'

export interface ManualEventFormProps {
  onAdd: (ev: ManualEvent) => void
}

const today = () => new Date().toISOString().slice(0, 10)

export function ManualEventForm({ onAdd }: ManualEventFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today())
  const [locationName, setLocationName] = useState('')
  const [note, setNote] = useState('')
  const [url, setUrl] = useState('')

  function submit() {
    if (!title.trim()) return
    onAdd({
      id: `me-${Date.now()}`,
      title: title.trim(),
      date,
      locationName: locationName.trim() || undefined,
      note: note.trim() || undefined,
      url: url.trim() || undefined,
    })
    setTitle('')
    setLocationName('')
    setNote('')
    setUrl('')
    setOpen(false)
  }

  if (!open) {
    return (
      <Button variant="secondary" icon="➕" onClick={() => setOpen(true)} className="w-full">
        Eigenes Event erfassen (Dorffest / Panigiri)
      </Button>
    )
  }

  return (
    <Card title="Eigenes Event" icon="✍️">
      <div className="space-y-2 text-sm">
        <Field label="Titel *">
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Panigiri Agios ..."/>
        </Field>
        <Field label="Datum *">
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Ort">
          <input className={inputCls} value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="z. B. Aradippou"/>
        </Field>
        <Field label="Notiz">
          <textarea className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </Field>
        <Field label="Link (optional)">
          <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
        </Field>
        <div className="flex gap-2 pt-1">
          <Button variant="primary" onClick={submit} className="flex-1">Speichern</Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
        </div>
      </div>
    </Card>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-700'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-xs text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  )
}
