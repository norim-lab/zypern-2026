// Tag.tsx — Kleine Badge (z. B. Strand-Tags: flach, ruhig, ...).
import type { ReactNode } from 'react'

export interface TagProps {
  children: ReactNode
  /** Farbton (optional) */
  tone?: 'blue' | 'green' | 'amber' | 'slate'
  icon?: string
}

const TONES: Record<NonNullable<TagProps['tone']>, string> = {
  blue: 'bg-zypern-blue-light text-zypern-blue-dark dark:bg-sky-900/40 dark:text-sky-200',
  green: 'bg-ok-soft text-ok dark:bg-green-900/40 dark:text-green-200',
  amber: 'bg-warn-soft text-warn dark:bg-amber-900/40 dark:text-amber-200',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
}

export function Tag({ children, tone = 'slate', icon }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${TONES[tone]}`}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </span>
  )
}
