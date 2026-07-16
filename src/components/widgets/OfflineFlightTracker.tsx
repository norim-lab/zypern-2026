// =============================================================================
// OfflineFlightTracker.tsx — „Wo sind wir?" (v0.7.1).
//
// Komplett offline: nutzt NUR die Geolocation-API (GPS = Satelliten-Empfang,
// funktioniert im Flugmodus OHNE Internet). Kein einziger API-Call, nichts
// erfunden. Zeigt die aktuelle Position auf einer statischen SVG-Routen-
// darstellung NRN→PFO (Linie + Positions-Punkt, KEINE Online-Karte!).
//
// Inhalte (alles nur wenn verfügbar, sonst weglassen — nicht erfinden):
//  - Geschwindigkeit (coords.speed → km/h) und Höhe (coords.altitude)
//  - zurückgelegte Distanz ab NRN + verbleibende bis PFO (Haversine)
//  - grobe Rest-Flugzeit aus aktueller Geschwindigkeit
//
// Ohne GPS-Fix: freundlicher Hinweis statt Fehler. watchPosition wird beim
// Verlassen der Karte sauber beendet (Akku). Wake Lock hält den Bildschirm an.
// =============================================================================
import { useCallback, useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useWakeLock } from '@/hooks/useWakeLock'
import { haversineKm } from '@/lib/geo'
import { AIRPORT_COORDS, outboundFlight } from '@/data/tripData'

const NRN = AIRPORT_COORDS.NRN
const PFO = AIRPORT_COORDS.PFO
const TOTAL_KM = haversineKm(NRN, PFO)

// SVG-Koordinaten-System: x=0..100 (Breite), y=0..100 (Höhe).
// NRN oben-links, PFO unten-rechts — simplifizierte, statische Darstellung.
const SVG_W = 100
const SVG_H = 60
const NRN_X = 8
const NRN_Y = 12
const PFO_X = 92
const PFO_Y = 48

interface TrackerState {
  lat: number
  lon: number
  speedMs: number | null
  altitudeM: number | null
  accuracyM: number | null
  updatedAt: number
}

function fmtSpeed(speedMs: number | null): string {
  if (speedMs == null || Number.isNaN(speedMs)) return '—'
  const kmh = speedMs * 3.6
  return `${Math.round(kmh)} km/h`
}

function fmtAltitude(altM: number | null): string {
  if (altM == null || Number.isNaN(altM)) return '—'
  return `${Math.round(altM)} m`
}

function fmtKm(km: number): string {
  return `${km.toFixed(0)} km`
}

function fmtRemainingMin(distanceKm: number, speedMs: number | null): string {
  if (speedMs == null || speedMs <= 5) return '—' // zu langsam / nicht verfügbar
  const speedKmh = speedMs * 3.6
  if (speedKmh < 200) return '—' // unrealistisch niedrig (Stand/Wartezeit)
  const hours = distanceKm / speedKmh
  const min = Math.round(hours * 60)
  if (!Number.isFinite(min) || min < 0) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `~${h} h ${m} min` : `~${m} min`
}

export function OfflineFlightTracker() {
  const [state, setState] = useState<TrackerState | null>(null)
  const [watching, setWatching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const { supported: wakeSupported, active: wakeActive, toggle: wakeToggle } = useWakeLock()

  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  const stopWatch = useCallback(() => {
    if (watchIdRef.current != null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setWatching(false)
  }, [])

  const startWatch = useCallback(() => {
    if (!supported) return
    setError(null)
    setWatching(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const c = pos.coords
        setState({
          lat: c.latitude,
          lon: c.longitude,
          speedMs: c.speed,
          altitudeM: c.altitude,
          accuracyM: c.accuracy,
          updatedAt: pos.timestamp,
        })
        setError(null)
      },
      (err) => {
        // Freundlicher Hinweis statt rohem Fehlercode.
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Standortzugriff verweigert — in den Browser-Einstellungen erlauben.'
            : 'Noch kein GPS-Fix — das kann besonders im Flugzeug einen Moment dauern.',
        )
      },
      { enableHighAccuracy: true, timeout: 30_000, maximumAge: 5_000 },
    )
  }, [supported])

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

  // Position entlang der Linie NRN→PFO (0..1) — grob, nur für die SVG-Darstellung.
  const traveledKm = state ? haversineKm(NRN, state) : 0
  const remainingKm = state ? haversineKm(state, PFO) : TOTAL_KM
  const progress = Math.min(1, Math.max(0, traveledKm / TOTAL_KM))
  const planeX = NRN_X + (PFO_X - NRN_X) * progress
  const planeY = NRN_Y + (PFO_Y - NRN_Y) * progress

  return (
    <Card title="✈️ Wo sind wir? (Offline-Tracker)" >
      <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
        Rein offline via GPS — funktioniert im Flugmodus (Satelliten-Empfang braucht
        kein Internet). Flug {outboundFlight.origin.code} → {outboundFlight.destination.code}.
      </p>

      {/* Statische SVG-Routen-Darstellung (keine Online-Karte!). */}
      <div className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-sky-50 dark:border-slate-600 dark:bg-slate-800">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="h-auto w-full" role="img" aria-label="Flugroute mit aktueller Position">
          {/* Route NRN → PFO */}
          <line
            x1={NRN_X} y1={NRN_Y} x2={PFO_X} y2={PFO_Y}
            stroke="#0c7fa8" strokeWidth={1.2} strokeDasharray="3,2"
          />
          {/* Start NRN */}
          <circle cx={NRN_X} cy={NRN_Y} r={2.5} fill="#0c7fa8" />
          <text x={NRN_X} y={NRN_Y - 4} fontSize={6} textAnchor="middle" fill="#0c7fa8" fontWeight="bold">NRN</text>
          {/* Ziel PFO */}
          <circle cx={PFO_X} cy={PFO_Y} r={2.5} fill="#0c7fa8" />
          <text x={PFO_X} y={PFO_Y + 8} fontSize={6} textAnchor="middle" fill="#0c7fa8" fontWeight="bold">PFO</text>
          {/* Aktuelle Position */}
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
      {error && (
        <p className="text-sm text-warn dark:text-amber-300">⚠️ {error}</p>
      )}

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
            <p className="text-[11px] text-slate-500">Zurückgelegt (ab NRN)</p>
            <p className="font-semibold">{fmtKm(traveledKm)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Verbleibend (bis PFO)</p>
            <p className="font-semibold">
              {fmtKm(remainingKm)}{' '}
              <span className="text-xs text-slate-400">
                ({fmtRemainingMin(remainingKm, state.speedMs)})
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Hinweistext wie gefordert. */}
      <p className="mt-3 text-xs text-slate-400">
        🪟 Fensterplatz nötig · ⏳ erster GPS-Fix kann dauern · {' '}
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

      {/* Manuelles Start/Stop (falls Auto-Start nicht gewünscht /Akku). */}
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
