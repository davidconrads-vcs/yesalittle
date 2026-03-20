export interface Prompt {
  id: string
  spanish: string
  english: string
  context: string
  yourResponse: string
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
