// =============================================================================
// proxyChain.ts — Robuste Proxy-Kette für RSS/HTML-Aufrufe (News + Events).
//
// CORS-Realität: Direkte Browser-Fetches auf fremde Feeds scheitern meist an
// CORS. Daher eine absteigende Kette:
//   (1) Eigene Serverless-Function /api/fetch?src=<KEY> mit fester Quellen-
//       Whitelist + 30–60 min Server-Cache (deploy-fertig für Vercel/Netlify,
//       siehe api/ + netlify/functions/). Wird nur genutzt, wenn vorhanden.
//   (2) Fallback allorigins.win (öffentlich, ohne eigenen Server).
//   (3) Letzte Stufe: null — der Aufrufer zeigt die Quelle als Link-Kachel.
//
// fetchWithTimeout (10 s + Retry) überall; Fehler werden nie zu einem leeren
// Screen führen — die Hooks zeigen gecachte Daten mit Hinweis.
// =============================================================================
import { fetchWithTimeout } from './fetchWithTimeout'

const ALLOrigins = 'https://api.allorigins.win/raw?url='

/**
 * Versucht, den Inhalt einer Quelle über die Proxy-Kette zu laden.
 * Liefert den Text (RSS/HTML) oder null, wenn alle Stufen scheitern.
 *
 * @param srcKey  Schlüssel aus der Whitelist der Function (z. B. „cyprus-mail").
 *                Wenn null/leer, wird direkt nur allorigins genutzt.
 * @param rawUrl  Direkte URL der Quelle (für den allorigins-Fallback).
 */
export async function fetchViaProxy(srcKey: string | null, rawUrl: string): Promise<string | null> {
  // (1) Eigene Function (nur wenn ein srcKey gesetzt ist → Quelle in Whitelist).
  if (srcKey) {
    const own = await tryFetch(`/api/fetch?src=${encodeURIComponent(srcKey)}`)
    if (own !== null) return own
  }

  // (2) allorigins-Fallback.
  const proxied = await tryFetch(`${ALLOrigins}${encodeURIComponent(rawUrl)}`)
  if (proxied !== null) return proxied

  // (3) Alle Stufen gescheitert.
  return null
}

/** fetchWithTimeout + null bei Fehler (statt Throw). */
async function tryFetch(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) return null
    const text = await res.text()
    return text.length > 0 ? text : null
  } catch {
    return null
  }
}
