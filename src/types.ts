export type Language = 'es' | 'pt'

export interface Prompt {
  id: string
  phrase: string
  english: string
  context: string
  yourResponse: string
  yourResponseEnglish: string
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

export const LANGUAGE_CONFIG: Record<Language, { label: string; flag: string; ttsLang: string; title: string }> = {
  es: { label: 'Spanish', flag: '🇪🇸', ttsLang: 'es-ES', title: '¿Qué te han dicho?' },
  pt: { label: 'Portuguese', flag: '🇵🇹', ttsLang: 'pt-PT', title: 'O que te disseram?' },
}
