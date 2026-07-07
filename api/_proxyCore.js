// =============================================================================
// _proxyCore.js — Geteilte Kern-Logik der /api/fetch-Function.
//
// Wird von der Vercel-Variante (api/fetch.js) UND der Netlify-Variante
// (netlify/functions/fetch.js) importiert, damit die Whitelist + Cache-Logik
// an einer Stelle gepflegt wird.
//
// Aufgabe: serverseitiges Holten + Cachen (30–60 min) von RSS/HTML-Quellen,
// um CORS-Probleme im Browser zu umgehen. Feste Quellen-Whitelist.
// =============================================================================

/** Feste Quellen-Whitelist (srcKey → URL). Kein Freikämpfen für andere URLs. */
const SOURCES = {
  // News
  'cyprus-mail': 'https://cyprus-mail.com/feed/',
  incyprus: 'https://in-cyprus.philenews.com/feed/',
  'gnews-de-zypern': 'https://news.google.com/rss/search?q=Zypern+OR+Larnaka+OR+Aradippou&hl=de&gl=DE&ceid=DE:de',
  'gnews-de-tourismus': 'https://news.google.com/rss/search?q=Zypern+Tourismus+OR+Urlaub&hl=de&gl=DE&ceid=DE:de',
  // Events
  'larnakaregion': 'https://larnakaregion.com/events',
  visitcyprus: 'https://www.visitcyprus.com/events/',
  'incyprus-events': 'https://in-cyprus.philenews.com/category/events/',
  'allaboutlimassol': 'https://allaboutlimassol.com/events/',
  visitcyprusEvents: 'https://www.visitcyprus.com/index.php/info/events',
  // Flugstatus (v0.5)
  'hermes-pfo': 'https://www.hermesairports.com/flight-info/arrivals-and-departures-pfo',
  // Notdienst-Apotheken (v0.5)
  'onduty-larnaca': 'https://cyprus.ondutypharmacy.com/larnaca/',
  // Tankpreise (v0.5)
  'cyprusfuelguide': 'https://cyprusfuelguide.com/',
}

/** In-Memory-Cache: srcKey → { text, expiry }. Überlebt warme Function-Instanzen. */
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 min
const cache = new Map()

/** Liefert den gecachten Text, solange gültig; sonst null. */
function readCache(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.text
}

function writeCache(key, text) {
  cache.set(key, { text, expiry: Date.now() + CACHE_TTL_MS })
}

/**
 * Kern-Handler: erwartet src als Query-Param, prüft Whitelist, holt serverseitig.
 * @returns {{status:number, body:string, headers:Object}|{status:number, body:string}}
 */
async function handleFetch(src) {
  if (!src || !(src in SOURCES)) {
    return {
      status: 400,
      body: 'Ungültige Quelle (src fehlt oder nicht in Whitelist).',
    }
  }
  const url = SOURCES[src]

  const cached = readCache(src)
  if (cached) {
    return {
      status: 200,
      body: cached,
      headers: { 'X-Cache': 'HIT' },
    }
  }

  try {
    const res = await fetch(url, {
      // Kurzer serverseitiger Timeout (12 s) — Browser wartet max. 10 s.
      signal: AbortSignal.timeout(12_000),
      headers: { 'User-Agent': 'Zypern2026-PWA/1.0 (private travel app)' },
    })
    if (!res.ok) {
      return { status: 502, body: `Quelle antwortet ${res.status}` }
    }
    const text = await res.text()
    writeCache(src, text)
    return { status: 200, body: text, headers: { 'X-Cache': 'MISS' } }
  } catch (err) {
    return {
      status: 502,
      body: `Fehler beim Holen der Quelle: ${err?.message ?? 'unbekannt'}`,
    }
  }
}

module.exports = { handleFetch, SOURCES }
