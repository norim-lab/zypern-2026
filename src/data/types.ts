// =============================================================================
// types.ts — Zentrale Typdefinitionen für die „Zypern 2026"-App.
// Alle Reisedaten sind hier typisiert; die konkreten Werte liegen in tripData.ts.
// Diese Trennung hält das UI frei von hart verdrahteten Daten und erleichtert
// den späteren Austausch (z. B. Notion-Sync in v0.2).
// =============================================================================

/** Reise-Metadaten: Titel, Zeitraum, Reisende. */
export interface Trip {
  /** Anzeigename der Reise */
  title: string
  /** ISO-Datum (ohne Zeit) der Anreise */
  startDate: string
  /** ISO-Datum (ohne Zeit) der Abreise */
  endDate: string
  /** Kurze Reisebeschreibung */
  subtitle: string
  /** Reisende (für spätere Erweiterung, z. B. packliste pro Person) */
  travelers: Traveler[]
}

/** Eine reisende Person. */
export interface Traveler {
  name: string
  /** Rolle, z. B. „Erwachsener", „Kind", „Kleinkind" */
  role: 'Erwachsener' | 'Kind' | 'Kleinkind'
}

/** Ein Flughafen mit IATA-Code. */
export interface Airport {
  /** IATA-Code, z. B. „NRN" */
  code: string
  /** Anzeigename, z. B. „Düsseldorf-Weeze" */
  name: string
  /** Stadt/Region */
  city: string
}

/** Sitzplatz einer Person an Bord. */
export interface SeatAssignment {
  /** Name der Person */
  person: string
  /** Sitznummer, z. B. „31D" */
  seat: string
  /** Hinweis, z. B. „Kleinkind auf dem Schoß" */
  note?: string
}

/** Gepäckregel einer Person. */
export interface LuggageRule {
  /** Name der Person */
  person: string
  /** Aufgabegepäck in kg, falls vorhanden */
  holdKg?: number
  /** Hinweis zur Handgepäck-Tasche / Sonderregel */
  note: string
}

/** Ein Flug (Hin- oder Rückflug). */
export interface Flight {
  /** Fluggesellschaft, z. B. „Ryanair" */
  airline: string
  /** Flugnummer, z. B. „FR3878" */
  flightNumber: string
  /** Buchungscode (PNR) */
  bookingCode: string
  /** Buchender Kontakt */
  contact: string
  /** Startflughafen */
  origin: Airport
  /** Zielflughafen */
  destination: Airport
  /** ISO-Datum-Uhrzeit des Abflugs (lokal am Flughafen) */
  departureAt: string
  /** ISO-Datum-Uhrzeit der Ankunft (lokal am Flughafen) */
  arrivalAt: string
  /** Flugdauer in Minuten */
  durationMin: number
  /** Sitzplätze (hin & zurück getrennt) */
  seats: SeatAssignment[]
  /** Gepäckregeln */
  luggage: LuggageRule[]
  /** Link zur Flightradar24-Seite dieses Flugs */
  flightradarUrl: string
  /** Wichtige Hinweise als Bullet-Points */
  notes: string[]
}

/** Die Unterkunft vor Ort. */
export interface Accommodation {
  /** Anzeigename */
  name: string
  /** Eigentümer/Kontakt */
  owner: string
  /** Vollständige Adresse */
  address: string
  /** Plus Code (Google) */
  plusCode: string
  /** Latitude für Wetter/Maps */
  lat: number
  /** Longitude für Wetter/Maps */
  lon: number
  /** Google-Maps-Navigations-Deep-Link */
  navigationUrl: string
  /** Google-Maps-Eintrags-Deep-Link */
  placeUrl: string
  /** Ausstattungsmerkmale */
  features: string[]
  /** Wichtige Hinweise */
  notes: string[]
  /** Poolsicherheits-Regeln (für rote Warnkarte) */
  poolSafety: PoolSafety
  /** Wichtige Orte in der Umgebung (Apotheke, Supermarkt, ...) */
  nearby: NearbyPlace[]
}

