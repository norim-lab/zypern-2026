// Button.tsx — Wiederverwendbare Schaltfläche als Link oder <button>.
// Große Touch-Ziele (min. 48px Höhe), drei Varianten.
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** Wenn gesetzt: wird als <a> gerendert (extern/Deep-Link). */
  href?: string
  /** Bei href: in neuem Tab öffnen (für externe Links). */
  external?: boolean
  /** Icon-Emoji (optional, vor dem Label) */
  icon?: string
  children: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-zypern-blue text-white hover:bg-zypern-blue-dark active:scale-[0.98]',
  secondary:
    'bg-zypern-blue-light text-zypern-blue-dark hover:bg-sky-100 dark:bg-slate-700 dark:text-sky-200 dark:hover:bg-slate-600',
  ghost:
    'bg-transparent text-zypern-blue hover:bg-zypern-blue-light dark:text-sky-300 dark:hover:bg-slate-700',
  danger: 'bg-danger text-white hover:bg-red-700 active:scale-[0.98]',
}

export function Button({
  variant = 'primary',
  href,
  external,
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const cls = `inline-flex min-h-touch items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition select-none ${VARIANTS[variant]} ${className}`

  if (href) {
    const externalProps = external
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {}
    return (
      <a href={href} className={cls} {...externalProps}>
        {icon && <span aria-hidden>{icon}</span>}
        {children}
      </a>
    )
  }

  return (
    <button className={cls} {...rest}>
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </button>
  )
}
