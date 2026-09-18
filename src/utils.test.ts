// Regression coverage for entry-link parsing (`?scenario=`, `?target=`, `?prompt=`).
//
// These three functions are the whole contract behind a deep link, and every one of
// their failure modes is SILENT by design — a bad param lands on the normal Home
// screen rather than erroring. That makes a regression here invisible at runtime and
// invisible to tsc, which is exactly why it is pinned down in tests.
//
// Run with `npm test` (Node's built-in runner; no test framework dependency).

import test from 'node:test'
import assert from 'node:assert/strict'
import promptsData from './data/prompts.json'
import { readEntryParams, pickInitialTarget, resolveEntryLanding, EntryParams } from './utils'
import { UnifiedScenario, getAvailableTargets } from './types'

const SCENARIOS = promptsData.scenarios as unknown as UnifiedScenario[]
const SCENARIO_IDS = SCENARIOS.map(s => s.id)
const BY_ID = new Map(SCENARIOS.flatMap(s => s.prompts.map(p => [p.id, p] as const)))

// The same gate buildScenarios filters on, mirrored from App.
const isDrillable = (id: string, target: string) =>
  BY_ID.get(id)?.translations[target]?.practiceAsTarget === true

// readEntryParams reads window.location.search; stand one up per case.
function parse(search: string): EntryParams {
  const g = globalThis as { window?: unknown }
  const previous = g.window
  g.window = { location: { search } }
  try {
    return readEntryParams(SCENARIO_IDS, isDrillable)
  } finally {
    if (previous === undefined) delete g.window
    else g.window = previous
  }
}

// Fixtures, asserted so a prompts.json edit fails loudly here instead of quietly
// turning a negative case into a vacuous pass.
const CONVERSATION = 'cafe-006'   // drillable in es-ES, NOT in en-US
const SCENARIO_PROMPT = 'panic-001' // drillable in es-ES
const NOT_IN_ES = 'panic-009'     // exists, but has no drillable es-ES block

test('fixtures still hold in prompts.json', () => {
  assert.ok(isDrillable(CONVERSATION, 'es-ES'), `${CONVERSATION} should be drillable in es-ES`)
  assert.ok(!isDrillable(CONVERSATION, 'en-US'), `${CONVERSATION} should not be drillable in en-US`)
  assert.ok(isDrillable(SCENARIO_PROMPT, 'es-ES'), `${SCENARIO_PROMPT} should be drillable in es-ES`)
  assert.ok(BY_ID.has(NOT_IN_ES), `${NOT_IN_ES} should exist`)
  assert.ok(!isDrillable(NOT_IN_ES, 'es-ES'), `${NOT_IN_ES} should not be drillable in es-ES`)
})

// ── readEntryParams ───────────────────────────────────────────────────────────

test('accepts a valid prompt deep link', () => {
  assert.deepEqual(parse(`?prompt=${CONVERSATION}&target=es-ES`), {
    target: 'es-ES',
    scenario: undefined,
    prompt: CONVERSATION,
  })
})

test('accepts a scenario-type prompt the same way', () => {
  assert.equal(parse(`?prompt=${SCENARIO_PROMPT}&target=es-ES`).prompt, SCENARIO_PROMPT)
})

test('drops prompt when target is missing — a prompt id is meaningless alone', () => {
  assert.equal(parse(`?prompt=${CONVERSATION}`).prompt, undefined)
})

test('drops prompt when target is not a supported locale', () => {
  const got = parse(`?prompt=${CONVERSATION}&target=xx`)
  assert.equal(got.prompt, undefined)
  assert.equal(got.target, undefined)
})

test('drops an unknown prompt id but keeps a valid target', () => {
  const got = parse('?prompt=nonsense&target=es-ES')
  assert.equal(got.prompt, undefined)
  assert.equal(got.target, 'es-ES')
})

test('drops a prompt that exists but is not drillable in that target', () => {
  assert.equal(parse(`?prompt=${NOT_IN_ES}&target=es-ES`).prompt, undefined)
  // Same id, different target: the gate is per-target, not a blanket reject.
  assert.equal(parse(`?prompt=${NOT_IN_ES}&target=pt-PT`).prompt, NOT_IN_ES)
})

test('drops a prompt whose translation exists but opts out of practiceAsTarget', () => {
  assert.equal(parse(`?prompt=${CONVERSATION}&target=en-US`).prompt, undefined)
})

