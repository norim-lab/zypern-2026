// =============================================================================
// usePrivateMode.ts — Datenschutz-Schalter für Demos/Screenshots.
//
// Aktiviert via Build-Variable VITE_PRIVATE_MODE=true. Maskiert alle
// personenbezogenen Werte im UI („•••"), sodass die App gefahrlos für
// Screenshots/Demos geöffnet werden kann. Die Rohdaten liegen weiterhin
// unverändert in privateData.ts.
// =============================================================================

/** Wahr, wenn der Privat-Modus beim Build aktiviert wurde. Einmalig ausgewertet. */
export const PRIVATE_MODE: boolean = import.meta.env.VITE_PRIVATE_MODE === 'true'

/** Maskierungs-Platzhalter. */
export const MASK = '•••'

/**
 * Maskiert einen Wert, falls der Privat-Modus aktiv ist.
 * Sonst: Wert unverändert zurückgeben.
 */
export function mask<T>(value: T): T | string {
  return PRIVATE_MODE ? MASK : value
}

/** Hook — liefert den aktuellen Status (für bedingte UI-Hinweise). */
export function usePrivateMode(): { enabled: boolean; mask: typeof mask } {
  return { enabled: PRIVATE_MODE, mask }
}
