// =============================================================================
// tripData.ts — SINGLE SOURCE OF TRUTH für alle Reisedaten.
// Diese Datei ist bewusst vom UI getrennt, damit v0.2+ (Notion-Sync, geteilte
// Checklisten) die Datenquelle austauschen kann, ohne Komponenten anzufassen.
// =============================================================================
import type {
  Trip,
  Flight,
  Accommodation,
  RentalCar,
  Parking,
  Excursion,
  Checklist,
  EmergencyInfo,
  WeatherLocation,
} from './types'

/** Orte für das Wetter-Modul (Aradippou default, Weeze für Abreisetag). */
export const weatherLocations: WeatherLocation[] = [
  { name: 'Aradippou (Zypern)', lat: 34.95, lon: 33.59, timezone: 'Asia/Nicosia' },
  { name: 'Weeze (Abreise)', lat: 51.6, lon: 6.14, timezone: 'Europe/Berlin' },
]

/** Reise-Metadaten. */
export const trip: Trip = {
  title: 'Zypern 2026',
  startDate: '2026-07-17',
  endDate: '2026-08-07',
  subtitle: 'Familienurlaub in Aradippou · 17.07.–07.08.2026',
  travelers: [
    { name: 'Sovandy Sim', role: 'Erwachsener' },
    { name: 'Miron Schmude', role: 'Erwachsener' },
    { name: 'Maia', role: 'Kind' },
    { name: 'Elly', role: 'Kleinkind' },
  ],
}

// Flüge (Ryanair) ----------------------------------------------------------
// Bordkarten NUR digital über die Ryanair-App!

/** Hinflug FR3878: Düsseldorf-Weeze → Paphos. */
export const outboundFlight: Flight = {
  airline: 'Ryanair',
  flightNumber: 'FR3878',
  bookingCode: 'B3VHMK',
  contact: 'Sovandy Sim',
  origin: { code: 'NRN', name: 'Düsseldorf-Weeze', city: 'Weeze' },
  destination: { code: 'PFO', name: 'Paphos', city: 'Paphos' },
  departureAt: '2026-07-17T13:35:00',
  arrivalAt: '2026-07-17T18:30:00',
  durationMin: 235, // 3 h 55 min
  seats: [
    { person: 'Sovandy Sim + Elly', seat: '31F', note: 'Kleinkind auf dem Schoß' },
    { person: 'Miron Schmude', seat: '31D' },
    { person: 'Maia (Kind)', seat: '31E' },
  ],
  luggage: [
    { person: 'Sovandy Sim', holdKg: 20, note: 'Kleine Tasche 40×20×25 cm, kein Priority' },
    { person: 'Miron Schmude', holdKg: 20, note: 'Kleine Tasche 40×20×25 cm, kein Priority' },
    { person: 'Maia', note: 'Kinderausstattung kostenlos: Sitzerhöhung' },
    { person: 'Elly', note: 'Kinderausstattung kostenlos: Kinderwagen + Babyschale' },
  ],
  flightradarUrl: 'https://www.flightradar24.com/data/flights/fr3878',
  notes: [
    'Bordkarten NUR digital über die Ryanair-App!',
    'Online-Check-in frühzeitig erledigen.',
    'Flugnummer FR3878 an Auto Europe melden (Mietwagen-Abholung).',
  ],
}

