// =============================================================================
// OfflineFlightTracker.tsx — „Wo sind wir?" (v0.7.2).
//
// Komplett offline: nutzt NUR die Geolocation-API (GPS = Satelliten-Empfang,
// funktioniert im Flugmodus OHNE Internet). Kein einziger API-Call, nichts
// erfunden. Zeigt die aktuelle Position auf einer statischen SVG-Routen-
// darstellung mit Fortschrittsbalken und %-Zielerreichung.
//
// V0.7.2 Neu:
//  - Prozentuale Zielerreichung (groß + Balken entlang der Linie).
//  - Live-ETA der Landung aus geglätteter Geschwindigkeit (gleitender Mittel
//    der letzten ~5 Min, Ausreißer dämpfen) — nur ab ≥200 km/h.
//  - Hin-/Rückflug-Erkennung (PFO-Ziel am 17.07., NRN-Ziel am 07.08.).
//  - Schreibt die ETA in useJourneyETA (geteilt mit Timeline/Dashboard).
//
// Ohne GPS-Fix: freundlicher Hinweis statt Fehler. watchPosition wird beim
// Verlassen sauber beendet (Akku). Wake Lock hält den Bildschirm an.
// =============================================================================
import { useCallback, useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useWakeLock } from '@/hooks/useWakeLock'
import { useJourneyETA } from '@/hooks/useJourneyETA'
import type { JourneyDirection } from '@/hooks/useJourneyETA'
import { haversineKm } from '@/lib/geo'
import { AIRPORT_COORDS, outboundFlight, returnFlight } from '@/data/tripData'
import { formatDualTime } from '@/lib/format'

const NRN = AIRPORT_COORDS.NRN
const PFO = AIRPORT_COORDS.PFO
const TOTAL_KM = haversineKm(NRN, PFO)

// SVG-Koordinaten-System. NRN oben-links, PFO unten-rechts (statisch, vereinfacht).
const NRN_X = 8
const NRN_Y = 12
const PFO_X = 92
const PFO_Y = 48

/** Ein Geschwindigkeits-Sample für den gleitenden Mittelwert. */
interface SpeedSample {
  ts: number // Epoch-ms
  speedMs: number // m/s
}

interface TrackerState {
  lat: number
  lon: number
  speedMs: number | null
  altitudeM: number | null
  accuracyM: number | null
  updatedAt: number
}

/** Mindestgeschwindigkeit für eine ETA-Anzeige (Reiseflug, keine Standphasen). */
const ETA_MIN_SPEED_KMH = 200
/** Zeitfenster für den gleitenden Mittelwert (5 Min). */
const SPEED_WINDOW_MS = 5 * 60 * 1000

function fmtSpeed(speedMs: number | null): string {
  if (speedMs == null || Number.isNaN(speedMs)) return '—'
  return `${Math.round(speedMs * 3.6)} km/h`
}

function fmtAltitude(altM: number | null): string {
  if (altM == null || Number.isNaN(altM)) return '—'
  return `${Math.round(altM)} m`
}

function fmtKm(km: number): string {
  return `${km.toFixed(0)} km`
}

/**
 * Gleitender Mittelwert der Geschwindigkeit über die letzten ~5 Min.
 * Dämpft kurzfristige Ausreißer (Wind, Kurven, GPS-Toleranz).
 */
function smoothedSpeedMs(samples: SpeedSample[], now: number): number | null {
  const recent = samples.filter((s) => now - s.ts <= SPEED_WINDOW_MS)
  if (recent.length === 0) return null
  const avg = recent.reduce((sum, s) => sum + s.speedMs, 0) / recent.length
  return Number.isFinite(avg) ? avg : null
}

/**
 * Erkennt anhand des aktuellen Datums, ob Hin- (17.07.) oder Rückflug (07.08.)
 * aktuell ist. Default: Hinflug (NRN→PFO), falls außerhalb der Reisetage.
 */
function detectDirection(): JourneyDirection {
  const now = new Date()
  const isReturnDay =
    now.getDate() === 7 &&
    now.getMonth() === 7 && // August (0-basiert)
    now.getFullYear() === 2026
  return isReturnDay ? 'return' : 'outbound'
}

