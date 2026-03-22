import { useState, useCallback, useEffect } from 'react'
import { ProgressData, PromptStats, Language } from '../types'

interface StreakData {
  lastPracticed: string
  streak: number
}

function storageKey(lang: Language) {
  return `trainer-progress-${lang}`
}

function streakKey(lang: Language) {
  return `trainer-streak-${lang}`
}

function loadProgress(lang: Language): ProgressData {
  try {
    const raw = localStorage.getItem(storageKey(lang))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(data: ProgressData, lang: Language) {
  localStorage.setItem(storageKey(lang), JSON.stringify(data))
}

function loadStreak(lang: Language): StreakData {
  try {
    const raw = localStorage.getItem(streakKey(lang))
    return raw ? JSON.parse(raw) : { lastPracticed: '', streak: 0 }
  } catch {
    return { lastPracticed: '', streak: 0 }
  }
}

function updateStreak(lang: Language): number {
  const today = new Date().toISOString().split('T')[0]
  const data = loadStreak(lang)
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let newStreak: number
  if (data.lastPracticed === today) {
    newStreak = data.streak
  } else if (data.lastPracticed === yesterday) {
    newStreak = data.streak + 1
  } else {
    newStreak = 1
  }

  localStorage.setItem(streakKey(lang), JSON.stringify({ lastPracticed: today, streak: newStreak }))
  return newStreak
}

export function useProgress(language: Language) {
  const [progress, setProgress] = useState<ProgressData>(() => loadProgress(language))
  const [streak, setStreak] = useState<number>(() => loadStreak(language).streak)

  useEffect(() => {
    setProgress(loadProgress(language))
    setStreak(loadStreak(language).streak)
  }, [language])

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
      saveProgress(next, language)
      return next
    })
  }, [language])

  const markSessionComplete = useCallback(() => {
    const s = updateStreak(language)
    setStreak(s)
  }, [language])

  const resetProgress = useCallback(() => {
    localStorage.removeItem(storageKey(language))
    localStorage.removeItem(streakKey(language))
    setProgress({})
    setStreak(0)
  }, [language])

  return { progress, streak, recordResult, markSessionComplete, resetProgress }
}