/** Rückflug FR3879: Paphos → Düsseldorf-Weeze. */
export const returnFlight: Flight = {
  airline: 'Ryanair',
  flightNumber: 'FR3879',
  bookingCode: 'B3VHMK',
  contact: 'Sovandy Sim',
  origin: { code: 'PFO', name: 'Paphos', city: 'Paphos' },
  destination: { code: 'NRN', name: 'Düsseldorf-Weeze', city: 'Weeze' },
  departureAt: '2026-08-07T18:55:00',
  arrivalAt: '2026-08-07T22:15:00',
  durationMin: 260, // 4 h 20 min
  seats: [
    { person: 'Sovandy Sim + Elly', seat: '31F', note: 'Kleinkind auf dem Schoß' },
    { person: 'Miron Schmude', seat: '31D' },
    { person: 'Maia (Kind)', seat: '31E' },
  ],
  luggage: [
    { person: 'Sovandy Sim', holdKg: 20, note: 'Kleine Tasche 40×20×25 cm, kein Priority' },
    { person: 'Miron Schmude', holdKg: 20, note: 'Kleine Tasche 40×20×25 cm, kein Priority' },
    { person: 'Maia', note: 'Kinderausstattung kostenlos: Sitzerhöhung' },
    { person: 'Elly', note: 'Kinderausstattung kostenlos: Kinderwagen + Babyschale' },
  ],
  flightradarUrl: 'https://www.flightradar24.com/data/flights/fr3879',
  notes: [
    'Bordkarten NUR digital über die Ryanair-App!',
    'Mietwagen-Rückgabe vor Abflug planen.',
  ],
}

// Unterkunft („Damian Home") ----------------------------------------------

export const accommodation: Accommodation = {
  name: 'Damian Home',
  owner: 'Bruder Damian (kostenlos)',
  address: '25is Martiou 4, 7104 Aradippou, Zypern',
  plusCode: 'XH2V+9C Aradippou',
  lat: 34.95,
  lon: 33.59,
  navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Damian+Home+Aradippou+Cyprus',
  placeUrl: 'https://www.google.com/maps/search/?api=1&query=Damian+Home+Aradippou+Cyprus',
  features: [
    '2 Schlafzimmer mit Klimaanlage',
    'Eigener Pool',
    '🔑 Schlüssel bereits in Deutschland übergeben — einpacken!',
  ],
  notes: ['Kostenlose Unterkunft im Haus von Bruder Damian.'],
  poolSafety: {
    warning:
      'Pool ist NICHT gesichert (kein Zaun, keine Abdeckung). Besondere Vorsicht mit Kindern!',
    rules: [
      'Immer eine erwachsene Person hat aktiv Pool-Aufsicht.',
      'Türen zum Garten geschlossen halten.',
      'Kleinkind nur mit Schwimmweste in den Garten.',
    ],
  },
  nearby: [
    {
      name: 'Melina Christou Pharmacy (Apotheke)',
      category: 'Apotheke',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Melina+Christou+Pharmacy+Aradippou',
    },
    {
      name: 'MAS Alambritis (Supermarkt)',
      category: 'Supermarkt',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MAS+Alambritis+Aradippou',
    },
    {
      name: 'Euro&Asia Food MiniMarket',
      category: 'Supermarkt',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Euro+Asia+Food+MiniMarket+Aradippou',
    },
    {
      name: 'Manuel Fuel and Car Wash (Tankstelle)',
      category: 'Tankstelle',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Manuel+Fuel+and+Car+Wash+Aradippou',
    },
  ],
}

// Mietwagen ---------------------------------------------------------------

export const rentalCar: RentalCar = {
  platform: 'HolidayCheck / Auto Europe',
  reservationNo: '1483985',
  confirmed: true,
  localVendor: 'Get Your Car',
  counter: 'Schalter im Terminal Paphos (PFO)',
  carClass: 'CGAR – Kompakt-SUV',
  exampleModel: 'z. B. Kia Stonic',
  transmission: 'Automatik',
  pickupAt: '2026-07-17T18:30:00',
  pickupLocation: 'Flughafen Paphos (PFO)',
  returnAt: '2026-08-07T18:00:00',
  returnLocation: 'Flughafen Paphos (PFO)',
  returnTimeChangeNeeded: '⚠️ Soll auf ca. 15:30 geändert werden — Abflug ist 18:55!',
  priceEur: 476.47,
  voucherCode: 'INHNC67YDL',
  voucherRefundEur: 119.12,
  conditions: [
    'Kaution 1.000 € auf echter Kreditkarte (Chip+PIN, auf Miron Schmude; kein Amex/Debit).',
    'Führerschein mind. 3 Jahre + Ausweis + Voucher mitbringen.',
    'Tankregel: voll/voll.',
    'Nordzypern ist verboten!',
    'Linksverkehr! Vorsicht beim Fahren.',
    'Vollkasko ohne SB (durch Erstattung) — bei Schaden IMMER Polizeiprotokoll.',
    'Gutschein-Erstattung: Bankverbindung eintragen, Frist 30 Tage nach Rückkehr.',
  ],
  hotlinePhone: '+49 89 143 79 153',
  hotlineEmail: 'mietwagen@holidaycheck.com',
}

