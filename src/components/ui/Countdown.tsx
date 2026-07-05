// Countdown.tsx — Große Ziffern-Anzeige für den Reise-Countdown.
import type { CountdownTarget, CountdownValue } from '@/hooks/useCountdown'

export interface CountdownProps {
  target: CountdownTarget | null
  value: CountdownValue
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function Countdown({ target, value }: CountdownProps) {
  if (!target) {
    return (
      <div className="card-base text-center">
        <p className="text-lg font-semibold text-zypern-blue dark:text-zypern-blue-light">
          🏖️ Urlaub läuft — gute Heimreise!
        </p>
      </div>
    )
  }

  const cells: { v: number; label: string }[] = [
    { v: value.days, label: 'Tage' },
    { v: value.hours, label: 'Std' },
    { v: value.minutes, label: 'Min' },
    { v: value.seconds, label: 'Sek' },
  ]

  return (
    <div className="card-base text-center">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Countdown bis {target.label}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl bg-zypern-blue/10 p-2 dark:bg-sky-900/30"
          >
            <div className="text-3xl font-extrabold tabular-nums text-zypern-blue dark:text-sky-300">
              {pad(c.v)}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
