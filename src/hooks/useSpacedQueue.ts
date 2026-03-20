import { useMemo } from 'react'
import { PromptWithScenario, ProgressData, SessionMode } from '../types'

function weightedShuffle(items: Array<{ prompt: PromptWithScenario; weight: number }>): PromptWithScenario[] {
  const result: PromptWithScenario[] = []
  const pool = [...items]

  while (pool.length > 0) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0)
    let rand = Math.random() * totalWeight
    let idx = 0
    for (let i = 0; i < pool.length; i++) {
      rand -= pool[i].weight
      if (rand <= 0) {
        idx = i
        break
      }
    }
    result.push(pool[idx].prompt)
    pool.splice(idx, 1)
  }

  return result
}

export function buildQueue(
  prompts: PromptWithScenario[],
  progress: ProgressData,
  mode: SessionMode,
  limit?: number
): PromptWithScenario[] {
  let pool = prompts

  if (mode === 'review') {
    pool = prompts.filter(p => {
      const stats = progress[p.id]
      if (!stats) return false
      return stats.streak < 2
    })
  } else if (mode === 'new') {
    pool = prompts.filter(p => !progress[p.id])
  }

  const now = Date.now()

  const weighted = pool.map(prompt => {
    const stats = progress[prompt.id]
    let weight = 1

    if (!stats) {
      weight = 2 // never seen
    } else {
      const lastShown = stats.lastShown ? new Date(stats.lastShown).getTime() : 0
      const hoursSince = (now - lastShown) / (1000 * 60 * 60)

      if (hoursSince < 1) {
        // Very recently shown — low weight
        weight = stats.streak >= 3 ? 0.25 : 0.5
      } else if (stats.streak >= 3) {
        weight = 0.5 // good streak
      } else if (stats.timesShown > 0 && stats.streak === 0) {
        weight = 3 // recently missed
      }
    }

    return { prompt, weight }
  })

  const queue = weightedShuffle(weighted)
  return limit ? queue.slice(0, limit) : queue
}

export function useSpacedQueue(
  prompts: PromptWithScenario[],
  progress: ProgressData,
  mode: SessionMode
) {
  return useMemo(() => {
    const limit = mode === 'review' ? 15 : undefined
    return buildQueue(prompts, progress, mode, limit)
  }, [prompts, progress, mode])
}