// Parken Flughafen Weeze --------------------------------------------------

export const parking: Parking = {
  area: 'P2',
  bookingNo: 'WEWSP754368',
  bookedBy: 'Sovandy Sim',
  priceEur: 156.8,
  entryAt: '2026-07-17T10:30:00', // ca.
  exitAt: '2026-08-08T05:00:00', // ca.
  licensePlate: 'BNQM842',
  notes: [
    'Automatische Kennzeichnerkennung — kein Ticket nötig.',
    'Fußweg zum Terminal: ca. 300–400 m (~5 min).',
  ],
  navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Flughafen-Ring+1,+47652+Weeze',
}

// Ausflüge ----------------------------------------------------------------

export const excursions: Excursion[] = [
  {
    name: 'Finikoudes-Strand & Promenade Larnaka',
    travelTime: '~15 min',
    navigationUrl:
      'https://www.google.com/maps/dir/?api=1&destination=Finikoudes+Promenade+Larnaca',
    description: 'Strandpromenade mit Cafés und Restaurants.',
  },
  {
    name: 'Salzsee & Hala-Sultan-Tekke',
    travelTime: '~15 min',
    navigationUrl:
      'https://www.google.com/maps/dir/?api=1&destination=Hala+Sultan+Tekke+Larnaca',
    description: 'Salzsee mit Moschee und Flamingos (saisonal).',
  },
  {
    name: 'Lazarus-Kirche Altstadt (Larnaka)',
    travelTime: '~10 min',
    navigationUrl:
      'https://www.google.com/maps/dir/?api=1&destination=Church+of+Saint+Lazarus+Larnaca',
    description: 'Historische Kirche in der Altstadt.',
  },
  {
    name: 'Mackenzie Beach',
    travelTime: '~15 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Mackenzie+Beach+Larnaca',
    description: 'Stadtnaher Sandstrand.',
  },
  {
    name: 'Nissi Beach (Ayia Napa)',
    travelTime: '~35 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Nissi+Beach+Ayia+Napa',
    description: 'Bekannter Traumstrand.',
  },
  {
    name: 'Kap Greco',
    travelTime: '~45 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Cape+Greco+Cyprus',
    description: 'Nationalpark mit Klippen und Buchten.',
  },
  {
    name: 'Nikosia',
    travelTime: '~40 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Nicosia+Cyprus',
    description: 'Geteilte Hauptstadt mit Altstadt.',
  },
  {
    name: 'Limassol',
    travelTime: '~50 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Limassol+Cyprus',
    description: 'Hafenstadt mit Promenade und Burg.',
  },
  {
    name: 'Troodos-Gebirge',
    travelTime: '~1 h 15 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Troodos+Mountains+Cyprus',
    description: 'Kühlere Höhenlage, Wandern & Klöster.',
  },
  {
    name: 'Kamelpark Mazotos',
    travelTime: '~20 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Camel+Park+Mazotos',
    description: 'Ausflug mit Kindern.',
  },
]

// Checklisten (Startdaten) ------------------------------------------------
// Zustand wird zur Laufzeit in localStorage gehalten (v0.1 lokal pro Gerät).

