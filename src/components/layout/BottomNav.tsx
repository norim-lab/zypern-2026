// BottomNav.tsx — Bottom-Tab-Navigation (6 Tabs).
// Dashboard · Flüge · Wohnen · Auto · Listen · Mehr.
// „Mehr" bündelt Parken Weeze, Ausflüge, Notfall & Gesundheit, Einstellungen.
import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: string
}

const ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/fluege', label: 'Flüge', icon: '✈️' },
  { to: '/wohnen', label: 'Wohnen', icon: '🏡' },
  { to: '/auto', label: 'Auto', icon: '🚗' },
  { to: '/entdecken', label: 'Entdecken', icon: '🧭' },
  { to: '/listen', label: 'Listen', icon: '✅' },
  { to: '/mehr', label: 'Mehr', icon: '⚙️' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-7 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-700 dark:bg-slate-900"
      aria-label="Hauptnavigation"
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/' || item.to === '/entdecken'}
          className={({ isActive }) =>
            `flex min-h-touch flex-col items-center justify-center gap-0.5 py-1 text-[9px] font-medium transition ${
              isActive
                ? 'text-zypern-blue dark:text-sky-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`
          }
        >
          <span className="text-lg" aria-hidden>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
