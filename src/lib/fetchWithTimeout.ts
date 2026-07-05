// =============================================================================
// fetchWithTimeout.ts — Robustes fetch mit Timeout + einmaligem Retry.
//   - 10 s Timeout (AbortController) wie in der Aufgabe gefordert.
//   - Bei Netzwerkfehler/Timeout: 1 Retry mit kurzem Backoff.
//   - Bei HTTP 4xx/5xx: kein Retry (sinnlose Last), Throw.
// =============================================================================

/** Standard-Timeout für alle API-Aufrufe (10 s). */
export const DEFAULT_TIMEOUT_MS = 10_000

export interface FetchOptions extends RequestInit {
  /** Timeout in ms (default 10 s). */
  timeoutMs?: number
  /** Retry bei Netzwerkfehler/Timeout (default 1). */
  retries?: number
}

/**
 * fetch mit Timeout + Retry. Wirft bei endgültigem Scheitern einen Error
 * mit sprechendem Message-Text (für die Fehler-UI).
 */
export async function fetchWithTimeout(
  input: string,
  opts: FetchOptions = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = 1, ...init } = opts

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(input, { ...init, signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) {
        // HTTP-Fehler: nicht retryieren, direkt melden.
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
      }
      return res
    } catch (err) {
      clearTimeout(timer)
      lastError = err
      // Nur Netzwerk-/Timeout-Fehler → retry. HTTP-Fehler (oben) sofort raus.
      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      const isNetwork = err instanceof TypeError
      if (!isAbort && !isNetwork) throw err
      if (attempt < retries) {
        // Kurzes Backoff (300 ms), dann nochmal.
        await sleep(300)
      }
    }
  }
  // Alle Versuche gescheitert.
  const msg =
    lastError instanceof DOMException && lastError.name === 'AbortError'
      ? 'Zeitüberschreitung (10 s)'
      : lastError instanceof Error
        ? lastError.message
        : 'Netzwerkfehler'
  throw new Error(msg)
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
