import { useState, useCallback } from 'react'
import { ProgressData, PromptStats } from '../types'

const STORAGE_KEY = 'spanish-trainer-progress'
const STREAK_KEY = 'spanish-trainer-streak'

interface StreakData {
  lastPracticed: string
  streak: number
}

function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(data: ProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    return raw ? JSON.parse(raw) : { lastPracticed: '', streak: 0 }
  } catch {
    return { lastPracticed: '', streak: 0 }
  }
}

function updateStreak(): number {
  const today = new Date().toISOString().split('T')[0]
  const data = loadStreak()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let newStreak: number
  if (data.lastPracticed === today) {
    newStreak = data.streak
  } else if (data.lastPracticed === yesterday) {
    newStreak = data.streak + 1
  } else {
    newStreak = 1
  }

  localStorage.setItem(STREAK_KEY, JSON.stringify({ lastPracticed: today, streak: newStreak }))
  return newStreak
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(loadProgress)
  const [streak, setStreak] = useState<number>(() => loadStreak().streak)

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
      saveProgress(next)
      return next
    })
  }, [])

  const markSessionComplete = useCallback(() => {
    const s = updateStreak()
    setStreak(s)
  }, [])

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STREAK_KEY)
    setProgress({})
    setStreak(0)
  }, [])

  return { progress, streak, recordResult, markSessionComplete, resetProgress }
}
