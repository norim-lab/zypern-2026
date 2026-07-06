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
  Beach,
  LocalSpot,
  LocalSearchTile,
  EventSource,
  NewsSource,
  Market,
  OfferSource,
  NewsTopic,
} from './types'
// v0.3: Personenbezogene Werte sind in privateData.ts gekapselt und werden hier
// nur referenziert. So lassen sie sich zentral pflegen und für Demos maskieren
// (VITE_PRIVATE_MODE, siehe hooks/usePrivateMode).
import {
  travelersPrivate,
  flightsPrivate,
  accommodationPrivate,
  rentalCarPrivate,
  parkingPrivate,
  bookingCodesPrivate,
} from './privateData'

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
  travelers: travelersPrivate,
}

// Flüge (Ryanair) ----------------------------------------------------------
// Bordkarten NUR digital über die Ryanair-App!

/** Hinflug FR3878: Düsseldorf-Weeze → Paphos. Personenbezogene Anteile aus privateData. */
export const outboundFlight: Flight = {
  airline: 'Ryanair',
  flightNumber: 'FR3878',
  bookingCode: flightsPrivate.bookingCode,
  contact: flightsPrivate.contact,
  origin: { code: 'NRN', name: 'Düsseldorf-Weeze', city: 'Weeze' },
  destination: { code: 'PFO', name: 'Paphos', city: 'Paphos' },
  departureAt: '2026-07-17T13:35:00',
  arrivalAt: '2026-07-17T18:30:00',
  durationMin: 235, // 3 h 55 min
  seats: flightsPrivate.seats,
  luggage: flightsPrivate.luggage,
  flightradarUrl: 'https://www.flightradar24.com/data/flights/fr3878',
  notes: [
    'Bordkarten NUR digital über die Ryanair-App!',
    'Online-Check-in frühzeitig erledigen.',
    'Flugnummer FR3878 an Auto Europe melden (Mietwagen-Abholung).',
  ],
}

/** Rückflug FR3879: Paphos → Düsseldorf-Weeze. Personenbezogene Anteile aus privateData. */
export const returnFlight: Flight = {
  airline: 'Ryanair',
  flightNumber: 'FR3879',
  bookingCode: flightsPrivate.bookingCode,
  contact: flightsPrivate.contact,
  origin: { code: 'PFO', name: 'Paphos', city: 'Paphos' },
  destination: { code: 'NRN', name: 'Düsseldorf-Weeze', city: 'Weeze' },
  departureAt: '2026-08-07T18:55:00',
  arrivalAt: '2026-08-07T22:15:00',
  durationMin: 260, // 4 h 20 min
  seats: flightsPrivate.seats,
  luggage: flightsPrivate.luggage,
  flightradarUrl: 'https://www.flightradar24.com/data/flights/fr3879',
  notes: [
    'Bordkarten NUR digital über die Ryanair-App!',
    'Mietwagen-Rückgabe vor Abflug planen.',
  ],
}

// Unterkunft („Damian Home") ----------------------------------------------

export const accommodation: Accommodation = {
  name: accommodationPrivate.name,
  owner: accommodationPrivate.owner,
  address: accommodationPrivate.address,
  plusCode: accommodationPrivate.plusCode,
  lat: 34.95,
  lon: 33.59,
  navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Damian+Home+Aradippou+Cyprus',
  placeUrl: 'https://www.google.com/maps/search/?api=1&query=Damian+Home+Aradippou+Cyprus',
  features: [
    '2 Schlafzimmer mit Klimaanlage',
    'Eigener Pool',
    '🔑 Schlüssel bereits in Deutschland übergeben — einpacken!',
  ],
  notes: accommodationPrivate.notes,
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
  reservationNo: rentalCarPrivate.reservationNo,
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
  voucherCode: rentalCarPrivate.voucherCode,
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
  hotlinePhone: rentalCarPrivate.hotlinePhone,
  hotlineEmail: rentalCarPrivate.hotlineEmail,
}

// Parken Flughafen Weeze --------------------------------------------------

