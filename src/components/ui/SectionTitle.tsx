// SectionTitle.tsx — Überschrift für einen Bereich innerhalb einer Seite.
import type { ReactNode } from 'react'

export interface SectionTitleProps {
  children: ReactNode
  icon?: string
  /**optionale Aktion rechts (z. B. Bearbeiten) */
  action?: ReactNode
}

export function SectionTitle({ children, icon, action }: SectionTitleProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
        {icon && <span aria-hidden>{icon}</span>}
        {children}
      </h2>
      {action}
    </div>
  )
}
