# 🏖️ Zypern 2026

Private Familien-Urlaubs-App (PWA) für unseren Urlaub in Aradippou (Zypern),
17.07.–07.08.2026. Läuft im Browser auf iPhone & Android, ist auf den Homescreen
installierbar, komplett auf Deutsch und ohne Login.

> 🔒 **Privat:** Dieses Repo enthält persönliche Reisedaten (Namen, Adresse,
> Buchungscodes, Sitzplätze, Kennzeichen, Hotline). Nicht teilen / nicht öffentlich machen.

## Stack
- Vite + React 19 + TypeScript (Strict)
- Tailwind CSS (mobile-first, Dark-Mode, Zypern-Design-Tokens)
- React Router v6 (Bottom-Tab-Navigation)
- vite-plugin-pwa (Manifest + Service Worker + Offline-Caching)
- date-fns

## Starten

```bash
npm install      # Abhängigkeiten installieren
npm run dev      # Entwicklung (http://localhost:5173)
npm run build    # Produktions-Build + Service-Worker-Generierung
npm run preview  # Build lokal testen
```

## Architektur (v0.2+-bereit)

- **Reisedaten zentral & typisiert** in `src/data/tripData.ts` (Single Source of
  Truth) – getrennt vom UI. Typen in `src/data/types.ts`.
- **Austauschbare Provider** (`WeatherProvider`, `FlightStatusProvider`) in
  `src/providers/` mit einheitlichem Interface → späterer Dienstwechsel ohne
  UI-Anpassung, nur in `src/providers/index.ts` gebunden.
- **Kleine, wiederverwendbare Komponenten** in `src/components/`, Kommentare DE.
- **Pfad-Alias `@/`** → `src/`.

## Bereiche (v0.3)

| Tab | Inhalt |
|-----|--------|
| Dashboard | Countdown, Wetter (live + 7 Tage) + Hitze-Banner + Sonnenuntergang, Flugstatus an Reisetagen, Schnellzugriffe, Strandtasche (Reset), To-do-Hinweis |
| Flüge | FR3878 / FR3879 mit Planzeiten, Sitzen, Gepäck, Flightradar24-/Ryanair-Buttons |
| Wohnen | Damian Home, Adresse, Maps-Deep-Links, Poolsicherheit (rote Warnung), Umgebung |
| Auto | Mietwagen Auto Europe / Get Your Car, Bedingungen, Kaution, Hotline |
| **Entdecken** | **Untertabs:** Strände · Ausflüge · Essen · Events · News (siehe unten) |
| Listen | To-dos + 2 Packlisten + Strandtasche (abhakbar, persistent in localStorage) |
| Mehr | Parken Weeze, Notfall & Gesundheit, Archiv-Link, Roadmap-Platzhalter |
| Archiv | Abgelaufene Events, alte News, erledigte To-dos (IndexedDB) |

### Entdecken im Detail

- **🏖️ Strände:** 13 Strände mit Live-Wasserdaten (Open-Meteo Marine, **Batch-Request** für alle),
  „Heute gut"-Badge (Welle <0,5 m & Wind <25 km/h), Filter, Detailansicht mit Sonnenuntergang.
- **🗺️ Ausflüge:** 13 Ziele mit Koordinaten, Kinder-/Schatten-Notes, Paphos als Abreisetag-Tipp.
- **🍽️ Essen:** Kuratierte Startpunkte (keine erfundenen Namen) + Favoriten/Notizen +
  „In der Nähe suchen"-Kacheln + **Familien-Sterne** + **Speisekarten-Foto-Upload** (IndexedDB) +
  Maps-Bewertungs-/Speisekarten-Buttons.
- **🛒 Einkaufen (v0.4):** Märkte nach Entfernung + Online-Prospekte mit Translate-Buttons
  (DE/EN via Google-Wrapper); abgelaufene Angebote → Archiv.
- **🎉 Events:** Konfigurierte Quellen (RSS automatisch, sonst Link-Kachel) + manuell
  erfassbare Events (Panigiria) + **„Zum Kalender hinzufügen" (ICS-Download)**;
  vergangen → automatisch ins Archiv.
