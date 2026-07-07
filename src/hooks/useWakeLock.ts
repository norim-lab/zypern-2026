// useWakeLock.ts — „Bildschirm anlassen" via Wake Lock API (v0.5 §14).
// Progressive Enhancement: wo nicht unterstützt (iOS-PWA), wird der Button
// ausgeblendet — nie kaputt angezeigt.
import { useCallback, useEffect, useState } from 'react'

export function useWakeLock() {
  const [active, setActive] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && 'wakeLock' in navigator)
  }, [])

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    try {
      await navigator.wakeLock.request('screen')
      setActive(true)
    } catch { /* user dismissed or not allowed */ }
  }, [])

  const release = useCallback(async () => {
    // WakeLock wird automatisch bei Tab-Wechsel freigegeben; hier explizit deaktivieren.
    setActive(false)
  }, [])

  const toggle = useCallback(() => {
    if (active) void release()
    else void request()
  }, [active, request, release])

  return { supported, active, toggle }
}