export function OfflineFlightTracker() {
  const [state, setState] = useState<TrackerState | null>(null)
  const [watching, setWatching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const speedSamplesRef = useRef<SpeedSample[]>([])
  const { supported: wakeSupported, active: wakeActive, toggle: wakeToggle } = useWakeLock()
  const { setETA } = useJourneyETA()
  const direction = detectDirection()

  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  // Start/Ziel je nach Richtung.
  const origin = direction === 'outbound' ? NRN : PFO
  const destination = direction === 'outbound' ? PFO : NRN
  const originLabel = direction === 'outbound' ? 'NRN' : 'PFO'
  const destLabel = direction === 'outbound' ? 'PFO' : 'NRN'
  const flightRef = direction === 'outbound' ? outboundFlight : returnFlight

  const stopWatch = useCallback(() => {
    if (watchIdRef.current != null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setWatching(false)
    // Live-ETA zurücksetzen (Timeline fällt auf Planzeiten zurück).
    setETA(direction, null)
  }, [direction, setETA])

  const startWatch = useCallback(() => {
    if (!supported) return
    setError(null)
    setWatching(true)
    speedSamplesRef.current = []
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const c = pos.coords
        const ts = pos.timestamp
        const nextState: TrackerState = {
          lat: c.latitude,
          lon: c.longitude,
          speedMs: c.speed,
          altitudeM: c.altitude,
          accuracyM: c.accuracy,
          updatedAt: ts,
        }
        setState(nextState)
        setError(null)

        // Geschwindigkeits-Sample für gleitenden Mittel sammeln.
        if (c.speed != null && !Number.isNaN(c.speed) && c.speed >= 0) {
          speedSamplesRef.current.push({ ts, speedMs: c.speed })
          // Aufräumen: ältere Samples verwerfen (Fenster + Puffer).
          const cutoff = ts - SPEED_WINDOW_MS * 2
          speedSamplesRef.current = speedSamplesRef.current.filter((s) => s.ts >= cutoff)
        }

        // Live-ETA berechnen (nur ab Reiseflug-Geschwindigkeit).
        const smoothed = smoothedSpeedMs(speedSamplesRef.current, ts)
        const remainingKm = haversineKm({ lat: c.latitude, lon: c.longitude }, destination)
        if (
          smoothed != null &&
          smoothed * 3.6 >= ETA_MIN_SPEED_KMH &&
          remainingKm > 5
        ) {
          const remainingMs = (remainingKm / smoothed) * 1000
          const landingMs = ts + remainingMs
          setETA(direction, landingMs)
        }
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Standortzugriff verweigert — in den Browser-Einstellungen erlauben.'
            : 'Noch kein GPS-Fix — das kann besonders im Flugzeug einen Moment dauern.',
        )
      },
      { enableHighAccuracy: true, timeout: 30_000, maximumAge: 5_000 },
    )
  }, [supported, direction, destination, setETA])

  // Beim Mount automatisch starten, beim Unmount sauber beenden (Akku!).
  useEffect(() => {
    if (supported) startWatch()
    return () => {
      if (watchIdRef.current != null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [supported, startWatch])

  // Fortschritt: zurückgelegt / (zurückgelegt + verbleibend), geklemmt 0..1.
  const traveledKm = state ? haversineKm(origin, state) : 0
  const remainingKm = state ? haversineKm(state, destination) : TOTAL_KM
  const progress = state
    ? Math.min(1, Math.max(0, traveledKm / (traveledKm + remainingKm)))
    : 0
  const progressPct = Math.round(progress * 100)

  // Position des Flugzeugs auf der SVG-Linie (0..1 entlang NRN→PFO).
  const planeX = NRN_X + (PFO_X - NRN_X) * progress
  const planeY = NRN_Y + (PFO_Y - NRN_Y) * progress

  // Geglättete Live-ETA für die Anzeige in dieser Karte.
  const smoothedNow = state
    ? smoothedSpeedMs(speedSamplesRef.current, state.updatedAt)
    : null
  const liveEtaMs = (() => {
    if (!state || smoothedNow == null) return null
    if (smoothedNow * 3.6 < ETA_MIN_SPEED_KMH) return null
    const remaining = haversineKm(state, destination)
    if (remaining <= 5) return null
    const remainingMs = (remaining / smoothedNow) * 1000
    return state.updatedAt + remainingMs
  })()

  return (
    <Card title="✈️ Wo sind wir? (Offline-Tracker)">
      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
        Rein offline via GPS — funktioniert im Flugmodus.{' '}
        {direction === 'outbound' ? (
          <>Hinflug {flightRef.origin.code} → {flightRef.destination.code}</>
        ) : (
          <>Rückflug {flightRef.origin.code} → {flightRef.destination.code}</>
        )}
      </p>

      {/* Prozentuale Zielerreichung groß + Fortschrittsbalken. */}
      <div className="mb-2">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] text-slate-500">Flugfortschritt</p>
          <p className="text-2xl font-bold text-zypern-blue dark:text-sky-300">
            {progressPct}%
          </p>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-zypern-blue transition-all dark:bg-sky-400"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Statische SVG-Routen-Darstellung mit Fortschrittsanteil der Linie. */}
      <div className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-sky-50 dark:border-slate-600 dark:bg-slate-800">
        <svg viewBox="0 0 100 60" className="h-auto w-full" role="img" aria-label="Flugroute mit Fortschritt">
          {/* Volle Route (geplant) als dünne gestrichelte Linie. */}
          <line x1={NRN_X} y1={NRN_Y} x2={PFO_X} y2={PFO_Y} stroke="#94a3b8" strokeWidth={0.8} strokeDasharray="3,2" />
          {/* Zurückgelegter Anteil als dicke Linie (Fortschrittsbalken auf der Route). */}
          {state && (
            <line
              x1={NRN_X}
              y1={NRN_Y}
              x2={planeX}
              y2={planeY}
              stroke="#0c7fa8"
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          )}
          {/* Start. */}
          <circle cx={NRN_X} cy={NRN_Y} r={2.5} fill="#0c7fa8" />
          <text x={NRN_X} y={NRN_Y - 4} fontSize={6} textAnchor="middle" fill="#0c7fa8" fontWeight="bold">NRN</text>
          {/* Ziel. */}
          <circle cx={PFO_X} cy={PFO_Y} r={2.5} fill="#0c7fa8" />
          <text x={PFO_X} y={PFO_Y + 8} fontSize={6} textAnchor="middle" fill="#0c7fa8" fontWeight="bold">PFO</text>
          {/* Aktuelle Position. */}
          {state && (
            <g>
              <circle cx={planeX} cy={planeY} r={3.5} fill="#f59e0b" stroke="#fff" strokeWidth={1} />
              <text x={planeX} y={planeY - 5} fontSize={7} textAnchor="middle">✈️</text>
            </g>
          )}
        </svg>
      </div>

      {/* Status: ohne Fix freundlicher Hinweis, mit Fix die Werte. */}
      {!state && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          🛰️ Suche GPS-Signal … (erster Fix kann dauern)
        </p>
      )}
      {error && <p className="text-sm text-warn dark:text-amber-300">⚠️ {error}</p>}

      {state && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-[11px] text-slate-500">Geschwindigkeit</p>
            <p className="font-semibold">{fmtSpeed(state.speedMs)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Höhe</p>
            <p className="font-semibold">{fmtAltitude(state.altitudeM)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Zurückgelegt (ab {originLabel})</p>
            <p className="font-semibold">{fmtKm(traveledKm)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Verbleibend (bis {destLabel})</p>
            <p className="font-semibold">{fmtKm(remainingKm)}</p>
          </div>
        </div>
      )}

      {/* Live-ETA der Landung (nur ab Reiseflug-Geschwindigkeit, geglättet). */}
      {liveEtaMs != null && (
        <div className="mt-3 rounded-lg bg-amber-50 p-2 text-sm dark:bg-amber-900/20">
          <p className="text-[11px] text-slate-500">Voraussichtliche Landung ({destLabel})</p>
          <p className="font-semibold">
            ≈ {formatDualTime(liveEtaMs)}{' '}
            <span className="text-xs font-normal text-slate-400">
              (bei geglätteter Geschwindigkeit)
            </span>
          </p>
        </div>
      )}

      {/* Hinweistext wie gefordert. */}
      <p className="mt-3 text-xs text-slate-400">
        🪟 Fensterplatz nötig · ⏳ erster GPS-Fix kann dauern ·{' '}
        {wakeSupported ? (
          <button
            type="button"
            onClick={wakeToggle}
            className="text-zypern-blue underline dark:text-sky-300"
          >
            Bildschirm {wakeActive ? 'halten aktiv (an)' : 'anlassen (empfohlen)'}
          </button>
        ) : (
          'Bildschirm anlassen'
        )}
      </p>

      {/* Manuelles Start/Stop (Akku). */}
      <div className="mt-2">
        {watching ? (
          <Button variant="ghost" onClick={stopWatch} className="!min-h-0 !py-1.5 text-xs">
            ⏸ GPS-Tracking stoppen (Akku)
          </Button>
        ) : (
          <Button variant="ghost" onClick={startWatch} className="!min-h-0 !py-1.5 text-xs">
            ▶ GPS-Tracking starten
          </Button>
        )}
      </div>
    </Card>
  )
}