- **📰 News:** RSS via Proxy-Kette, Relevanz-Filter, „Für uns relevant" oben,
  >48 h/gelesen → Archiv. **v0.4:** Sprach-Filter DE/EN/Alle + Themen-Filter
  (Zypern/Larnaka/Aradippou/Touristisch); griechische Treffer → „Übersetzt öffnen".

## Module

- **Doppelte Zeitanzeige 🇨🇾/🇩🇪 (v0.4):** zentrales `formatDualTime` — alle Uhrzeiten
  (Sonnenauf-/untergang, Flüge, Events, Aktualisierung) zeigen Zypern-Zeit groß +
  deutsche Zeit in Klammern. Sommerzeit-sicher via Intl.DateTimeFormat.
- **Wetter:** Open-Meteo (keyless), Standort umschaltbar Aradippou/Weeze +
  **Zuhause-Widget** (Heimatort konfigurierbar, default Weeze).
- **Wetter-Detail (v0.4):** Stundenverlauf heute + morgen (Temperatur, gefühlt,
  Niederschlag, UV, Wind), horizontal scrollbar + „Jetzt"-Markierung +
  goldene Stunde (letzte Stunde vor Sonnenuntergang).
- **Marine (Strände):** Open-Meteo Marine als **Batch-Provider** — alle Strände
  in EINEM Request (statt 13 Einzel-Calls), 60 min Cache + manueller Refresh.
- **Flugstatus:** `ScheduledTimeProvider` (Planzeiten + Flightradar24-/Ryanair-Buttons);
  `OpenSkyProvider` als Stub für späteren Key-Betrieb vorbereitet.
