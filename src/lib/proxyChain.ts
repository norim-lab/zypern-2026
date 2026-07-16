// =============================================================================
// proxyChain.ts — Robuste Proxy-Kette für RSS/HTML-Aufrufe (News + Events).
//
// CORS-Realität: Direkte Browser-Fetches auf fremde Feeds scheitern meist an
// CORS. Daher eine absteigende Kette:
//   (1) Eigene PHP-Function /api/fetch.php?src=<KEY> (IONOS/Hestia, Apache) —
//       mit fester Quellen-Whitelist + 30 min File-Cache. Wird nur genutzt,
//       wenn in dieser Session als erreichbar erkannt.
//   (2) Eigene Serverless-Function /api/fetch?src=<KEY> (Vercel/Netlify) —
//       gleiche Whitelist + 30 min Cache. Wird nur genutzt, wenn vorhanden.
//   (3) Fallback allorigins.win (öffentlich, ohne eigenen Server).
//   (4) Letzte Stufe: null — der Aufrufer zeigt die Quelle als Link-Kachel.
//
// Erreichbarkeits-Check: Pro Stufe wird EINMAL pro Session geprüft, ob sie
// erreichbar ist (kleiner Probe-Aufruf mit Whitelist-Quelle). Das Ergebnis
// wird gemerkt — fehlende Stufen werden danach gar nicht mehr angefragt
// (kein Request-Spam bei jedem News-/Event-Laden).
//
// fetchWithTimeout (10 s + Retry) überall; Fehler werden nie zu einem leeren
// Screen führen — die Hooks zeigen gecachte Daten mit Hinweis.
// =============================================================================
import { fetchWithTimeout } from './fetchWithTimeout'

const ALLOrigins = 'https://api.allorigins.win/raw?url='

// --- Session-Verfügbarkeit der Proxy-Stufen --------------------------------
// Drei Stufen: 'php' (IONOS), 'js' (Vercel/Netlify), 'allorigins' (öffentlich).
// null = „noch nicht geprüft", true/false nach erstem Probe-Request.
type Tier = 'php' | 'js' | 'allorigins'
const tierAvailable: Record<Tier, boolean | null> = { php: null, js: null, allorigins: null }

/**
 * Prüft EINMAL pro Session, ob eine Proxy-Stufe erreichbar ist.
 * Probe-Aufruf mit einer echten Whitelist-Quelle (cyprus-mail ist immer
// in der Whitelist). Bei Erfolg/echtem Inhalt → true, sonst false.
 * Folge-Aufrufe in derselben Session liefern direkt das gemerkte Ergebnis.
 */
async function probeTier(tier: Tier, probeUrl: string): Promise<boolean> {
  if (tierAvailable[tier] !== null) {
    return tierAvailable[tier] as boolean
  }
  const ok = await probeFetch(probeUrl)
  tierAvailable[tier] = ok
  return ok
}

/** Probe-Aufruf: bringt nicht-leeren Text zurück? (Kurz-Timeout.) */
async function probeFetch(url: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(url, { timeoutMs: 8_000 })
    if (!res.ok) return false
    const text = await res.text()
    return text.length > 0
  } catch {
    return false
  }
}

/**
 * Versucht, den Inhalt einer Quelle über die Proxy-Kette zu laden.
 * Liefert den Text (RSS/HTML) oder null, wenn alle Stufen scheitern.
 *
 * @param srcKey  Schlüssel aus der Whitelist der Function (z. B. „cyprus-mail").
 *                Wenn null/leer, wird direkt nur allorigins genutzt.
 * @param rawUrl  Direkte URL der Quelle (für den allorigins-Fallback).
 */
export async function fetchViaProxy(srcKey: string | null, rawUrl: string): Promise<string | null> {
  // (1) Eigene PHP-Function (IONOS/Hestia) — nur wenn srcKey gesetzt & Stufe verfügbar.
  if (srcKey) {
    const phpOk = await probeTier('php', `/api/fetch.php?src=cyprus-mail`)
    if (phpOk) {
      const php = await tryFetch(`/api/fetch.php?src=${encodeURIComponent(srcKey)}`)
      if (php !== null) return php
    }
  }

  // (2) Eigene JS-Function (Vercel/Netlify) — nur wenn srcKey gesetzt & Stufe verfügbar.
  if (srcKey) {
    const jsOk = await probeTier('js', `/api/fetch?src=cyprus-mail`)
    if (jsOk) {
      const js = await tryFetch(`/api/fetch?src=${encodeURIComponent(srcKey)}`)
      if (js !== null) return js
    }
  }

  // (3) allorigins-Fallback — mit Session-Check.
  const aoOk = await probeTier('allorigins', `${ALLOrigins}${encodeURIComponent('https://cyprus-mail.com/feed/')}`)
  if (aoOk) {
    const proxied = await tryFetch(`${ALLOrigins}${encodeURIComponent(rawUrl)}`)
    if (proxied !== null) return proxied
  }

  // (4) Alle Stufen gescheitert.
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
