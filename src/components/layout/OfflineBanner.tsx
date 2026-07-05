// OfflineBanner.tsx — Hinweis, wenn keine Netzverbindung besteht.
// Stattdessen stille Fehler; die App bleibt über Cache nutzbar.
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (online) return null
  return (
    <div
      role="status"
      className="sticky top-0 z-20 bg-warn px-3 py-2 text-center text-xs font-medium text-white"
    >
      📴 Offline — Daten evtl. nicht aktuell. Buchungsdaten bleiben verfügbar.
    </div>
  )
}
