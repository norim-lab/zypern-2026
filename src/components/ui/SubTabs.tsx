// SubTabs.tsx — Untertab-Navigation (horizontal scrollbar) für den Entdecken-Bereich.
import { NavLink } from 'react-router-dom'

export interface SubTabItem {
  to: string
  label: string
  icon: string
  /** true für den index-Route (exact match) */
  end?: boolean
}

export interface SubTabsProps {
  items: SubTabItem[]
}

export function SubTabs({ items }: SubTabsProps) {
  return (
    <nav
      className="-mx-4 mb-3 flex gap-1 overflow-x-auto px-4 pb-1"
      aria-label="Untertabs"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              isActive
                ? 'bg-zypern-blue text-white'
                : 'bg-zypern-blue-light text-zypern-blue-dark dark:bg-slate-700 dark:text-sky-200'
            }`
          }
        >
          <span aria-hidden>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
