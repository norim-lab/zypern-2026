// =============================================================================
// fetch.js — Vercel Serverless Function (Edge/Node).
// Route: GET /api/fetch?src=<key>
// Holen + Cachen von RSS/HTML serverseitig, um CORS im Browser zu umgehen.
// Kern-Logik in _proxyCore.js (mit der Netlify-Variante geteilt).
// =============================================================================
const { handleFetch } = require('./_proxyCore')

module.exports = async (req, res) => {
  // CORS für die eigene App (gleiches Origin normalerweise, sicherheitshalber).
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=1800') // 30 min CDN-Cache

  const src = req.query?.src
  const result = await handleFetch(src)

  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v)
  }
  res.status(result.status).send(result.body)
}