export const checklists: Checklist[] = [
  {
    id: 'todos-open',
    title: 'Offene To-dos',
    icon: '📋',
    kind: 'todo',
    items: [
      { id: 't-voucher', label: 'Voucher Auto Europe prüfen (kommt binnen 72 h)' },
      { id: 't-bank', label: 'Bankverbindung für Gutschein-Erstattung eintragen' },
      { id: 't-check24', label: 'CHECK24-Erstattung 535,10 € kontrollieren' },
      { id: 't-creditcard', label: 'Kreditkarte Kaution prüfen' },
      { id: 't-license', label: 'Führerschein prüfen' },
      { id: 't-flightno', label: 'Flugnummer FR3878 an Auto Europe melden' },
      { id: 't-returntime', label: 'Mietwagen-Rückgabezeit auf ~15:30 ändern' },
      { id: 't-insurance', label: 'Auslandskrankenversicherung' },
      {
        id: 't-damian',
        label: 'Damian fragen: Kinderbett/Hochstuhl/WLAN/Waschmaschine',
      },
      { id: 't-poolalarm', label: 'Poolzaun/Türalarm besorgen' },
      { id: 't-docs', label: 'Ausweise + EHIC + Impfpässe prüfen' },
      { id: 't-ryanair', label: 'Ryanair-App installieren + Online-Check-in' },
      { id: 't-post', label: 'Post/Pflanzen/Nachbarn organisieren' },
      { id: 't-roaming', label: 'EU-Roaming prüfen (Nordzypern-Roamingfalle!)' },
    ],
  },
  {
    id: 'pack-adults',
    title: 'Packliste Erwachsene',
    icon: '🧳',
    kind: 'pack',
    items: [
      { id: 'a-key', label: 'Hausschlüssel Damian Home (!)' },
      { id: 'a-docs', label: 'Dokumente (Ausweise, EHIC, Buchungen, Führerschein)' },
      { id: 'a-money', label: 'Kreditkarte + Bargeld' },
      { id: 'a-adapter', label: 'UK-Steckdosen-Adapter Typ G' },
      { id: 'a-pharmacy', label: 'Reiseapotheke' },
    ],
  },
  {
    id: 'pack-kids',
    title: 'Packliste Kinder',
    icon: '👶',
    kind: 'pack',
    items: [
      { id: 'k-vest', label: 'Schwimmweste Elly', hint: 'vorhanden ✓' },
      { id: 'k-uv', label: 'Schwimmhilfen/UV-Shirts' },
      { id: 'k-diapers', label: 'Schwimmwindeln' },
      { id: 'k-booster', label: 'Sitzerhöhung Maia' },
      { id: 'k-babyschale', label: 'Babyschale Elly' },
      { id: 'k-buggy', label: 'Kinderwagen + Anschnallgurt' },
      { id: 'k-alarm', label: 'Pool-/Türalarm' },
      { id: 'k-fun', label: 'Flugbeschäftigung' },
      { id: 'k-sleep', label: 'Einschlafsachen' },
    ],
  },
]

// Notfall & Gesundheit ----------------------------------------------------

export const emergency: EmergencyInfo = {
  emergencyNumber: '112',
  pharmacy: accommodation.nearby[0], // Melina Christou Pharmacy
  ehicNote: 'EHIC gilt in der Republik Zypern, NICHT in Nordzypern.',
  waterNote: 'Leitungswasser ist trinkbar.',
}

/** Buchungscodes als Schnellzugriff (für Dashboard). */
export const bookingCodes: { label: string; code: string }[] = [
  { label: 'Ryanair (Flüge)', code: 'B3VHMK' },
  { label: 'Mietwagen Auto Europe', code: '1483985' },
  { label: 'Gutschein', code: 'INHNC67YDL' },
  { label: 'Parken Weeze P2', code: 'WEWSP754368' },
  { label: 'Kennzeichen', code: 'BNQM842' },
]
