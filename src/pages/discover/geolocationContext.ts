// geolocationContext.ts — React-Context, der den Layout-Standort an Sub-Seiten reicht.
import { createContext } from 'react'
import type { UseGeolocationResult } from '@/hooks/useGeolocation'

/** Liefert den aktuellen Standort + Quelle + Refresh aus dem DiscoverLayout. */
export const GeolocationContext = createContext<UseGeolocationResult | null>(null)
