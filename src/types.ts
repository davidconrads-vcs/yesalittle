// ── Language pair ─────────────────────────────────────────────────────────────

export interface LanguagePair {
  native: string  // BCP 47 locale, e.g. 'en-US' — the learner's language (selectable)
  target: string  // BCP 47 locale, e.g. 'es-ES' | 'pt-PT'
}

export const DEFAULT_NATIVE = 'en-US'

// Single source of truth for selectable native languages. Adding a second entry
// (e.g. 'es-ES') here — plus its NATIVE_META row — is all that's needed for the
// native picker to offer it; no other wiring required.
export const SUPPORTED_NATIVES = ['en-US'] as const

export const NATIVE_META: Record<string, { label: string; flag: string }> = {
  'en-US': { label: 'English', flag: '🇺🇸' },
}

export const SUPPORTED_TARGETS = ['es-ES', 'pt-PT'] as const

export const TARGET_META: Record<string, { label: string; flag: string; ttsLang: string }> = {
  'es-ES': { label: 'Spanish',    flag: '🇪🇸', ttsLang: 'es-ES' },
  'pt-PT': { label: 'Portuguese', flag: '🇵🇹', ttsLang: 'pt-PT' },
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
  category: string
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
  yourResponseEnglish: string
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

