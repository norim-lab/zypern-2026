// =============================================================================
// validation.ts — Leichtgewichtige Runtime-Guards für API-Antworten.
// Kaputte Antworten dürfen nie die App crashen — Guards liefern ggf. undefined.
// =============================================================================

/** Wahr, wenn x ein nicht-null Objekt ist. */
export function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

/** Liefert eine Zahl oder undefined — schützt vor NaN/strings. */
export function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return undefined
}

/** Liefert einen String oder undefined. */
export function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

/** Liefert ein Array (getypet) oder [] — schützt vor „X is not iterable". */
export function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

/**
 * Sichere Pfadextraktion aus verschachtelten Objekten.
 * Beispiel: getPath(res, ['daily', 'time']) → string[] | undefined
 */
export function getPath(obj: unknown, path: (string | number)[]): unknown {
  let cur: unknown = obj
  for (const key of path) {
    if (!isObject(cur) && !Array.isArray(cur)) return undefined
    cur = (cur as Record<string | number, unknown>)[key]
  }
  return cur
}