/** Poolsicherheits-Regeln. */
export interface PoolSafety {
  /** Hauptwarnung (rot) */
  warning: string
  /** Konkrete Verhaltensregeln */
  rules: string[]
}

/** Ein wichtiger Ort in der Umgebung. */
export interface NearbyPlace {
  /** Name, z. B. „Melina Christou Pharmacy" */
  name: string
  /** Kategorie */
  category: 'Apotheke' | 'Supermarkt' | 'Tankstelle' | 'Sonstiges'
  /** Google-Maps-Such-Deep-Link */
  mapsUrl: string
}

/** Der Mietwagen. */
export interface RentalCar {
  /** Buchungsplattform */
  platform: string
  /** Reservierungsnummer */
  reservationNo: string
  /** Bestätigt? */
  confirmed: boolean
  /** Vermieter vor Ort */
  localVendor: string
  /** Schalter-Info am Flughafen */
  counter: string
  /** Fahrzeugklasse */
  carClass: string
  /** Beispielmodell */
  exampleModel: string
  /** Getriebe */
  transmission: string
  /** Abholung (ISO-Datum-Uhrzeit) */
  pickupAt: string
  /** Abholort */
  pickupLocation: string
  /** Rückgabe (ISO-Datum-Uhrzeit) */
  returnAt: string
  /** Rückgabeort */
  returnLocation: string
  /** Offene Änderung an der Rückgabezeit */
  returnTimeChangeNeeded?: string
  /** Preis in Euro */
  priceEur: number
  /** Gutschein-Code */
  voucherCode?: string
  /** Gutschein-Erstattung in Euro */
  voucherRefundEur?: number
  /** Wichtige Bedingungen/Kaution (Bullet-Points) */
  conditions: string[]
  /** Hotline (für tel:-Link) */
  hotlinePhone: string
  /** E-Mail (für mailto:-Link) */
  hotlineEmail: string
}

/** Parkplatz am Abreise-Flughafen. */
export interface Parking {
  /** Parkplatzkennung, z. B. „P2" */
  area: string
  /** Buchungsnummer */
  bookingNo: string
  /** Buchender */
  bookedBy: string
  /** Preis in Euro */
  priceEur: number
  /** Einfahrt (ISO-Datum-Uhrzeit, ggf. ca.) */
  entryAt: string
  /** Ausfahrt (ISO-Datum-Uhrzeit, ggf. ca.) */
  exitAt: string
  /** Kennzeichen */
  licensePlate: string
  /** Hinweise zum Vorgang */
  notes: string[]
  /** Navigation-Deep-Link */
  navigationUrl: string
}

/** Ein Ausflugsziel. */
export interface Excursion {
  /** Name des Ziels */
  name: string
  /** Latitude für Distanzberechnung + Maps-Navigation */
  lat: number
  /** Longitude für Distanzberechnung + Maps-Navigation */
  lon: number
  /** Fahrzeit ab Aradippou als Text (Fallback/Hinweis) */
  travelTime: string
  /** Google-Maps-Navigations-Deep-Link */
  navigationUrl: string
  /** Optionale Kurzbeschreibung */
  description?: string
  /** Kinder-Tauglichkeit Kleinkind (~2 J.) */
  kidsToddler?: string
  /** Kinder-Tauglichkeit Schulkind (~6–10 J.) */
  kidsSchool?: string
  /** Schatten-/Hitze-Hinweis */
  shadeNote?: string
  /** Markierung als Abreisetag-Tipp */
  departureDayTip?: boolean
}

/** Ein Prüfpunkt in einer Checkliste (To-do/Packliste). */
export interface ChecklistItem {
  /** Eindeutige ID innerhalb der Liste */
  id: string
  /** Anzeigetext */
  label: string
  /** Optionaler Hinweis */
  hint?: string
  /** v0.7: optionale Gruppen-ID (zugehörige ChecklistGroup.id). */
  groupId?: string
}

