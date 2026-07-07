// useWakeLock.ts — „Bildschirm anlassen" via Wake Lock API (v0.5 §14).
// v0.5.1 Fix #3: Sentinel in einem Ref halten; release() ruft sentinel.release()
// auf; visibilitychange reaktiviert den Wake Lock, wenn die App wieder sichtbar ist.
import { useCallback, useEffect, useRef, useState } from 'react'

export function useWakeLock() {
  const [active, setActive] = useState(false)
  const [supported, setSupported] = useState(false)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && 'wakeLock' in navigator)
  }, [])

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    try {
      const s = await navigator.wakeLock.request('screen')
      sentinelRef.current = s
      // Auf 'release'-Event hören (z. B. Tab-Wechsel) → State sync.
      s.addEventListener('release', () => {
        setActive(false)
        sentinelRef.current = null
      })
      setActive(true)
    } catch { /* user dismissed or not allowed */ }
  }, [])

  const release = useCallback(async () => {
    const s = sentinelRef.current
    if (s) {
      try { await s.release() } catch { /* ignore */ }
      sentinelRef.current = null
    }
    setActive(false)
  }, [])

  const toggle = useCallback(() => {
    if (active) void release()
    else void request()
  }, [active, request, release])

  // Bei visibilitychange: falls die App wieder sichtbar wird und der Wake Lock
  // vorher aktiv war → neu anfordern (Wake Lock wird bei Tab-Wechsel freigegeben).
  useEffect(() => {
    const handler = async () => {
      if (document.visibilityState === 'visible' && active && !sentinelRef.current) {
        await request()
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [active, request])

  return { supported, active, toggle }
}
