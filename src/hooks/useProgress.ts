import { useState, useCallback, useEffect } from 'react'
import { LanguagePair, ProgressData, PromptStats } from '../types'

interface StreakData {
  lastPracticed: string
  streak: number
}

// One-time cleanup of legacy keys from before Handoff 2, guarded by a flag.
const MIGRATION_FLAG = 'yesalittle:migrated-v2'
const LEGACY_KEYS = [
  'trainer-progress-es',
  'trainer-progress-pt',
  'trainer-streak-es',
  'trainer-streak-pt',
  'trainer-language',
]
try {
  if (!localStorage.getItem(MIGRATION_FLAG)) {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key)
    localStorage.setItem(MIGRATION_FLAG, '1')
  }
} catch {}

function storageKey(pair: LanguagePair) {
  return `yesalittle:progress:${pair.native}::${pair.target}`
}

function streakKey(pair: LanguagePair) {
  return `yesalittle:streak:${pair.native}::${pair.target}`
}

function loadProgress(pair: LanguagePair): ProgressData {
  try {
    const raw = localStorage.getItem(storageKey(pair))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(data: ProgressData, pair: LanguagePair) {
  localStorage.setItem(storageKey(pair), JSON.stringify(data))
}

function loadStreak(pair: LanguagePair): StreakData {
  try {
    const raw = localStorage.getItem(streakKey(pair))
    return raw ? JSON.parse(raw) : { lastPracticed: '', streak: 0 }
  } catch {
    return { lastPracticed: '', streak: 0 }
  }
}

function updateStreak(pair: LanguagePair): number {
  const today = new Date().toISOString().split('T')[0]
  const data = loadStreak(pair)
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let newStreak: number
  if (data.lastPracticed === today) {
    newStreak = data.streak
  } else if (data.lastPracticed === yesterday) {
    newStreak = data.streak + 1
  } else {
    newStreak = 1
  }

  localStorage.setItem(streakKey(pair), JSON.stringify({ lastPracticed: today, streak: newStreak }))
  return newStreak
}

export function useProgress(pair: LanguagePair) {
  const [progress, setProgress] = useState<ProgressData>(() => loadProgress(pair))
  const [streak, setStreak] = useState<number>(() => loadStreak(pair).streak)

  useEffect(() => {
    setProgress(loadProgress(pair))
    setStreak(loadStreak(pair).streak)
  }, [pair.native, pair.target])

  const recordResult = useCallback((promptId: string, understood: boolean) => {
    setProgress(prev => {
      const existing = prev[promptId] ?? { timesShown: 0, timesUnderstood: 0, lastShown: '', streak: 0 }
      const newStreak = understood ? existing.streak + 1 : 0
      const updated: PromptStats = {
        timesShown: existing.timesShown + 1,
        timesUnderstood: existing.timesUnderstood + (understood ? 1 : 0),
        lastShown: new Date().toISOString(),
        streak: newStreak,
      }
      const next = { ...prev, [promptId]: updated }
      saveProgress(next, pair)
      return next
    })
  }, [pair.native, pair.target])

  const markSessionComplete = useCallback(() => {
    const s = updateStreak(pair)
    setStreak(s)
  }, [pair.native, pair.target])

  const resetProgress = useCallback(() => {
    localStorage.removeItem(storageKey(pair))
    localStorage.removeItem(streakKey(pair))
    setProgress({})
    setStreak(0)
  }, [pair.native, pair.target])

  return { progress, streak, recordResult, markSessionComplete, resetProgress }
}
