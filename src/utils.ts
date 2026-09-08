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
}

/**
 * One-time entry state from the query string, used by the static content pages to
 * hand a warmed-up reader straight to the right language and scenario
 * (e.g. `/?scenario=restaurant&target=es-ES`).
 *
 * Anything unrecognized is dropped SILENTLY — a stale or hand-mangled link should
 * land on the normal home screen, never an error state. Callers pass the scenario
 * ids to validate against so this stays free of a data import.
 *
 * This is entry state, not a preference: nothing here is written to localStorage.
 */
export function readEntryParams(scenarioIds: readonly string[]): EntryParams {
  if (typeof window === 'undefined') return {}
  let params: URLSearchParams
  try {
    params = new URLSearchParams(window.location.search)
  } catch {
    return {}
  }
  const target = params.get('target')
  const scenario = params.get('scenario')
  return {
    target: target && (SUPPORTED_TARGETS as readonly string[]).includes(target) ? target : undefined,
    scenario: scenario && scenarioIds.includes(scenario) ? scenario : undefined,
  }
}
