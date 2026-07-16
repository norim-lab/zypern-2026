// =============================================================================
// privateData.ts — Kapselung aller personenbezogenen Werte (DSGVO/Sicherheit).
//
// Alle sensiblen Werte (Namen, Adressen, Buchungscodes, Kennzeichen, Telefon-
// nummern, E-Mail-Adressen) liegen hier ZENTRAL und werden von tripData.ts
// importiert. So bleibt die Datenquelle an einem Ort gepflegt und lässt sich
// für Demos/Screenshots komplett maskieren (siehe usePrivateMode).
//
// ⚠️ README-Warnung bleibt bestehen: Repo PRIVATE halten.
// =============================================================================

/** Reisende Personen (Namen + Rolle). */
export const travelersPrivate = [
  { name: 'Sovandy Sim', role: 'Erwachsener' as const },
  { name: 'Miron Schmude', role: 'Erwachsener' as const },
  { name: 'Maia', role: 'Kind' as const },
  { name: 'Elly', role: 'Kleinkind' as const },
]

/** Flüge — personenbezogene Anteile (Buchungscode, Kontakt, Sitzplätze, Gepäck). */
export const flightsPrivate = {
  bookingCode: 'B3VHMK',
  contact: 'Sovandy Sim',
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
}

/** Unterkunft — personenbezogene Anteile (Name, Eigentümer, Adresse, Plus Code). */
export const accommodationPrivate = {
  name: 'Damian Home',
  owner: 'Bruder Damian (kostenlos)',
  address: '25is Martiou 4, 7104 Aradippou, Zypern',
  plusCode: 'XH2V+9C Aradippou',
  notes: ['Kostenlose Unterkunft im Haus von Bruder Damian.'],
}

/** Mietwagen — personenbezogene Anteile. */
export const rentalCarPrivate = {
  reservationNo: '1483985',
  voucherCode: 'INHNC67YDL',
  hotlinePhone: '+49 89 143 79 153',
  hotlineEmail: 'mietwagen@holidaycheck.com',
}

/** Parken — personenbezogene Anteile. */
export const parkingPrivate = {
  bookingNo: 'WEWSP754368',
  bookedBy: 'Sovandy Sim',
  licensePlate: 'BNQM842',
}

/**
 * Buchungscodes als Schnellzugriff (Dashboard). Personenbezogen → kapseln.
 * Das Label bleibt sichtbar, nur der Code-Wert wird im Privat-Modus maskiert.
 */
export const bookingCodesPrivate = [
  { label: 'Ryanair (Flüge)', code: 'B3VHMK' },
  { label: 'Mietwagen Auto Europe', code: '1483985' },
  { label: 'Gutschein', code: 'INHNC67YDL' },
  { label: 'Parken Weeze P2', code: 'WEWSP754368' },
  { label: 'Kennzeichen', code: 'BNQM842' },
]

/**
 * v0.7: Seed-Checkliste „Packliste Miron" — personenbezogen (Medikamente,
 * Reisedokumente). Liegt bewusst hier in privateData.ts, damit
 * VITE_PRIVATE_MODE greift (im Privat-Modus wird diese Liste in Lists.tsx
 * ausgeblendet). Wird beim ERSTEN Start als Seed eingespielt (siehe
 * seedChecklists.ts) und danach nie wieder angetastet — Nutzereingaben
 * überleben Updates.
 */
import type { Checklist } from './types'

export const packlisteMironSeed: Checklist = {
  id: 'pack-miron',
  title: 'Packliste Miron',
  icon: '💊',
  kind: 'pack',
  note: 'Wird laufend ergänzt — Einträge direkt hier hinzufügen.',
  order: -1, // ganz oben im Listen-Tab
  groups: [
    { id: 'g-medikamente', title: 'Medikamente' },
    { id: 'g-kinder', title: 'Kinder' },
    { id: 'g-reisedokumente', title: 'Reisedokumente' },
  ],
  items: [
    // Medikamente
    { id: 'pm-sodbrennen', label: 'Sodbrennen-Medikament', groupId: 'g-medikamente' },
    { id: 'pm-quviviq', label: 'Quviviq', groupId: 'g-medikamente' },
    { id: 'pm-xanax', label: 'Xanax', groupId: 'g-medikamente' },
    { id: 'pm-allopurinol', label: 'Allopurinol', groupId: 'g-medikamente' },
    { id: 'pm-novalgin', label: 'Novalgin Tropfen', groupId: 'g-medikamente' },
    // Kinder
    { id: 'pm-fiebersaft', label: 'Fiebersaft', groupId: 'g-kinder' },
    { id: 'pm-pflaster', label: 'Pflaster', groupId: 'g-kinder' },
    { id: 'pm-desinfektion', label: 'Desinfektionsmittel', groupId: 'g-kinder' },
    { id: 'pm-vitamin-elly', label: 'Vitamin für Elly', groupId: 'g-kinder' },
    // Reisedokumente
    { id: 'pm-paesse', label: 'Reisepässe (Elly, Maia, Sovandy, Miron)', groupId: 'g-reisedokumente' },
    { id: 'pm-krankenkarten', label: 'Krankenkassenkarten (Sovandy, Miron, Maia, Elly)', groupId: 'g-reisedokumente' },
    { id: 'pm-fuehrerschein', label: 'Führerschein (Miron, Sovandy)', groupId: 'g-reisedokumente' },
  ],
}
