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
  „In der Nähe suchen"-Kacheln.
- **🎉 Events:** Konfigurierte Quellen (RSS automatisch, sonst Link-Kachel) + manuell
  erfassbare Events (Panigiria), vergangen → automatisch ins Archiv.
- **📰 News:** RSS via Proxy-Kette, Relevanz-Filter, „Für uns relevant" oben,
  >48 h/gelesen → Archiv.

## Module

- **Wetter:** Open-Meteo (keyless), Standort umschaltbar Aradippou/Weeze.
- **Marine (Strände):** Open-Meteo Marine als **Batch-Provider** — alle Strände
  in EINEM Request (statt 13 Einzel-Calls), 60 min Cache + manueller Refresh.
- **Flugstatus:** `ScheduledTimeProvider` (Planzeiten + Flightradar24-/Ryanair-Buttons);
  `OpenSkyProvider` als Stub für späteren Key-Betrieb vorbereitet.
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

### Rein statisch (z. B. GitHub Pages)
- `npm run build` → `dist/` hosten. News/Events nutzen dann allorigins-Fallback.

### Privat-Modus (für Screenshots/Demos)
```bash
VITE_PRIVATE_MODE=true npm run build   # personenbezogene Werte → „•••"
```

## Roadmap

- **v0.4:** Sync mit Notion-Hub, geteilte Checklisten (mehrere Geräte), Tagesplaner
- **v0.5:** Fotos/Erinnerungen, Budget-Tracker, Push-Benachrichtigungen
