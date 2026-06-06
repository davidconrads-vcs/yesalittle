import { useMemo, useState } from 'react'
import promptsData from './data/prompts.json'
import { UnifiedScenario, Scenario, Prompt, PromptType, PromptWithScenario, LanguagePair, SessionMode, Speed, Screen, SUPPORTED_NATIVES, DEFAULT_NATIVE, getAvailableTargets } from './types'
import { resolveByNativeLang } from './utils'
import { useProgress } from './hooks/useProgress'
import { buildQueue } from './hooks/useSpacedQueue'
import Home from './components/Home'
import Practice from './components/Practice'
import Summary from './components/Summary'
import Progress from './components/Progress'

const PREF_TARGET_KEY = 'yesalittle:target'
const PREF_NATIVE_KEY = 'yesalittle:native'

// Builds a flat, language-specific scenario list from the unified schema.
// `native` drives which `context`/`gloss` strings are resolved, so scenarios are
// rebuilt (via useMemo in App) whenever the selected native or target changes.
function buildScenarios(target: string, native = DEFAULT_NATIVE): Scenario[] {
  return (promptsData.scenarios as unknown as UnifiedScenario[])
    .map(s => ({
      ...s,
      prompts: s.prompts
        .filter(p => {
          // A prompt is drillable in a target only when explicitly opted in.
          // Every es-ES/pt-PT entry sets this; for en-US only the ES→EN set does,
          // so English yields exactly its authored target prompts (not every en gloss).
          const t = p.translations[target]
          return t != null && t.practiceAsTarget === true
        })
        .map((p): Prompt => {
          const promptType: PromptType = p.type ?? 'conversation'
          const t = p.translations[target]
          const tEn = p.translations['en-US']
          if (promptType === 'scenario' && t.phrase !== undefined) {
            throw new Error(`Scenario prompt ${p.id} has a phrase field in ${target} — remove it from prompts.json`)
          }
          if (promptType === 'conversation' && !t.phrase) {
            throw new Error(`Conversation prompt ${p.id} is missing phrase in ${target}`)
          }
          return {
            id: p.id,
            type: promptType,
            phrase: t.phrase,
            // The English gloss line is meaningless when English IS the target
            // (it would just duplicate the phrase/response), so suppress it there.
            english: target === 'en-US' ? undefined : tEn.phrase,
            context: resolveByNativeLang(p.context, native) ?? '',
            yourResponse: t.response,
            yourResponseEnglish: target === 'en-US' ? undefined : tEn.response,
            gloss: resolveByNativeLang(t.gloss, native),
            tags: p.tags,
            difficulty: p.difficulty,
          }
        }),
    }))
    .filter(s => s.prompts.length > 0)
}

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

function getInitialNative(): string {
  try {
    const saved = localStorage.getItem(PREF_NATIVE_KEY)
    if (saved && (SUPPORTED_NATIVES as readonly string[]).includes(saved)) return saved
  } catch {}
  return DEFAULT_NATIVE
}

// Target must be one this native can actually learn; otherwise fall back to its first.
function getInitialTarget(native: string): string {
  const avail = getAvailableTargets(native)
  try {
    const saved = localStorage.getItem(PREF_TARGET_KEY)
    if (saved && avail.includes(saved)) return saved
  } catch {}
  return avail[0]
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [speed, setSpeed] = useState<Speed>(getInitialSpeed)
  const [native, setNative] = useState<string>(getInitialNative)
  const [language, setLanguage] = useState<string>(() => getInitialTarget(native))
  const [queue, setQueue] = useState<PromptWithScenario[]>([])
  const [results, setResults] = useState<SessionResult[]>([])
  const pair: LanguagePair = { native, target: language }
  const { progress, streak, recordResult, markSessionComplete, resetProgress } = useProgress(pair)

  const scenarios = useMemo(() => buildScenarios(language, native), [language, native])
  const allPrompts = useMemo(() => buildAllPrompts(scenarios), [scenarios])

  const handleSpeedChange = (s: Speed) => {
    setSpeed(s)
    try { localStorage.setItem('trainer-speed', s) } catch {}
  }

  const handleLanguageChange = (l: string) => {
    setLanguage(l)
    try { localStorage.setItem(PREF_TARGET_KEY, l) } catch {}
  }

  const handleNativeChange = (n: string) => {
    setNative(n)
    try { localStorage.setItem(PREF_NATIVE_KEY, n) } catch {}
    // If the current target isn't learnable from the new native, switch to its first.
    const avail = getAvailableTargets(n)
    if (!avail.includes(language)) {
      setLanguage(avail[0])
      try { localStorage.setItem(PREF_TARGET_KEY, avail[0]) } catch {}
    }
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
          native={native}
          onNativeChange={handleNativeChange}
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
