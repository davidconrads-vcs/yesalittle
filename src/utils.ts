import { SUPPORTED_TARGETS } from './types'

export function resolveByNativeLang(
  field: Record<string, string> | undefined,
  nativeLang: string,
): string | undefined {
  if (!field) return undefined
  return field[nativeLang] ?? field['en-US'] ?? Object.values(field)[0] ?? undefined
}

// ── Entry params ──────────────────────────────────────────────────────────────

export interface EntryParams {
  target?: string
  scenario?: string
  // A single prompt to land on directly, bypassing Home. Only ever set alongside a
  // valid `target`: a prompt id means nothing without the language to drill it in.
  prompt?: string
}

/**
 * One-time entry state from the query string, used by the static content pages to
 * hand a warmed-up reader straight to the right language and scenario
 * (e.g. `/?scenario=restaurant&target=es-ES`), or straight to one single prompt
 * (`/?prompt=cafe-006&target=es-ES`).
 *
 * Anything unrecognized is dropped SILENTLY — a stale or hand-mangled link should
 * land on the normal home screen, never an error state. Callers pass the scenario
 * ids and a drillability predicate to validate against, so this stays free of a
 * data import. Matching is case-sensitive, like the ids themselves.
 *
 * Note `target` is only checked against the registry here; whether the resolved
 * native can actually LEARN it is App's gate (getAvailableTargets), applied there.
 *
 * This is entry state, not a preference: nothing here is written to localStorage.
 */
export function readEntryParams(
  scenarioIds: readonly string[],
  // (promptId, target) => is this prompt drillable in that target?
  isDrillable: (promptId: string, target: string) => boolean,
): EntryParams {
  if (typeof window === 'undefined') return {}
  let params: URLSearchParams
  try {
    params = new URLSearchParams(window.location.search)
  } catch {
    return {}
  }
  const rawTarget = params.get('target')
  const scenario = params.get('scenario')
  const rawPrompt = params.get('prompt')

  const target =
    rawTarget && (SUPPORTED_TARGETS as readonly string[]).includes(rawTarget) ? rawTarget : undefined

  return {
    target,
    scenario: scenario && scenarioIds.includes(scenario) ? scenario : undefined,
    // Both gates or nothing: `prompt` without a valid `target` is dropped rather
    // than guessed at, and an id that exists but isn't drillable in that target
    // would build an empty queue.
    prompt: target && rawPrompt && isDrillable(rawPrompt, target) ? rawPrompt : undefined,
  }
}
