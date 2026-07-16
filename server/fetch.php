<?php
// =============================================================================
// fetch.php — PHP-Variante der /api/fetch-Function (IONOS/Hestia, Apache).
//
// Auf shared Apache-Hosting (IONOS/Hestia) laufen keine Vercel-/Netlify-
// Functions. Diese Datei übernimmt deren Aufgabe serverseitig:
// Holen + Cachen (30 min) von RSS/HTML-Quellen, um CORS im Browser zu umgehen.
//
// Route: GET /api/fetch.php?src=<key>
// Identische Quellen-Whitelist wie api/_proxyCore.js — an EINER Stelle
// gepflegt bedeutet hier: jede Änderung MUSS in beide Dateien eingetragen
// werden (siehe README „Proxy-Quellen pflegen").
//
// Sicherheit: Feste Quellen-Whitelist. Fremde URLs außerhalb der Whitelist
// werden mit 403 abgelehnt — nichts erfinden, nichts durchreichen.
// =============================================================================

declare(strict_types=1);

// --- Leere Seiteneffekte abschalten, Fehler als 502 melden -------------------
ini_set('display_errors', '0');
error_reporting(E_ALL);

// --- Feste Quellen-Whitelist (identisch zu api/_proxyCore.js) ----------------
// WICHTIG: Nur Schlüssel aus dieser Liste sind erlaubt. Kein Durchreichen
// beliebiger URLs — sonst hätte man einen offenen Proxy gebaut.
const SOURCES = [
    // News
    'cyprus-mail'           => 'https://cyprus-mail.com/feed/',
    'incyprus'              => 'https://in-cyprus.philenews.com/feed/',
    'gnews-de-zypern'       => 'https://news.google.com/rss/search?q=Zypern+OR+Larnaka+OR+Aradippou&hl=de&gl=DE&ceid=DE:de',
    'gnews-de-tourismus'    => 'https://news.google.com/rss/search?q=Zypern+Tourismus+OR+Urlaub&hl=de&gl=DE&ceid=DE:de',
    // Events
    'larnakaregion'         => 'https://larnakaregion.com/events',
    'visitcyprus'           => 'https://www.visitcyprus.com/events/',
    'incyprus-events'       => 'https://in-cyprus.philenews.com/category/events/',
    'allaboutlimassol'      => 'https://allaboutlimassol.com/events/',
    'visitcyprusEvents'     => 'https://www.visitcyprus.com/index.php/info/events',
    // Flugstatus (v0.5)
    'hermes-pfo'            => 'https://www.hermesairports.com/flight-info/arrivals-and-departures-pfo',
    // Notdienst-Apotheken (v0.5)
    'onduty-larnaca'        => 'https://cyprus.ondutypharmacy.com/larnaca/',
    // Tankpreise (v0.5)
    'cyprusfuelguide'       => 'https://cyprusfuelguide.com/',
    // Angebote (v0.4 — wiederhergestellt v0.5.1 Fix #2)
    'lidl-cy'               => 'https://www.lidl.com.cy/angebote',
    'alphamega'             => 'https://www.alphamega.com.cy/offers',
    'sklavenitis'           => 'https://www.sklavenitis.com.cy/offers',
];

// Cache-Konfiguration (identisch zu _proxyCore.js: 30 min).
const CACHE_TTL_SECONDS = 30 * 60;            // 30 min
const UPSTREAM_TIMEOUT_SECONDS = 12;          // 12 s serverseitig (Browser: 10 s)
const CACHE_DIR = __DIR__ . '/cache';         // File-Cache; per .htaccess gesperrt

// --- Antwort senden ---------------------------------------------------------

/**
 * Sendet HTTP-Header + Body und beendet das Skript sauber.
 */
