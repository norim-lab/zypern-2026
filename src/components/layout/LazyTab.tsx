// LazyTab.tsx — Suspense + Error-Boundary Wrapper für route-basiertes Code-Splitting.
// Zeigt ein dezentes Lade-Skeleton, während der Chunk lädt, und fängt Render-
// Fehler des Tabs ab (kein leerer Screen bei Crash).
import { Suspense, type ComponentType } from 'react'
import { TabErrorBoundary } from './TabErrorBoundary'

export interface LazyTabProps {
  /** Lazy-geladene Komponente. */
  component: ComponentType
  /** Tab-Name für die Error-Boundary. */
  tabName?: string
}

function TabFallback() {
  return (
    <div className="space-y-3 p-4" aria-busy="true" aria-live="polite">
      <div className="h-24 animate-pulse rounded-card bg-slate-200/60 dark:bg-slate-700/40" />
      <div className="h-32 animate-pulse rounded-card bg-slate-200/60 dark:bg-slate-700/40" />
      <div className="h-32 animate-pulse rounded-card bg-slate-200/60 dark:bg-slate-700/40" />
      <p className="text-center text-xs text-slate-400">Lade …</p>
    </div>
  )
}

export function LazyTab({ component: Comp, tabName }: LazyTabProps) {
  return (
    <TabErrorBoundary tabName={tabName}>
      <Suspense fallback={<TabFallback />}>
        <Comp />
      </Suspense>
    </TabErrorBoundary>
  )
}