/** v0.7: Unterkategorie/Gruppe innerhalb einer Checkliste (z. B. „Medikamente"). */
export interface ChecklistGroup {
  /** Eindeutige ID innerhalb der Liste */
  id: string
  /** Anzeigetitel der Gruppe */
  title: string
}

/** Eine ganze Checkliste (To-dos oder Packliste). */
export interface Checklist {
  /** Eindeutige ID (auch localStorage-Key-Bestandteil) */
  id: string
  /** Anzeigetitel */
  title: string
  /** Emoji-Icon */
  icon: string
  /** Art der Liste */
  kind: 'todo' | 'pack'
  /** Prüfpunkte */
  items: ChecklistItem[]
  /** v0.7: optionale Unterkategorien/Gruppen. */
  groups?: ChecklistGroup[]
  /** v0.7: optionaler Hinweistext unter dem Titel. */
  note?: string
  /** v0.7: Sortierreihenfolge (kleiner = weiter oben). */
  order: number
}

/** Notfall- & Gesundheitsinfo. */
export interface EmergencyInfo {
  /** Europäische Notrufnummer */
  emergencyNumber: string
  /** Apotheke beim Haus */
  pharmacy: NearbyPlace
  /** EHIC-Hinweis */
  ehicNote: string
  /** Hinweis zum Leitungswasser */
  waterNote: string
}

/** Wetter-Location (umschaltbar Aradippou/Weeze). */
export interface WeatherLocation {
  /** Anzeigename */
  name: string
  lat: number
  lon: number
  /** IANA-Zeitzone, z. B. „Asia/Nicosia" */
  timezone: string
}

// ===========================================================================
// v0.2 — Bereich „Entdecken" (Strände · Ausflüge · Lokale · Events · News)
// ===========================================================================

/** Ein Strand mit Seed-Daten. Live-Werte (Wasser, Wellen) kommen via MarineProvider. */
export interface Beach {
  /** Eindeutige ID */
  id: string
  /** Name des Strands */
  name: string
  lat: number
  lon: number
  /** Beschreibung */
  description: string
  /** Beste Tageszeit (z. B. „ab 16:30") */
  bestTime?: string
  /** Ausstattungs-/Eigenschafts-Tags (flach, ruhig, Rettungsschwimmer, Tavernen, WC, Sandstrand) */
  tags: BeachTag[]
}

/** Ausstattungs-Tags eines Strands (für die Filter-Logik). */
export type BeachTag =
  | 'flach'
  | 'ruhig'
  | 'rettungsschwimmer'
  | 'tavernen'
  | 'wc'
  | 'sandstrand'
  | 'flugspotting'

/** Ein kuratierter Lokal-Spot (KEINE erfundenen Namen — nur Orts-/Gegend-Beschreibungen). */
export interface LocalSpot {
  /** Eindeutige ID */
  id: string
  /** Beschreibender Name (z. B. „Fischtavernen an Piale Pasha") */
  name: string
  /** Kategorie */
  category: LocalCategory
  /** Maps-Such-Query für „Details in Maps prüfen" */
  query: string
  /** Kurzer Hinweis */
  note?: string
}

export type LocalCategory = 'Taverne/Meze' | 'Fisch' | 'Souvlaki/Grill' | 'Café & Eis' | 'kinderfreundlich'

/** Eine Such-Kachel („In der Nähe suchen") — ohne Standort, Maps nutzt GPS. */
export interface LocalSearchTile {
  /** Anzeigelabel */
  label: string
  /** Maps-Such-Query */
  query: string
  /** Emoji-Icon */
  icon: string
}

/** Ein manuell erfasstes Event (für Panigiria/Dorffeste, die man vor Ort erfährt). */
export interface ManualEvent {
  /** Eindeutige ID */
  id: string
  title: string
  /** ISO-Datum (YYYY-MM-DD) */
  date: string
  /** Ortsname */
  locationName?: string
  lat?: number
  lon?: number
  /** Notiz */
  note?: string
  /** Maps-/Quell-Link */
  url?: string
  /** v0.5.1: wiederkehrendes Event (z. B. Wochenmarkt jeden Samstag). */
  recurring?: 'weekly'
  /** Bei recurring='weekly': Wochentag 0=So … 6=Sa. */
  recurringDay?: number
}