export const parking: Parking = {
  area: 'P2',
  bookingNo: parkingPrivate.bookingNo,
  bookedBy: parkingPrivate.bookedBy,
  priceEur: 156.8,
  entryAt: '2026-07-17T10:30:00', // ca.
  exitAt: '2026-08-08T05:00:00', // ca.
  licensePlate: parkingPrivate.licensePlate,
  notes: [
    'Automatische Kennzeichnerkennung — kein Ticket nötig.',
    'Fußweg zum Terminal: ca. 300–400 m (~5 min).',
  ],
  navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=Flughafen-Ring+1,+47652+Weeze',
}

// Ausflüge ----------------------------------------------------------------
// v0.2: mit Koordinaten für Distanz-Sortierung + Maps-Navigation je Ziel.

export const excursions: Excursion[] = [
  {
    name: 'Salzsee & Hala-Sultan-Tekke',
    lat: 34.885,
    lon: 33.609,
    travelTime: '~15 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.885,33.609',
    description: 'Salzsee mit Moschee und Flamingos (saisonal).',
    kidsToddler: 'Kinderwagen-tauglich, ebene Wege.',
    kidsSchool: 'Spannend: Flamingos & Moschee entdecken.',
    shadeNote: 'Kaum Schatten — morgens/später Nachmittag.',
  },
  {
    name: 'Lazarus-Kirche / Altstadt Larnaka',
    lat: 34.911,
    lon: 33.634,
    travelTime: '~10 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.911,33.634',
    description: 'Historische Kirche in der Altstadt mit Gassen und Tavernen.',
    kidsToddler: 'Mit Kinderwagen teilweise eng, aber kurz.',
    kidsSchool: 'Kirche & Altstadt spannend, Eis danach.',
    shadeNote: 'Altstadt-Gassen bieten Schatten.',
  },
  {
    name: 'Kamelpark Mazotos',
    lat: 34.723,
    lon: 33.487,
    travelTime: '~20 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.723,33.487',
    description: 'Kamele reiten, Streichelzoo — Ausflug mit Kindern.',
    kidsToddler: 'Sehr gut geeignet, Tiere & Spielplatz.',
    kidsSchool: 'Kamelreiten & Ponyreiten möglich.',
    shadeNote: 'Teilweise Schatten, trotzdem Mittagshitze meiden.',
  },
  {
    name: 'Stavrovouni-Kloster Aussichtspunkt',
    lat: 34.888,
    lon: 33.435,
    travelTime: '~30 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.888,33.435',
    description: 'Bergkloster mit weiter Aussicht. Männer dürfen ins Kloster.',
    kidsToddler: 'Aussichtspunkt OK, Klosterbetritt nur für Männer.',
    kidsSchool: 'Aussicht & Geschichte spannend.',
    shadeNote: 'Oben windig, wenig Schatten.',
  },
  {
    name: 'Lefkara Spitzenklöppel-Dorf',
    lat: 34.869,
    lon: 33.307,
    travelTime: '~45 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.869,33.307',
    description: 'Bergdorf mit Spitzenklöppeln & Silberschmiedekunst.',
    kidsToddler: 'Enge Gassen, kurzer Spaziergang OK.',
    kidsSchool: 'Handwerk live schauen, Souvenir.',
    shadeNote: 'Gassen spenden Schatten.',
  },
  {
    name: 'Choirokoitia UNESCO-Siedlung',
    lat: 34.797,
    lon: 33.343,
    travelTime: '~35 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.797,33.343',
    description: 'Steinzeitliche Siedlung (UNESCO-Weltkulturerbe).',
    kidsToddler: 'Treppen/Stufen — eher mit Trage.',
    kidsSchool: 'Pfahlbauten nachbauen: super spannend.',
    shadeNote: 'Wenig Schatten, Hitze meiden.',
  },
  {
    name: 'Kap Greco Meereshöhlen',
    lat: 34.962,
    lon: 34.081,
    travelTime: '~50 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.962,34.081',
    description: 'Nationalpark mit Klippen, Höhlen & Buchten.',
    kidsToddler: 'Klippen = Vorsicht! Nur sichere Wege.',
    kidsSchool: 'Höhlen-Entdecker-Tour, toll.',
    shadeNote: 'Voll sonnig — nur mit Hut & Creme.',
  },
  {
    name: 'WaterWorld Wasserpark Ayia Napa',
    lat: 34.998,
    lon: 33.989,
    travelTime: '~40 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.998,33.989',
    description: 'Großer Wasserpark mit Kinderbereichen.',
    kidsToddler: 'Extra Kleinkind-Bereiche vorhanden.',
    kidsSchool: 'Rutschen-Paradies.',
    shadeNote: 'Schirm/Liege mieten — viel Sonne.',
  },
  {
    name: 'Nikosia (Südteil Altstadt)',
    lat: 35.168,
    lon: 33.363,
    travelTime: '~40 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=35.168,33.363',
    description: 'Hauptstadt mit Altstadt, Ledra-Straße, CyMuseum.',
    kidsToddler: 'Stadtrundgang/Kinderwagen OK.',
    kidsSchool: 'Museum & Altstadt entdecken.',
    shadeNote: 'Altstadt-Gassen schattig.',
  },
  {
    name: 'Limassol Burg & Marina',
    lat: 34.672,
    lon: 33.042,
    travelTime: '~50 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.672,33.042',
    description: 'Hafenstadt mit Burg, Marina und Promenade.',
    kidsToddler: 'Promenade Kinderwagen-tauglich.',
    kidsSchool: 'Burg erkunden, Eis an der Marina.',
    shadeNote: 'Promenade teils beschattet.',
  },
  {
    name: 'Troodos-Platz',
    lat: 34.925,
    lon: 32.881,
    travelTime: '~1 h 15 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.925,32.881',
    description: 'Bergdorf, kühlere Höhenlage, Wandern & Wasserfälle.',
    kidsToddler: 'Kinderwagen auf Hauptwegen OK.',
    kidsSchool: 'Wanderung zu den Wasserfällen.',
    shadeNote: 'Kühler als Küste, Wald spendet Schatten.',
  },
  {
    name: 'Kykkos-Kloster',
    lat: 34.984,
    lon: 32.741,
    travelTime: '~1 h 30 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.984,32.741',
    description: 'Berühmtes Bergkloster mit Museen, tief im Troodos.',
    kidsToddler: 'Langer Anfahrtsweg — eher für Größere.',
    kidsSchool: 'Kloster & Ikonen-Museum beeindruckend.',
    shadeNote: 'Bergluft kühl, im Kloster schattig.',
  },
  {
    name: 'Archäologischer Park Paphos',
    lat: 34.756,
    lon: 32.406,
    travelTime: '~1 h 30 min',
    navigationUrl: 'https://www.google.com/maps/dir/?api=1&destination=34.756,32.406',
    description: 'UNESCO-Park mit Mosaiken. Ideal für den Abreisetag vor Rückflug!',
    kidsToddler: 'Weite Anlage, Wege mit Kinderwagen OK.',
    kidsSchool: 'Mosaik-Rätsel-Rallye, super spannend.',
    shadeNote: 'Kaum Schatten — Vormittag/Freitag wählen.',
    departureDayTip: true,
  },
]

