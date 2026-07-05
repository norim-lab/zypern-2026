// InfoRow.tsx — Zweispaltige Label-/Wert-Zeile (z. B. „Buchungscode: B3VHMK").
import type { ReactNode } from 'react'

export interface InfoRowProps {
  label: string
  children: ReactNode
  /** Wert monocase hervorheben (z. B. Codes) */
  mono?: boolean
}

export function InfoRow({ label, children, mono }: InfoRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-2 last:border-0 dark:border-slate-700">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className={`text-right text-sm font-medium text-slate-800 dark:text-slate-100 ${mono ? 'font-mono' : ''}`}>
        {children}
      </dd>
    </div>
  )
}