test('matches ids case-sensitively', () => {
  assert.equal(parse(`?prompt=${CONVERSATION.toUpperCase()}&target=es-ES`).prompt, undefined)
  assert.equal(parse('?scenario=RESTAURANT&target=es-ES').scenario, undefined)
})

test('returns both prompt and scenario when both are valid — precedence is not its job', () => {
  assert.deepEqual(parse(`?prompt=${CONVERSATION}&scenario=restaurant&target=es-ES`), {
    target: 'es-ES',
    scenario: 'restaurant',
    prompt: CONVERSATION,
  })
})

test('still handles a plain scenario link (Handoff 15)', () => {
  assert.deepEqual(parse('?scenario=restaurant&target=es-ES'), {
    target: 'es-ES',
    scenario: 'restaurant',
    prompt: undefined,
  })
})

test('returns nothing for an empty or unrecognized query string', () => {
  assert.deepEqual(parse(''), { target: undefined, scenario: undefined, prompt: undefined })
  assert.deepEqual(parse('?foo=bar'), { target: undefined, scenario: undefined, prompt: undefined })
})

test('returns nothing when there is no window at all', () => {
  const g = globalThis as { window?: unknown }
  const previous = g.window
  delete g.window
  try {
    assert.deepEqual(readEntryParams(SCENARIO_IDS, isDrillable), {})
  } finally {
    if (previous !== undefined) g.window = previous
  }
})

// ── pickInitialTarget (the per-native gate) ───────────────────────────────────

test('an entry target outranks the saved preference', () => {
  assert.equal(pickInitialTarget(getAvailableTargets('en-US'), 'pt-PT', 'es-ES'), 'pt-PT')
})

test('an entry target this native cannot learn falls back to the saved one', () => {
  // en-US is not learnable BY an en-US speaker, so the link's language is rejected.
  assert.equal(pickInitialTarget(getAvailableTargets('en-US'), 'en-US', 'pt-PT'), 'pt-PT')
})

test('falls back to the first available target when neither is usable', () => {
  const avail = getAvailableTargets('es-ES')
  assert.equal(pickInitialTarget(avail, 'es-ES', null), avail[0])
  assert.equal(pickInitialTarget(avail, undefined, 'pt-PT'), avail[0])
})

test('ignores a saved target that is no longer available for this native', () => {
  assert.equal(pickInitialTarget(getAvailableTargets('es-ES'), undefined, 'es-ES'), 'en-US')
})

// ── resolveEntryLanding (native gate + precedence) ────────────────────────────

test('a prompt landing wins over a scenario preselection', () => {
  const entry = { target: 'es-ES', scenario: 'restaurant', prompt: CONVERSATION }
  assert.deepEqual(resolveEntryLanding(entry, 'es-ES'), { promptId: CONVERSATION })
})

test('a prompt is dropped when the app did not open on that target', () => {
  // Target valid in the registry, but this native cannot learn it — pickInitialTarget
  // settled on something else, so the deep link must not be honored.
  const entry = { target: 'es-ES', scenario: 'restaurant', prompt: CONVERSATION }
  assert.deepEqual(resolveEntryLanding(entry, 'en-US'), { scenarioId: 'restaurant' })
})

test('a rejected prompt leaves a valid scenario intact', () => {
  // Deliberate: precedence is "prompt wins when BOTH are valid". Once the prompt is
  // out, `scenario` is just an ordinary valid param and keeps its Handoff 15 meaning,
  // so these three links agree rather than diverging on which way the prompt failed.
  const gatedByNative = resolveEntryLanding(
    { target: 'es-ES', scenario: 'restaurant', prompt: CONVERSATION }, 'en-US')
  const promptIdRejectedEarlier = resolveEntryLanding(
    { target: 'es-ES', scenario: 'restaurant' }, 'en-US')
  const scenarioLinkAlone = resolveEntryLanding({ target: 'es-ES', scenario: 'restaurant' }, 'en-US')
  assert.deepEqual(gatedByNative, { scenarioId: 'restaurant' })
  assert.deepEqual(promptIdRejectedEarlier, gatedByNative)
  assert.deepEqual(scenarioLinkAlone, gatedByNative)
})

test('a scenario preselection survives on its own', () => {
  assert.deepEqual(resolveEntryLanding({ target: 'es-ES', scenario: 'restaurant' }, 'es-ES'), {
    scenarioId: 'restaurant',
  })
})

test('empty entry params land on a plain Home screen', () => {
  assert.deepEqual(resolveEntryLanding({}, 'es-ES'), { scenarioId: undefined })
})