/** Eine Event-Quelle (RSS = maschinenlesbar, link = externe Kachel). */
export interface EventSource {
  /** Anzeigename */
  name: string
  /** Quell-URL */
  url: string
  /** 'rss' = automatisch parsen, 'link' = nur als externe Kachel zeigen */
  type: 'rss' | 'link'
  /** v0.3: Schlüssel in der Whitelist der eigenen /api/fetch-Function (optional). */
  srcKey?: string
}

/** Eine News-Quelle (RSS = maschinenlesbar, link = externe Kachel). */
export interface NewsSource {
  name: string
  url: string
  type: 'rss' | 'link'
  /** v0.3: Schlüssel in der Whitelist der eigenen /api/fetch-Function (optional). */
  srcKey?: string
}

/** Ein archiviertes Element (Events/News/Todos) für den Archiv-Bereich. */
export interface ArchivedItem {
  /** Eindeutige ID */
  id: string
  /** Art des Elements */
  kind: 'event' | 'news' | 'todo'
  /** Titel */
  title: string
  /** Quelle/Link */
  sourceUrl?: string
  /** Archivierungszeit (ms) */
  archivedAt: number
  /** Ursprüngliches Datum/Zeit (ms) falls vorhanden */
  originalDate?: number
  /** Freies Payload für Details (z. B. Notiz, Ort) */
  payload?: string
}

/** Standort-Quellen-Info für den Standort-Chip. */
export type LocationSource = 'live' | 'cached' | 'fallback'

// ===========================================================================
// v0.4 — Einkaufen, Restaurants, Wetter-Tagesverlauf, Zuhause-Wetter, Events+
// ===========================================================================

/** Ein Supermarkt/Märktte mit Koordinaten. */
export interface Market {
  id: string
  name: string
  lat: number
  lon: number
  /** Kette/Kategorie */
  chain?: string
  /** Maps-Such-Query für Bewertungen/Prospekt */
  query: string
}

/** Eine Angebots-/Prospekt-Quelle (rss/link wie News/Events). */
export interface OfferSource {
  name: string
  url: string
  type: 'rss' | 'link'
  srcKey?: string
  /** Marktkette, zu der die Quelle gehört */
  chain?: string
}

/** Ein geparstes Angebot (Titel, Preis, Gültigkeit, Markt). */
export interface OfferItem {
  title: string
  price?: string
  /** Gültig-bis ISO-Datum */
  validUntil?: string
  market: string
  source: string
}

/** Familien-Bewertung (eigene Sterne + Notiz) — persistent via localStorage. */
export interface FamilyRating {
  /** 1–5 Sterne (0 = keine Bewertung) */
  stars: number
  /** Eigene Notiz */
  note?: string
}

/** Ein News-Themenfilter (z. B. „Larnaka", „Touristisch"). */
export interface NewsTopic {
  id: string
  label: string
  /** Schlagwortliste, die das Thema matcht */
  keywords: string[]
}

/** Stunden-Wetter für den Tagesverlauf. */
export interface HourlyForecast {
  /** ISO-Zeitpunkt der Stunde */
  time: string
  /** Temperatur in °C */
  temperature: number
  /** Gefühlte Temperatur in °C */
  apparentTemp: number
  /** Niederschlagswahrscheinlichkeit in % */
  precipProb: number
  /** UV-Index */
  uvIndex: number
  /** Windgeschwindigkeit in km/h */
  windSpeed: number
}

/** Sonnenzeiten eines Tages. */
export interface SunTimes {
  /** Sonnenaufgang (ms) */
  sunriseMs: number
  /** Sonnenuntergang (ms) */
  sunsetMs: number
}