// Strände (v0.2) ----------------------------------------------------------
// Seed-Daten, erweiterbar. Live-Wasserdaten via MarineProvider.

export const beaches: Beach[] = [
  { id: 'b-oroklini', name: 'Oroklini / Yanathes Beach', lat: 34.98, lon: 33.667,
    description: 'Nah, ruhig, flach abfallend — ideal mit Kleinkind.', bestTime: 'ab 16:30',
    tags: ['flach', 'ruhig', 'sandstrand'] },
  { id: 'b-pyla', name: 'CTO / Pyla Beach, Dhekelia Road', lat: 34.984, lon: 33.703,
    description: 'Flach, ruhig, Tavernen in Laufnähe.', bestTime: 'ab 16:30',
    tags: ['flach', 'ruhig', 'tavernen', 'sandstrand'] },
  { id: 'b-finikoudes', name: 'Finikoudes, Larnaka', lat: 34.911, lon: 33.636,
    description: 'Promenade, sehr flach, Rettungsschwimmer.', bestTime: 'morgens/später Nachmittag',
    tags: ['flach', 'rettungsschwimmer', 'tavernen', 'wc', 'sandstrand'] },
  { id: 'b-kastella', name: 'Kastella Beach, Larnaka', lat: 34.897, lon: 33.626,
    description: 'Ruhiger als Finikoudes, stadtnah.', bestTime: 'ab 16:00',
    tags: ['ruhig', 'sandstrand'] },
  { id: 'b-mackenzie', name: 'Mackenzie Beach', lat: 34.874, lon: 33.617,
    description: 'Flach, Tavernen, Flugzeug-Spotting im Landeanflug (Kinder-Highlight!).',
    bestTime: 'nachmittags', tags: ['flach', 'tavernen', 'flugspotting', 'sandstrand'] },
  { id: 'b-faros', name: 'Faros / Pervolia Beach', lat: 34.808, lon: 33.59,
    description: 'Leuchtturm, ruhig, wenig los.', bestTime: 'ab 16:30',
    tags: ['ruhig', 'sandstrand'] },
  { id: 'b-makronissos', name: 'Makronissos Beach, Ayia Napa', lat: 34.987, lon: 33.936,
    description: 'Flach, sehr kinderfreundlich.', bestTime: 'morgens',
    tags: ['flach', 'ruhig', 'sandstrand'] },
  { id: 'b-nissi', name: 'Nissi Beach, Ayia Napa', lat: 34.988, lon: 33.943,
    description: 'Berühmt, Sandbank, belebt.', bestTime: 'morgens (vor Trubel)',
    tags: ['sandstrand', 'tavernen'] },
  { id: 'b-landa', name: 'Landa / Golden Beach', lat: 34.989, lon: 33.949,
    description: 'Goldener Sand, zwischen Nissi & Makronissos.', bestTime: 'morgens',
    tags: ['sandstrand', 'ruhig'] },
  { id: 'b-konnos', name: 'Konnos Bay', lat: 34.977, lon: 34.077,
    description: 'Geschützte Bucht, klares Wasser.', bestTime: 'ab 16:00',
    tags: ['ruhig', 'sandstrand'] },
  { id: 'b-figtree', name: "Fig Tree Bay, Protaras", lat: 35.012, lon: 34.058,
    description: 'Top-Familienstrand, flach, kleiner Felsenweg.', bestTime: 'ab 16:00',
    tags: ['flach', 'rettungsschwimmer', 'tavernen', 'sandstrand'] },
  { id: 'b-governors', name: "Governor's Beach", lat: 34.715, lon: 33.276,
    description: 'Dunkler Sand, weiße Kreidefelsen.', bestTime: 'später Nachmittag',
    tags: ['tavernen', 'sandstrand'] },
  { id: 'b-ladysmile', name: "Lady's Mile, Limassol", lat: 34.628, lon: 33.007,
    description: 'Kilometerlang, flach, seewindig.', bestTime: 'nachmittags',
    tags: ['flach', 'sandstrand'] },
]

