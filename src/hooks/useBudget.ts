// useBudget.ts — Urlaubskassen-Tracker, offline in IndexedDB (v0.5 §11).
import { useCallback, useEffect, useState } from 'react'
import { get, set as idbSet } from 'idb-keyval'

export type BudgetCategory = 'Essen' | 'Einkauf' | 'Ausflug' | 'Tanken' | 'Sonstiges'

export interface BudgetEntry {
  id: string
  amount: number
  category: BudgetCategory
  note?: string
  /** dataURL für Belegfoto (optional) */
  receiptPhoto?: string
  date: string // ISO
}

const STORE_KEY = 'zyp2026:budget'

export function useBudget() {
  const [entries, setEntries] = useState<BudgetEntry[]>([])

  useEffect(() => {
    void get<BudgetEntry[]>(STORE_KEY).then((e) => setEntries(e ?? []))
  }, [])

  const persist = useCallback(async (next: BudgetEntry[]) => {
    setEntries(next)
    await idbSet(STORE_KEY, next)
  }, [])

  const add = useCallback(async (entry: Omit<BudgetEntry, 'id'>) => {
    const full: BudgetEntry = { ...entry, id: `b-${Date.now()}` }
    await persist([full, ...entries])
  }, [entries, persist])

  const remove = useCallback(async (id: string) => {
    await persist(entries.filter((e) => e.id !== id))
  }, [entries, persist])

  /** CSV-Export aller Einträge. */
  const exportCsv = useCallback((): string => {
    const header = 'Datum,Betrag,Kategorie,Notiz\n'
    const rows = entries.map((e) =>
      `${e.date},${e.amount.toFixed(2)},"${e.category}","${(e.note ?? '').replace(/"/g, '""')}"`,
    ).join('\n')
    return header + rows
  }, [entries])

  /** Download des CSV als Datei. */
  const downloadCsv = useCallback(() => {
    const csv = exportCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `urlaubskasse-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [exportCsv])

  // Aggregierte Werte.
  const total = entries.reduce((s, e) => s + e.amount, 0)
  const today = new Date().toISOString().slice(0, 10)
  const daySum = entries.filter((e) => e.date.slice(0, 10) === today).reduce((s, e) => s + e.amount, 0)
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7)
  const weekSum = entries.filter((e) => new Date(e.date) >= weekStart).reduce((s, e) => s + e.amount, 0)
  const byCategory = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount; return acc
  }, {})

  return { entries, add, remove, exportCsv, downloadCsv, total, daySum, weekSum, byCategory }
}
