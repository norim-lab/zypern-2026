// PwaUpdateBanner.tsx — Zeigt einen „Neue Version verfügbar"-Banner, sobald der
// Service Worker ein Update erkennt. Verhindert, dass die installierte App
// still auf dem Homescreen veraltet.
import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      // Still — kein Crash; nur Konsole (Privatgerät).
      console.warn('SW-Registrierung fehlgeschlagen', error)
    },
  })

  // Close-Gedächtnis: einmalig verworfen → nicht sofort wieder nerven.
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    if (needRefresh) setDismissed(false)
  }, [needRefresh])

  if (!needRefresh || dismissed) return null

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-50 m-2 flex items-center justify-between gap-2 rounded-card bg-zypern-blue px-3 py-2 text-sm text-white shadow-lg"
      style={{ top: 'env(safe-area-inset-top)' }}
    >
      <span className="min-w-0">
        🔄 <span className="font-semibold">Neue Version verfügbar</span> — jetzt neu laden?
      </span>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zypern-blue"
        >
          Neu laden
        </button>
        <button
          type="button"
          onClick={() => {
            setNeedRefresh(false)
            setDismissed(true)
          }}
          className="rounded-full bg-white/20 px-2 py-1 text-xs"
          aria-label="Hinweis schließen"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