// Lokale (v0.2) — kuratiert, KEINE erfundenen Namen -----------------------
// Bewusst nur Orts-/Gegend-Beschreibungen; Details immer live in Maps prüfen.

export const localSpots: LocalSpot[] = [
  { id: 'l-aradippou-center', name: 'Ortskern Aradippou',
    category: 'Taverne/Meze', query: 'taverna Aradippou',
    note: 'Lokale Tavernen im Zentrum, Bewertungen live prüfen.' },
  { id: 'l-piale-fish', name: 'Fischtavernen Piale Pasha (Larnaka)',
    category: 'Fisch', query: 'fish tavern Piale Pasha Larnaca',
    note: 'Bekannte Fischtavernen an der Piale-Pasha-Promenade.' },
  { id: 'l-mackenzie-fish', name: 'Fischtavernen Mackenzie (Larnaka)',
    category: 'Fisch', query: 'fish tavern Mackenzie Beach Larnaca',
    note: 'Fisch direkt am Strand, Flugzeug-Spotting inklusive.' },
  { id: 'l-finikoudes-souvlaki', name: 'Finikoudes-Promenade',
    category: 'Souvlaki/Grill', query: 'souvlaki Finikoudes Larnaca',
    note: 'Souvlaki & Grill entlang der Promenade.' },
  { id: 'l-larnaca-cafe', name: 'Cafés Larnaka Altstadt',
    category: 'Café & Eis', query: 'cafe ice cream Larnaca old town',
    note: 'Cafés & Eisdielen in der Altstadt.' },
  { id: 'l-playground-cafe', name: 'Spielplatz-Cafés Larnaka',
    category: 'kinderfreundlich', query: 'playground cafe Larnaca',
    note: 'Cafés mit Spielplatz — entspannt mit Kindern.' },
]

