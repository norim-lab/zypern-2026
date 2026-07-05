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

## Bereiche (v0.1)

| Tab | Inhalt |
|-----|--------|
| Dashboard | Countdown, Wetter (live + 7 Tage), Flugstatus an Reisetagen, Schnellzugriffe, To-do-Hinweis |
| Flüge | FR3878 / FR3879 mit Planzeiten, Sitzen, Gepäck, Flightradar24-/Ryanair-Buttons |
| Wohnen | Damian Home, Adresse, Maps-Deep-Links, Poolsicherheit (rote Warnung), Umgebung |
| Auto | Mietwagen Auto Europe / Get Your Car, Bedingungen, Kaution, Hotline |
| Listen | To-dos + 2 Packlisten (abhakbar, persistent in localStorage) |
| Mehr | Parken Weeze, Ausflüge, Notfall & Gesundheit, Roadmap-Platzhalter |

## Module

- **Wetter:** Open-Meteo (keyless), Standort umschaltbar Aradippou/Weeze,
  Auto-Refresh 30 min + bei App-Fokus, Offline-Cache.
- **Flugstatus:** Default `ScheduledTimeProvider` (Planzeiten + externe
  Live-Buttons), da OpenSky nicht mehr keyless ist. `OpenSkyProvider` als Stub
  vorbereitet.
- **Offline:** Service Worker precacht alle statischen Assets → Buchungsdaten
  immer offline verfügbar (Flugzeug!). Wetter wird via Runtime-Cache
  (StaleWhileRevalidate, 30 min) zwischengespeichert.

## Roadmap

- **v0.2:** Sync mit Notion-Hub, geteilte Checklisten (mehrere Geräte), Tagesplaner
- **v0.3:** Fotos/Erinnerungen, Budget-Tracker, Push-Benachrichtigungen
