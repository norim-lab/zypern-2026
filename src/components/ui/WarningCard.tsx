// WarningCard.tsx — Farbige Hinweis-/Warnkarte (Pool, Kaution, Bordkarten etc.).
// Stufen: 'danger' (rot), 'warn' (orange), 'ok' (grün), 'info' (blau).
import type { ReactNode } from 'react'

export type WarningLevel = 'danger' | 'warn' | 'ok' | 'info'

export interface WarningCardProps {
  /** Schweregrad */
  level?: WarningLevel
  /** Titel */
  title: string
  /** Icon-Emoji (optional, default nach Level) */
  icon?: string
  /** Hauptinhalt */
  children?: ReactNode
  /** Aufzählungspunkte (optional) */
  bullets?: string[]
}

const STYLES: Record<WarningLevel, { wrap: string; head: string; defaultIcon: string }> = {
  danger: {
    wrap: 'border-danger bg-danger-soft text-red-900 dark:bg-red-950/40 dark:text-red-100',
    head: 'text-danger dark:text-red-400',
    defaultIcon: '🔴',
  },
  warn: {
    wrap: 'border-warn bg-warn-soft text-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
    head: 'text-amber-700 dark:text-amber-300',
    defaultIcon: '🟠',
  },
  ok: {
    wrap: 'border-ok bg-ok-soft text-green-900 dark:bg-green-950/40 dark:text-green-100',
    head: 'text-ok dark:text-green-400',
    defaultIcon: '🟢',
  },
  info: {
    wrap: 'border-zypern-blue bg-zypern-blue-light text-sky-900 dark:bg-sky-950/40 dark:text-sky-100',
    head: 'text-zypern-blue dark:text-sky-300',
    defaultIcon: 'ℹ️',
  },
}

export function WarningCard({ level = 'info', title, icon, children, bullets }: WarningCardProps) {
  const s = STYLES[level]
  return (
    <section
      role="note"
      className={`rounded-card border-l-4 p-4 shadow-sm ${s.wrap}`}
    >
      <header className={`mb-1 flex items-center gap-2 font-semibold ${s.head}`}>
        <span aria-hidden>{icon ?? s.defaultIcon}</span>
        <span>{title}</span>
      </header>
      {children && <div className="text-sm leading-relaxed">{children}</div>}
      {bullets && bullets.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