/** Such-Kacheln „In der Nähe suchen" — Maps nutzt automatisch den Standort. */
export const localSearchTiles: LocalSearchTile[] = [
  { label: 'Taverne', query: 'taverna', icon: '🍽️' },
  { label: 'Meze Restaurant', query: 'meze restaurant Aradippou', icon: '🥙' },
  { label: 'Fischtaverne', query: 'fish tavern Larnaca', icon: '🐟' },
  { label: 'Spielplatz-Café', query: 'playground cafe Larnaca', icon: '🛝' },
  { label: 'Eisdiele', query: 'ice cream near me', icon: '🍦' },
  { label: 'Supermarkt', query: 'supermarket near me', icon: '🛒' },
]

// Veranstaltungen (v0.2) ---------------------------------------------------

/** Konfigurierte Event-Quellen. 'rss' = automatisch parsen, 'link' = externe Kachel. */
export const eventSources: EventSource[] = [
  { name: 'Larnaka Tourism Board Events', url: 'https://www.larnakaregion.com/events',
    type: 'link', srcKey: 'larnakaregion' },
  { name: 'In-Cyprus (Philenews) Events', url: 'https://in-cyprus.philenews.com/category/events/',
    type: 'link', srcKey: 'incyprus-events' },
  { name: 'All About Limassol', url: 'https://allaboutlimassol.com/events/',
    type: 'link', srcKey: 'allaboutlimassol' },
  { name: 'Visit Cyprus Events', url: 'https://www.visitcyprus.com/index.php/info/events',
    type: 'link', srcKey: 'visitcyprus' },
]

// Nachrichten (v0.2) -------------------------------------------------------

/** Konfigurierte News-Quellen (v0.4: + deutsche Google-News-RSS-Queries). */
export const newsSources: NewsSource[] = [
  { name: 'Cyprus Mail', url: 'https://cyprus-mail.com/feed/', type: 'rss', srcKey: 'cyprus-mail' },
  { name: 'In-Cyprus (Philenews)', url: 'https://in-cyprus.philenews.com/feed/', type: 'rss', srcKey: 'incyprus' },
  {
    name: 'Google News DE — Zypern/Larnaka/Aradippou',
    url: 'https://news.google.com/rss/search?q=Zypern+OR+Larnaka+OR+Aradippou&hl=de&gl=DE&ceid=DE:de',
    type: 'rss', srcKey: 'gnews-de-zypern',
  },
  {
    name: 'Google News DE — Zypern Tourismus/Urlaub',
    url: 'https://news.google.com/rss/search?q=Zypern+Tourismus+OR+Urlaub&hl=de&gl=DE&ceid=DE:de',
    type: 'rss', srcKey: 'gnews-de-tourismus',
  },
]

/** Link-Kacheln (kein RSS, nur externe Quellen). */
export const newsLinkTiles: { label: string; url: string; icon: string }[] = [
  { label: 'Auswärtiges Amt Zypern',
    url: 'https://www.auswaertiges-amt.de/de/laender/zypern', icon: '🇩🇪' },
  { label: 'Flughafen Weeze', url: 'https://www.airport-weeze.de/', icon: '✈️' },
  { label: 'Ryanair Status', url: 'https://www.ryanair.com/de/de/trip/flights', icon: '🎫' },
]

