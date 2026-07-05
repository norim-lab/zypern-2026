// TabErrorBoundary.tsx — Error Boundary je Tab (kein leerer Screen bei Crash).
// Fängt Render-Fehler im Tab-Inhalt ab und zeigt eine freundliche Meldung +
// „Neu laden"-Aktion. Daten-Hooks fangen ihre eigenen Fehler bereits via Cache;
// hier geht es um unerwartete Render-Crashes (z. B. kaputte API-Struktur).
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Tab-Name für sprechenden Hinweis. */
  tabName?: string
}

interface State {
  hasError: boolean
  message?: string
}

export class TabErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unbekannter Fehler',
    }
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    // Konsolen-Log (Privatgerät, kein Telemetry-Dienst).
    console.error('Tab-Fehler:', error, info)
  }

  reset = () => {
    this.setState({ hasError: false, message: undefined })
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="space-y-3 p-4">
        <div className="rounded-card border-l-4 border-danger bg-danger-soft p-4 text-red-900 dark:bg-red-950/40 dark:text-red-100">
          <h2 className="font-semibold">⚠️ Etwas ging schief{this.props.tabName ? ` (${this.props.tabName})` : ''}.</h2>
          <p className="mt-1 text-sm">{this.state.message}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={this.reset}
              className="rounded-full bg-danger px-3 py-1.5 text-xs font-semibold text-white"
            >
              Erneut versuchen
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold text-red-700"
            >
              App neu laden
            </button>
          </div>
        </div>
      </div>
    )
  }
}
