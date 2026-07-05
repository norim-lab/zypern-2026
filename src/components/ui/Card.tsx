// Card.tsx — Basis-Kartenprimitive für das kartenbasierte Layout.
import type { ReactNode } from 'react'

export interface CardProps {
  /** Karteninhalt */
  children: ReactNode
  /** zusätzliche Tailwind-Klassen */
  className?: string
  /** Titel (optional, als kleine Überschrift oben) */
  title?: string
  /** Icon/Titel-Emoji (optional) */
  icon?: string
}

export function Card({ children, className = '', title, icon }: CardProps) {
  return (
    <section className={`card-base ${className}`}>
      {title && (
        <header className="mb-2 flex items-center gap-2">
          {icon && <span className="text-xl" aria-hidden>{icon}</span>}
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zypern-blue dark:text-zypern-blue-light">
            {title}
          </h2>
        </header>
      )}
      {children}
    </section>
  )
}