/** Konfigurierbare Relevanz-Schlagworte für den News-Filter. */
export const newsKeywords: string[] = [
  'Larnaca', 'Larnaka', 'Aradippou', 'heatwave', 'Hitzewelle',
  'wildfire', 'Waldbrand', 'strike', 'Streik', 'airport',
  'Paphos', 'Ryanair', 'beach warning', 'jellyfish',
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
  {
    // Wiederverwendbare Strandtasche (v0.2) — pro Ausflug zurücksetzbar.
    id: 'strandtasche',
    title: 'Strandtasche',
    icon: '🏖️',
    kind: 'pack',
    items: [
      { id: 's-water', label: 'Wasser' },
      { id: 's-lsf', label: 'Sonnencreme LSF 50+' },
      { id: 's-vest', label: 'Schwimmweste Elly' },
      { id: 's-uv', label: 'UV-Shirts' },
      { id: 's-tent', label: 'Sonnenzelt / Schirm' },
      { id: 's-diapers', label: 'Schwimmwindeln' },
      { id: 's-snacks', label: 'Snacks' },
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

/** Buchungscodes als Schnellzugriff (für Dashboard). Codes aus privateData. */
export const bookingCodes: { label: string; code: string }[] = bookingCodesPrivate

// ===========================================================================
// v0.4 — Heimatort, Märkte, Angebote, News-Themen
// ===========================================================================

/** Heimatort für das „Zuhause"-Wetter-Widget (Platzhalter Weeze).
 *  Vollständige WeatherLocation (stabile Referenz, Europe/Berlin). */
export const homeLocation: WeatherLocation = {
  name: 'Zuhause (Weeze)',
  lat: 51.6,
  lon: 6.14,
  timezone: 'Europe/Berlin',
}

/** Supermärkte/Märkte in Aradippou & Umgebung (Seed, erweiterbar). */
export const markets: Market[] = [
  { id: 'm-mas', name: 'MAS Alambritis', lat: 34.951, lon: 33.588, chain: 'MAS',
    query: 'MAS Alambritis Aradippou' },
  { id: 'm-euroasia', name: 'Euro&Asia Food MiniMarket', lat: 34.951, lon: 33.59,
    chain: 'Mini Market', query: 'Euro Asia Food MiniMarket Aradippou' },
  { id: 'm-alphamega', name: 'Alphamega Hypermarket', lat: 34.924, lon: 33.627,
    chain: 'Alphamega', query: 'Alphamega Hypermarket Larnaca' },
  { id: 'm-lidl', name: 'Lidl', lat: 34.923, lon: 33.627,
    chain: 'Lidl', query: 'Lidl Larnaca Aradippou' },
  { id: 'm-sklavenitis', name: 'Sklavenitis', lat: 34.918, lon: 33.636,
    chain: 'Sklavenitis', query: 'Sklavenitis Larnaca' },
  { id: 'm-metro', name: 'Metro', lat: 34.931, lon: 33.622,
    chain: 'Metro', query: 'Metro Cash Carry Larnaca' },
]

/** Online-Prospekt-/Angebots-Quellen. 'link' = nur Kachel (Prospekt öffnen). */
export const offerSources: OfferSource[] = [
  { name: 'Lidl Zypern Wochenangebote', url: 'https://www.lidl.com.cy/angebote',
    type: 'link', srcKey: 'lidl-cy', chain: 'Lidl' },
  { name: 'Alphamega Offers', url: 'https://www.alphamega.com.cy/offers',
    type: 'link', srcKey: 'alphamega', chain: 'Alphamega' },
  { name: 'Sklavenitis Fylladio', url: 'https://www.sklavenitis.com.cy/offers',
    type: 'link', srcKey: 'sklavenitis', chain: 'Sklavenitis' },
]

/** News-Themenfilter (kombinierbar mit Sprach-Filter). */
export const newsTopics: NewsTopic[] = [
  { id: 'cy', label: 'Zypern', keywords: ['cyprus', 'zypern', 'nicosia', 'nikosia'] },
  { id: 'larnaka', label: 'Larnaka', keywords: ['larnaca', 'larnaka', 'larnarka'] },
  { id: 'aradippou', label: 'Aradippou', keywords: ['aradippou', 'aradippos'] },
  {
    id: 'tourismus',
    label: 'Touristisch',
    keywords: ['beach', 'strand', 'hotel', 'flight', 'flug', 'attraction',
      'sehenswürdigkeit', 'price', 'preis', 'tourist', 'tourism', 'urlaub'],
  },
]
