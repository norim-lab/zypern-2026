// =============================================================================
// TranslationProvider.ts — Einheitliches Interface für Textübersetzung.
//
// v0.4-Default (NoopTranslationProvider): liefert den Originaltext zurück +
// generiert Translate-Links (Google-Translate-Wrapper) für externe Quellen.
// App-intern geparste Texte laufen also nicht automatisch durch eine API —
// das verhindert unnötige Key-Abhängigkeit.
//
// Optional (später/einsteckbar): LibreTranslate- oder DeepL-Instanz via Key
// (VITE_TRANSLATE_API_KEY + VITE_TRANSLATE_API_URL). Der Provider ist in
// providers/index.ts austauschbar.
// =============================================================================
export interface TranslateLinks {
  /** Google-Translate-Wrapper für Deutsch. */
  de: string
  /** Google-Translate-Wrapper für Englisch. */
  en: string
}

export interface TranslationProvider {
  readonly name: string
  /** Übersetzt einen Text (oder liefert im Default den Originaltext zurück). */
  translate(text: string, target: 'de' | 'en'): Promise<string>
  /** Baut Google-Translate-Wrapper-Links für eine externe URL auf. */
  linksForUrl(url: string, sourceLang?: string): TranslateLinks
}

const TRANSLATE_BASE = 'https://translate.google.com/translate'

export class NoopTranslationProvider implements TranslationProvider {
  readonly name = 'Originaltext + Translate-Link'

  async translate(text: string): Promise<string> {
    // Default: Originaltext unverändert (keine API-Abhängigkeit).
    return text
  }

  linksForUrl(url: string, sourceLang = 'el'): TranslateLinks {
    // sl=Quellsprache (Griechisch default für zyprische Quellen).
    return {
      de: `${TRANSLATE_BASE}?sl=${sourceLang}&tl=de&u=${encodeURIComponent(url)}`,
      en: `${TRANSLATE_BASE}?sl=${sourceLang}&tl=en&u=${encodeURIComponent(url)}`,
    }
  }
}

/**
 * Optionaler LibreTranslate-/kompatibler Provider (selbstgehostet oder Key).
 * Aktivierung später via .env-Variablen (VITE_TRANSLATE_API_KEY/URL).
 */
export class ApiTranslationProvider implements TranslationProvider {
  readonly name = 'LibreTranslate (API)'
  private apiKey?: string

  constructor(apiUrl: string, apiKey?: string) {
    this.apiUrl = apiUrl
    this.apiKey = apiKey
  }
  private apiUrl: string

  async translate(text: string, target: 'de' | 'en'): Promise<string> {
    const body: Record<string, unknown> = { q: text, source: 'auto', target, format: 'text' }
    if (this.apiKey) body.api_key = this.apiKey
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Translate-HTTP ${res.status}`)
    const data = (await res.json()) as { translatedText?: string }
    return data.translatedText ?? text
  }

  linksForUrl(url: string, sourceLang = 'el'): TranslateLinks {
    return new NoopTranslationProvider().linksForUrl(url, sourceLang)
  }
}
