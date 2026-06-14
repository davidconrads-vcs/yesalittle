// ── Language pair ─────────────────────────────────────────────────────────────

export interface LanguagePair {
  native: string  // BCP 47 locale, e.g. 'en-US' — the learner's language (selectable)
  target: string  // BCP 47 locale, e.g. 'es-ES' | 'pt-PT'
}

export const DEFAULT_NATIVE = 'en-US'

// Single source of truth for selectable native languages. Adding a second entry
// (e.g. 'es-ES') here — plus its NATIVE_META row — is all that's needed for the
// native picker to offer it; no other wiring required.
export const SUPPORTED_NATIVES = ['en-US', 'es-ES'] as const

// Native-picker names are AUTONYMS: each language in its own name/script, fixed
// (not translated per UI language). Shown on the "I speak" buttons.
export const NATIVE_META: Record<string, { autonym: string; flag: string }> = {
  'en-US': { autonym: 'English', flag: '🇺🇸' },
  'es-ES': { autonym: 'Español', flag: '🇪🇸' },
}

// Registry of every target locale the app knows (meta + validation).
export const SUPPORTED_TARGETS = ['es-ES', 'pt-PT', 'en-US'] as const

// Target display names are LOCALIZED per UI language — they live in the i18n string
// table under `lang.<locale>`, not here. TARGET_META holds only language-neutral metadata.
export const TARGET_META: Record<string, { flag: string; ttsLang: string }> = {
  'es-ES': { flag: '🇪🇸', ttsLang: 'es-ES' },
  'pt-PT': { flag: '🇵🇹', ttsLang: 'pt-PT' },
  'en-US': { flag: '🇺🇸', ttsLang: 'en-US' },
}

// Single source of truth for available language pairs: which targets each native
// can currently learn, gated by authored content. A native never lists itself.
// Adding a pair (e.g. pt-PT speakers learning English) is a one-line change here.
export const TARGETS_BY_NATIVE: Record<string, readonly string[]> = {
  'en-US': ['es-ES', 'pt-PT'],
  'es-ES': ['en-US'],
}

export function getAvailableTargets(native: string): readonly string[] {
  return TARGETS_BY_NATIVE[native] ?? TARGETS_BY_NATIVE[DEFAULT_NATIVE]
}

// ── Unified schema (prompts.json) ─────────────────────────────────────────────

export type PromptType = 'conversation' | 'scenario'

export interface Translation {
  phrase?: string        // absent for scenario prompts
  response: string
  practiceAsTarget?: boolean
  gloss?: Record<string, string>
}

export interface UnifiedPrompt {
  id: string
  type?: PromptType      // omitted = 'conversation'
  tags: string[]
  difficulty: number
  context: Record<string, string>
  translations: Record<string, Translation>
}

export interface UnifiedScenario {
  id: string
  // Localized category display names (resolved like `context` via the native lang).
  // `id` is the stable selection/filter key — never the display string.
  categoryName: Record<string, string>
  icon: string
  color: string
  prompts: UnifiedPrompt[]
}

// ── Internal working types (flat view derived per language) ───────────────────

export interface Prompt {
  id: string
  type?: PromptType      // omitted = 'conversation'
  phrase?: string        // absent for scenario prompts
  english?: string       // absent for scenario prompts
  context: string
  yourResponse: string
  yourResponseEnglish?: string  // native-language gloss; absent when target is the native's own English
  gloss?: string
  tags: string[]
  difficulty: number
}

export interface Scenario {
  id: string
  category: string
  icon: string
  color: string
  prompts: Prompt[]
}

export interface PromptWithScenario extends Prompt {
  category: string
  icon: string
  color: string
  scenarioId: string
}

export interface PromptStats {
  timesShown: number
  timesUnderstood: number
  lastShown: string
  streak: number
}

export type ProgressData = Record<string, PromptStats>

export type Speed = 'slow' | 'normal' | 'fast'

export type SessionMode = 'full' | 'review' | 'new'

export type Screen = 'home' | 'practice' | 'summary' | 'progress'