function respond(int $status, string $body, array $headers = []): void
{
    http_response_code($status);
    // CORS für die eigene App (gleiches Origin normalerweise, sicherheitshalber).
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: text/plain; charset=utf-8');
    // Impliziter Server-Cache-Hinweis für eventuelle CDN/Proxys (30 min).
    header('Cache-Control: public, max-age=1800');
    foreach ($headers as $key => $value) {
        header($key . ': ' . $value);
    }
    echo $body;
    exit;
}

// --- File-Cache (entspricht dem In-Memory-Cache der JS-Variante) ------------

/**
 * Sichere, schlanke Schlüssel-Datei: nur [a-z0-9-] aus dem srcKey selbst,
 * gebaut via preg_replace (Whitelist-Zeichen). Verhindert Pfad-Traversierung.
 */
function cachePath(string $srcKey): string
{
    $safe = preg_replace('/[^a-z0-9-]/', '', $srcKey) ?: 'unknown';
    return CACHE_DIR . '/' . $safe . '.cache';
}

/**
 * Liefert den gecachten Text, solange gültig; sonst null.
 */
function readCache(string $srcKey): ?string
{
    $path = cachePath($srcKey);
    if (!is_file($path)) return null;
    $expiry = (int) filemtime($path);
    if (time() > $expiry + CACHE_TTL_SECONDS) {
        @unlink($path);
        return null;
    }
    $data = @file_get_contents($path);
    return is_string($data) && $data !== '' ? $data : null;
}

/**
 * Schreibt den Text in den File-Cache (mit aktueller mtime als Zeitstempel).
 */
function writeCache(string $srcKey, string $text): void
{
    if (!is_dir(CACHE_DIR)) {
        @mkdir(CACHE_DIR, 0775, true);
    }
    $path = cachePath($srcKey);
    // Temp-Datei + rename = atomar (kein halbfertiger Cache bei gleichzeitigen
    // Requests an die gleiche Quelle).
    $tmp = $path . '.tmp';
    if (@file_put_contents($tmp, $text) !== false) {
        @rename($tmp, $path);
    } else {
        @unlink($tmp);
    }
}

// --- Upstream-Holen ---------------------------------------------------------

/**
 * Holt die Quelle serverseitig mit cURL + Timeout. Liefert den Text oder null.
 */
function fetchUpstream(string $url): ?array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_TIMEOUT        => UPSTREAM_TIMEOUT_SECONDS,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_USERAGENT      => 'Zypern2026-PWA/1.0 (private travel app)',
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $errno  = curl_errno($ch);
    curl_close($ch);

    if ($errno !== 0 || $body === false || $body === '') return null;
    if ($status < 200 || $status >= 300) return null;
    return ['status' => $status, 'body' => $body];
}

// --- Haupt-Logik ------------------------------------------------------------

$src = isset($_GET['src']) ? (string) $_GET['src'] : '';

// (1) Whitelist-Prüfung. src fehlt oder nicht in Whitelist → 400/403.
//   - 400: src fehlt/gar nicht vorhanden (Bedienfehler)
//   - 403: src gesetzt, aber NICHT in Whitelist (Sicherheits-Grenze: kein
//          offener Proxy). Aufgabe fordert 403 für „fremde URLs außerhalb der
//          Whitelist" — exakt dieser Fall.
if ($src === '') {
    respond(400, 'Ungültige Quelle (src fehlt oder nicht in Whitelist).');
}
if (!array_key_exists($src, SOURCES)) {
    respond(403, 'Quelle nicht erlaubt (Whitelist).');
}
$url = SOURCES[$src];

// (2) Cache HIT?
$cached = readCache($src);
if ($cached !== null) {
    respond(200, $cached, ['X-Cache' => 'HIT']);
}

// (3) Upstream holen.
$result = fetchUpstream($url);
if ($result === null) {
    // Entspricht „Quelle antwortet nicht" aus der JS-Variante (dort 502).
    respond(502, 'Fehler beim Holen der Quelle (Timeout/HTTP-Fehler).');
}

writeCache($src, $result['body']);
respond(200, $result['body'], ['X-Cache' => 'MISS']);
