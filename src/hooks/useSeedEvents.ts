// useSeedEvents.ts — Einspielen fester Event-Seeds beim ersten Start (v0.5 §6).
import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { seedEvents } from '@/data/tripData'
import type { ManualEvent } from '@/data/types'

const SEED_FLAG = 'zyp2026:seeds-v05-injected'

export function useSeedEvents() {
  const [injected, setInjected] = useLocalStorage<boolean>(SEED_FLAG, false)

  useEffect(() => {
    if (injected) return
    // Seeds in die manuelle Events-Liste einspeisen (nur einmal).
    const key = 'zyp2026:manual-events'
    try {
      const raw = localStorage.getItem(key)
      const existing: ManualEvent[] = raw ? JSON.parse(raw) : []
      const seedIds = new Set(seedEvents.map((s) => s.id))
      const filtered = existing.filter((e) => !seedIds.has(e.id))
      const next = [...seedEvents, ...filtered]
      localStorage.setItem(key, JSON.stringify(next))
    } catch { /* ignore */ }
    setInjected(true)
  }, [injected, setInjected])
}
