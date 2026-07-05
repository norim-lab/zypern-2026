// =============================================================================
// refreshScheduler.ts — Zentraler Refresh-Scheduler (statt verstreuter setInterval).
//
// Eigenschaften (nach Aufgabe):
//   - Registriert Tasks mit ihrem Intervall (Marine/Events/News 1×/h, Wetter 30 min,
//     Flugstatus 5 min an Reisetagen).
//   - Triggert sofort bei visibilitychange (App in den Vordergrund) und beim
//     online-Event (Netz wieder da).
//   - Pausiert Timer, solange die App im Hintergrund ist (Akku!).
//
// Nutzung: jeder Hook registriert seinen Refresh via useRefreshTask (siehe unten).
// =============================================================================

export interface RefreshTask {
  /** Eindeutige ID. */
  id: string
  /** Refresh-Intervall in ms. */
  intervalMs: number
  /** Die eigentliche Refresh-Funktion (sollte Fehler selbst abfangen). */
  run: () => void | Promise<void>
}

const tasks = new Map<string, RefreshTask>()
const timers = new Map<string, ReturnType<typeof setInterval>>()
let started = false

function schedule(task: RefreshTask) {
  // Pausieren, wenn die App im Hintergrund ist — nicht beim every-render.
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
  const id = setInterval(() => {
    if (document.visibilityState === 'visible') void task.run()
  }, task.intervalMs)
  timers.set(task.id, id)
}

function unschedule(id: string) {
  const t = timers.get(id)
  if (t) {
    clearInterval(t)
    timers.delete(id)
  }
}

/** Registriert eine Task beim Scheduler. */
export function registerRefreshTask(task: RefreshTask): void {
  tasks.set(task.id, task)
  if (started) schedule(task)
}

/** Entfernt eine Task. */
export function unregisterRefreshTask(id: string): void {
  tasks.delete(id)
  unschedule(id)
}

/** Startet den Scheduler + globale Listener (einmalig, z.B. in main.tsx). */
export function startRefreshScheduler(): void {
  if (started || typeof document === 'undefined') return
  started = true

  // Alle registrierten Tasks timern.
  tasks.forEach(schedule)

  // Bei Fokus-Wechsel in den Vordergrund: alle Tasks einmalig ausführen.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      tasks.forEach((t) => void t.run())
    }
  })

  // Bei „wieder online": alle Tasks einmalig ausführen.
  if (typeof window !== 'undefined' && 'ononline' in window) {
    window.addEventListener('online', () => {
      tasks.forEach((t) => void t.run())
    })
  }
}

/** Manuelles Triggern aller (oder einer konkreten) Task — für Pull-to-refresh. */
export function triggerRefresh(id?: string): void {
  if (id) {
    const t = tasks.get(id)
    if (t) void t.run()
    return
  }
  tasks.forEach((t) => void t.run())
}