- **Restaurants (v0.4):** Default = Maps-Buttons + Familien-Sterne + Foto-Upload +
  Link-Feld. Mit `VITE_PLACES_API_KEY` aktiviert sich `PlacesRestaurantProvider`
  automatisch (Rating, „jetzt geöffnet", Preisniveau).
- **Übersetzung (v0.4):** Default = Originaltext + Google-Translate-Wrapper-Links;
  optional LibreTranslate-/DeepL-Instanz via `VITE_TRANSLATE_API_*`.
- **News/Events:** zentrale **Proxy-Kette** (siehe Deployment) — eigene
  Serverless-Function → allorigins-Fallback → Link-Kachel. Nie leerer Screen.
- **Refresh:** zentraler `RefreshScheduler` (statt verstreuter `setInterval`):
  Marine/Events/News 1×/h · Wetter 30 min · Flugstatus 5 min an Reisetagen.
  Triggert zusätzlich bei `visibilitychange` und `online`; pausiert im Hintergrund (Akku).
- **Archiv:** IndexedDB (via `idb-keyval`), max. 500 Einträge, nur manuelles Löschen.
- **Datenschutz:** Personenbezogene Werte gekapselt in `src/data/privateData.ts`;
  `VITE_PRIVATE_MODE=true` blendet sie im UI aus („•••") für Screenshots/Demos.
- **Offline:** Service Worker precacht alle statischen Assets → Buchungsdaten
  immer offline verfügbar (Flugzeug!). Wetter/Marine via Runtime-Cache.
- **Robustheit:** alle Fetches mit 10-s-Timeout + 1 Retry (AbortController);
  API-Antworten werden validiert; Error Boundary je Tab; Update-/Offline-Banner.

## Deployment

Die App ist eine statische PWA. Für News/Events gibt es eine optionale
Serverless-Function (`/api/fetch?src=<key>`) mit fester Quellen-Whitelist +
30–60 min Cache. Ohne sie läuft die App weiter (allorigins-Fallback).

### Vercel
- Repo importieren; `vercel.json` liegt bei (Build `npm run build`, Output `dist`,
  SPA-Rewrite). Die Function unter `api/fetch.js` wird automatisch erkannt.

### Netlify
- Repo importieren; `netlify.toml` liegt bei (Publish `dist`, Functions
  `netlify/functions/`, Rewrite `/api/fetch` → `/.netlify/functions/fetch`).

### IONOS/Hestia (GitHub Actions) — PHP-Proxy

Für den IONOS-Server (Hestia CP) läuft das Deployment vollautomatisch über
GitHub Actions (`.github/workflows/deploy.yml`). Da auf Apache-Hosting **keine**
Vercel-/Netlify-Functions laufen, gibt es eine eigene **PHP-Variante** des
Proxys (`server/fetch.php`), die ins Build nach `dist/api/fetch.php` kopiert
und mit ausgeliefert wird.

**Proxy-Kette im Client** (`src/lib/proxyChain.ts`):
1. `/api/fetch.php?src=…` (IONOS, PHP) → 2. `/api/fetch?src=…` (Vercel/Netlify)
   → 3. `allorigins` → 4. Link-Kachel. Pro Stufe wird die Erreichbarkeit **einmal
   pro Session** geprüft und gemerkt (kein Request-Spam).

**`fetch.php`** hat eine identische, feste Quellen-Whitelist wie
`api/_proxyCore.js` (News, Events, Flugstatus, Apotheken, Tankpreise, Angebote),
30-min File-Cache (`dist/api/cache/`, per `.htaccess` gesperrt), 12-s-Timeout
und CORS-/Content-Type-Header. Fremde URLs außerhalb der Whitelist → **403**.

> ⚠️ **Proxy-Quellen pflegen:** Die Whitelist existiert in zwei Dateien
> (`api/_proxyCore.js` für Vercel/Netlify und `server/fetch.php` für IONOS).
> Eine neue Quelle muss in **beide** eingetragen werden.

**Einrichtung (einmalig):**
1. **Secrets** im GitHub-Repo setzen (Settings → Secrets → Actions):
   `SSH_HOST`, `SSH_USERNAME`, `SSH_PASSWORD` (gleiche Namen wie im story-Repo;
   keine FTP-Secrets).
2. **Subdomain** in Hestia anlegen (z. B. `zypern.zeitblytz.media`) — dabei
   wird das Zielverzeichnis `/home/miron777/web/zypern.zeitblytz.media/public_html`
   automatisch erzeugt. Pfad ggf. im Workflow (`DEPLOY_PATH`) anpassen.
3. **Push auf `main`** triggert den Workflow: `npm ci` → `npm run build` →
   `server/fetch.php` nach `dist/api/` kopieren → Preflight (SSH: `mkdir -p` +
   Schreibtest) → natives **SCP mit sshpass** (3 Versuche + Retry) → Verify
   (`index.html`, `sw.js`, `api/fetch.php`).
4. Nach erstem erfolgreichen Lauf: App unter der Subdomain öffnen, alle Tabs
   testen, im Netzwerk-Tab prüfen, dass News/Events über `/api/fetch.php`
   laden (nicht `allorigins`), PWA-Installation + Offline-Modus testen.

### Rein statisch (z. B. GitHub Pages)
- `npm run build` → `dist/` hosten. News/Events nutzen dann allorigins-Fallback.

### Privat-Modus (für Screenshots/Demos)
```bash
VITE_PRIVATE_MODE=true npm run build   # personenbezogene Werte → „•••"
```

## Roadmap

- **v0.4:** Sync mit Notion-Hub, geteilte Checklisten (mehrere Geräte), Tagesplaner
- **v0.5:** Fotos/Erinnerungen, Budget-Tracker, Push-Benachrichtigungen
- **v0.6:** Automatisches Deployment auf IONOS/Hestia (GitHub Actions) + PHP-Proxy
  (`/api/fetch.php`) — PWA-Update-Banner erscheint auf installierten Geräten.
- **v0.7:** Hotfix `.htaccess` (Hestia-kompatibel) · editierbare Checklisten mit
  Gruppen + „Packliste Miron" · Heimatort Bad Neuenahr · Sonnenzeiten für Zuhause
  überall · Verkehrskennzeichnung „ohne Verkehr" + Maps-Verkehr-Buttons ·
  Reisetags-Karten (Flughafen/Haus/Heimfahrt) · TrafficProvider-Stub.
