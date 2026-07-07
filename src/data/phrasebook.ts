// =============================================================================
// phrasebook.ts — Griechisch-Spickzettel (v0.5 §12), statisch, offline.
// ~30 Alltags-Phrasen mit deutscher Lautschrift + Trinkgeld-Knigge.
// =============================================================================

export interface Phrase {
  de: string
  el: string
  /** Deutsche Lautschrift (vereinfacht). */
  pron: string
}

export interface PhraseGroup {
  title: string
  icon: string
  phrases: Phrase[]
}

export const phrasebook: PhraseGroup[] = [
  {
    title: 'Begrüßung & Höflichkeit',
    icon: '👋',
    phrases: [
      { de: 'Hallo / Guten Tag', el: 'Γεια σας', pron: 'Ja sas' },
      { de: 'Guten Morgen', el: 'Καλημέρα', pron: 'Kali-mera' },
      { de: 'Guten Abend', el: 'Καλησπέρα', pron: 'Kali-spera' },
      { de: 'Tschüss / Auf Wiedersehen', el: 'Γεια σας', pron: 'Ja sas' },
      { de: 'Danke', el: 'Ευχαριστώ', pron: 'Efchari-sto' },
      { de: 'Bitte / Gern geschehen', el: 'Παρακαλώ', pron: 'Para-ka-LO' },
      { de: 'Ja / Nein', el: 'Ναι / Όχι', pron: 'Ne / O-chi' },
      { de: 'Entschuldigung', el: 'Συγγνώμη', pron: 'Sig-NO-mi' },
    ],
  },
  {
    title: 'Bestellen & Bezahlen',
    icon: '🍽️',
    phrases: [
      { de: 'Die Speisekarte, bitte', el: 'Το μενού, παρακαλώ', pron: 'To me-NU, para-ka-LO' },
      { de: 'Die Rechnung, bitte', el: 'Τον λογαριασμό, παρακαλώ', pron: 'Ton lo-ga-rias-MO, para-ka-LO' },
      { de: 'Lecker!', el: 'Νόστιμο!', pron: 'NO-sti-mo' },
      { de: 'Wie viel kostet das?', el: 'Πόσο κάνει;', pron: 'PO-so KA-ni' },
      { de: 'Mit Karte, bitte', el: 'Με κάρτα, παρακαλώ', pron: 'Me KAR-ta, para-ka-LO' },
    ],
  },
  {
    title: 'Zahlen 1–10',
    icon: '🔢',
    phrases: [
      { de: '1 / 2 / 3', el: 'ένα / δύο / τρία', pron: 'E-na / DI-o / TRI-a' },
      { de: '4 / 5 / 6', el: 'τέσσερα / πέντε / έξι', pron: 'TE-se-ra / PEN-de / E-xi' },
      { de: '7 / 8 / 9', el: 'επτά / οκτώ / εννέα', pron: 'ep-TA / ok-TO' },
      { de: '10', el: 'δέκα', pron: 'DE-ka' },
    ],
  },
  {
    title: 'Notfall',
    icon: '🚑',
    phrases: [
      { de: 'Hilfe!', el: 'Βοήθεια!', pron: 'Vo-I-thia' },
      { de: 'Ich brauche einen Arzt', el: 'Χρειάζομαι γιατρό', pron: 'Chri-A-zo-me ja-TRO' },
      { de: 'Rufen Sie die Polizei', el: 'Καλέστε την αστυνομία', pron: 'Ka-LE-ste tin asti-no-MI-a' },
      { de: 'Wo ist das Krankenhaus?', el: 'Πού είναι το νοσοκομείο;', pron: 'Pu I-ne to noso-ko-MEO' },
    ],
  },
  {
    title: 'Mit Kindern',
    icon: '🧒',
    phrases: [
      { de: 'Wo ist ein Spielplatz?', el: 'Πού είναι μια παιδική χαρά;', pron: 'Pu I-ne mi-a pedi-KI cha-RA' },
      { de: 'Habt du einen Kinderwagen?', el: 'Έχετε καρότσι;', pron: 'E-CHETE ka-RO-tsi' },
      { de: 'Ist das kindergerecht?', el: 'Είναι κατάλληλο για παιδιά;', pron: 'I-ne ka-TIL-lo ja pe-DIA' },
    ],
  },
]

/** Trinkgeld-Knigge + Mini-Hinweise für den Urlaub. */
export const travelTips: { title: string; text: string; icon: string }[] = [
  { icon: '💰', title: 'Trinkgeld im Restaurant', text: 'ca. 5–10 %, oft bereits als Service auf der Rechnung.' },
  { icon: '🚕', title: 'Trinkgeld im Taxi', text: 'Betrag aufrunden, bei kurzen Fahrten ca. 1–2 € extra.' },
  { icon: '🚰', title: 'Leitungswasser', text: 'In der Republik Zypern trinkbar — in Nordzypern meiden.' },
  { icon: '🔌', title: 'Steckdosen', text: 'Typ G (britisch) — UK-Adapter mitbringen!' },
  { icon: '🚗', title: 'Linksverkehr', text: 'Auf Zypern wird LINKS gefahren — beim Überqueren der Straße aufpassen!' },
]
