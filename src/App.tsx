import { useState } from 'react'
import promptsData from './data/prompts.json'
import { UnifiedScenario, Scenario, Prompt, PromptWithScenario, LanguagePair, SessionMode, Speed, Screen, SUPPORTED_TARGETS, DEFAULT_NATIVE } from './types'
import { resolveByNativeLang } from './utils'
import { useProgress } from './hooks/useProgress'
import { buildQueue } from './hooks/useSpacedQueue'
import Home from './components/Home'
import Practice from './components/Practice'
import Summary from './components/Summary'
import Progress from './components/Progress'

const PREF_TARGET_KEY = 'yesalittle:target'

// Builds a flat, language-specific scenario list from the unified schema.
// resolveByNativeLang is called here at build time against the current native locale,
// so a future native-language switcher will need to rebuild DATA when native changes.
function buildScenarios(target: string, native = DEFAULT_NATIVE): Scenario[] {
  return (promptsData.scenarios as unknown as UnifiedScenario[])
    .map(s => ({
      ...s,
      prompts: s.prompts
        .filter(p => {
          const t = p.translations[target]
          return t != null && t.practiceAsTarget !== false
        })
        .map((p): Prompt => ({
          id: p.id,
          phrase: p.translations[target].phrase,
          english: p.translations['en-US'].phrase,
          context: resolveByNativeLang(p.context, native) ?? '',
          yourResponse: p.translations[target].response,
          yourResponseEnglish: p.translations['en-US'].response,
          gloss: resolveByNativeLang(p.translations[target].gloss, native),
          tags: p.tags,
          difficulty: p.difficulty,
        })),
    }))
    .filter(s => s.prompts.length > 0)
}

const DATA: Record<string, Scenario[]> = Object.fromEntries(
  SUPPORTED_TARGETS.map(t => [t, buildScenarios(t)])
)

function buildAllPrompts(scenarios: Scenario[]): PromptWithScenario[] {
  return scenarios.flatMap(s =>
    s.prompts.map(p => ({
      ...p,
      category: s.category,
      icon: s.icon,
      color: s.color,
      scenarioId: s.id,
    }))
  )
}

interface SessionResult {
  prompt: PromptWithScenario
  understood: boolean
}

function getInitialSpeed(): Speed {
  try {
    const saved = localStorage.getItem('trainer-speed')
    if (saved === 'slow' || saved === 'normal' || saved === 'fast') return saved
  } catch {}
  return 'normal'
}

function getInitialTarget(): string {
  try {
    const saved = localStorage.getItem(PREF_TARGET_KEY)
    if (saved && (SUPPORTED_TARGETS as readonly string[]).includes(saved)) return saved
  } catch {}
  return SUPPORTED_TARGETS[0]
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [speed, setSpeed] = useState<Speed>(getInitialSpeed)
  const [language, setLanguage] = useState<string>(getInitialTarget)
  const [queue, setQueue] = useState<PromptWithScenario[]>([])
  const [results, setResults] = useState<SessionResult[]>([])
  const pair: LanguagePair = { native: DEFAULT_NATIVE, target: language }
  const { progress, streak, recordResult, markSessionComplete, resetProgress } = useProgress(pair)

  const scenarios = DATA[language]
  const allPrompts = buildAllPrompts(scenarios)

  const handleSpeedChange = (s: Speed) => {
    setSpeed(s)
    try { localStorage.setItem('trainer-speed', s) } catch {}
  }

  const handleLanguageChange = (l: string) => {
    setLanguage(l)
    try { localStorage.setItem(PREF_TARGET_KEY, l) } catch {}
  }

  const handleStart = (categories: Set<string>, mode: SessionMode) => {
    const pool = categories.size === 0
      ? allPrompts
      : allPrompts.filter(p => categories.has(p.category))
    const q = buildQueue(pool, progress, mode, mode === 'review' ? 15 : undefined)
    if (q.length === 0) {
      alert(mode === 'new' ? "No new phrases in this selection!" : "No phrases to review!")
      return
    }
    setQueue(q)
    setResults([])
    setScreen('practice')
  }

  const handleResult = (promptId: string, understood: boolean) => {
    recordResult(promptId, understood)
    const prompt = allPrompts.find(p => p.id === promptId)!
    const newResults = [...results, { prompt, understood }]
    setResults(newResults)
    if (newResults.length >= queue.length) {
      markSessionComplete()
      setScreen('summary')
    }
  }

  const handleRetryMissed = (missed: PromptWithScenario[]) => {
    setQueue([...missed].sort(() => Math.random() - 0.5))
    setResults([])
    setScreen('practice')
  }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      {screen === 'home' && (
        <Home
          scenarios={scenarios}
          language={language}
          onLanguageChange={handleLanguageChange}
          onStart={handleStart}
          streak={streak}
          speed={speed}
          onSpeedChange={handleSpeedChange}
          onProgressClick={() => setScreen('progress')}
        />
      )}
      {screen === 'practice' && (
        <Practice
          queue={queue}
          speed={speed}
          lang={language}
          onSpeedChange={handleSpeedChange}
          onResult={handleResult}
          onExit={() => setScreen('home')}
        />
      )}
      {screen === 'summary' && (
        <Summary
          results={results}
          speed={speed}
          lang={language}
          onRetryMissed={handleRetryMissed}
          onNewSession={() => setScreen('home')}
        />
      )}
      {screen === 'progress' && (
        <Progress
          scenarios={scenarios}
          progress={progress}
          streak={streak}
          allPrompts={allPrompts}
          onBack={() => setScreen('home')}
          onReset={() => { resetProgress(); setScreen('home') }}
        />
      )}
    </>
  )
}
