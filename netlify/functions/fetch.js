// =============================================================================
// fetch.js — Netlify Function-Variante der /api/fetch-Function.
// Route (via netlify.toml Rewrite): GET /api/fetch?src=<key>
// Holen + Cachen von RSS/HTML serverseitig, um CORS im Browser zu umgehen.
// Kern-Logik in api/_proxyCore.js (mit der Vercel-Variante geteilt).
// =============================================================================
const { handleFetch } = require('../../api/_proxyCore')

exports.handler = async (event) => {
  const src = event.queryStringParameters?.src
  const result = await handleFetch(src)

  return {
    statusCode: result.status,
    body: typeof result.body === 'string' ? result.body : JSON.stringify(result.body),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=1800', // 30 min CDN-Cache
      ...(result.headers ?? {}),
    },
  }
}
