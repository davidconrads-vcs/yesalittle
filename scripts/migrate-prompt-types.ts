import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PROMPTS_FILE = join(ROOT, 'src', 'data', 'prompts.json')
const AUDIO_DIR = join(ROOT, 'public', 'audio')
const SPEEDS = ['slow', 'normal', 'fast']

const SCENARIO_IDS = [
  'es-greet-017', 'es-greet-018', 'es-greet-019', 'es-greet-020', 'es-greet-021',
  'es-panic-001', 'es-panic-002', 'es-panic-003', 'es-panic-004', 'es-panic-005', 'es-panic-006',
  'pt-rest-009',
]

const CONTEXT_UPDATES: Record<string, string> = {
  'es-greet-017': "You're walking down a narrow street and a few people are blocking the way. You need to get past politely.",
  'es-greet-018': "The metro is packed and your stop is next. You need to work your way to the doors past several people.",
  'es-greet-019': "At a supermarket, the item you want is on a shelf behind another shopper. You need to lean past them to reach it.",
  'es-greet-020': "You've been waiting at your table and need to catch the server's attention without being rude or loud.",
  'es-greet-021': "You accidentally bump into someone on a busy street. You want to apologize quickly as you both keep moving.",
  'es-panic-001': "Someone has just said something to you and you almost understood — you got the gist but missed enough that you can't confidently respond. You need them to say it again.",
  'es-panic-002': "Someone is speaking to you and the speed is too fast to follow. You understand the words individually but they're coming too quickly to process. You need them to slow down.",
  'es-panic-003': "You started a conversation in Spanish and it's gotten beyond your level — you're now lost and need to gracefully signal that your Spanish isn't strong enough to keep up.",
  'es-panic-004': "You followed almost all of what someone said, but there's one specific word you didn't recognize and it's the key to understanding the whole thing. You need to ask what just that word means.",
  'es-panic-005': "Someone is trying to tell you something — a name, an address, a price — and you can't catch it by ear. You need them to write it down so you can see it.",
  'es-panic-006': "Someone has just spoken to you in Spanish and you understood nothing — not a single word landed. You need to acknowledge the situation and ask if they can switch to English.",
  'pt-rest-009': "You've finished eating and are ready to leave, but the bill hasn't come. In Portugal, waiters generally won't bring the check unsolicited — you have to ask for it.",
}

interface Translation {
  phrase?: string
  response: string
  practiceAsTarget?: boolean
  gloss?: Record<string, string>
}

interface UnifiedPrompt {
  id: string
  type?: string
  tags: string[]
  difficulty: number
  context: Record<string, string>
  translations: Record<string, Translation>
}

interface UnifiedScenario {
  id: string
  category: string
  icon: string
  color: string
  prompts: UnifiedPrompt[]
}

interface PromptsData {
  scenarios: UnifiedScenario[]
}

// ── Load ──────────────────────────────────────────────────────────────────────

const data: PromptsData = JSON.parse(readFileSync(PROMPTS_FILE, 'utf-8'))
const allPrompts = data.scenarios.flatMap(s => s.prompts)

// ── Idempotency guard ─────────────────────────────────────────────────────────

const alreadyMigrated = SCENARIO_IDS.filter(id => {
  const p = allPrompts.find(p => p.id === id)
  return p?.type === 'scenario'
})

if (alreadyMigrated.length > 0) {
  console.log(`Already migrated (${alreadyMigrated.length} IDs have type: 'scenario' — migration has already run): ${alreadyMigrated.join(', ')}`)
  console.log('Exiting cleanly.')
  process.exit(0)
}

// ── Verify all 12 IDs exist ───────────────────────────────────────────────────

const missingIds = SCENARIO_IDS.filter(id => !allPrompts.find(p => p.id === id))
if (missingIds.length > 0) {
  console.error(`ABORT — ${missingIds.length} expected prompt ID(s) not found in prompts.json: ${missingIds.join(', ')}`)
  process.exit(1)
}
console.log(`All 12 scenario IDs found in prompts.json`)

// ── Audio pre-flight (all 72 files must exist before any disk write) ──────────

const phraseFilesToDelete: string[] = []
const responseFilesToKeep: string[] = []
const audioMissing: string[] = []

for (const id of SCENARIO_IDS) {
  for (const speed of SPEEDS) {
    const phraseFile = join(AUDIO_DIR, `${id}-${speed}.mp3`)
    const responseFile = join(AUDIO_DIR, `${id}-response-${speed}.mp3`)
    if (!existsSync(phraseFile)) audioMissing.push(`${id}-${speed}.mp3`)
    if (!existsSync(responseFile)) audioMissing.push(`${id}-response-${speed}.mp3`)
    phraseFilesToDelete.push(phraseFile)
    responseFilesToKeep.push(responseFile)
  }
}

if (audioMissing.length > 0) {
  console.error(`ABORT — ${audioMissing.length} expected audio file(s) missing:`)
  for (const f of audioMissing) console.error(`  ${f}`)
  process.exit(1)
}
console.log(`Audio pre-flight passed: ${phraseFilesToDelete.length} phrase files (to delete) + ${responseFilesToKeep.length} response files (to keep) — all present`)

// ── Apply changes to the 12 prompts ──────────────────────────────────────────

const scenarioIdSet = new Set(SCENARIO_IDS)

for (const scenario of data.scenarios) {
  for (const prompt of scenario.prompts) {
    if (!scenarioIdSet.has(prompt.id)) continue

    const newContext = CONTEXT_UPDATES[prompt.id]
    if (!newContext) {
      console.error(`ABORT — no context update entry for prompt ${prompt.id}`)
      process.exit(1)
    }

    // Add type
    prompt.type = 'scenario'

    // Update context
    prompt.context['en-US'] = newContext

    // Strip phrase from all translation entries
    for (const lang of Object.keys(prompt.translations)) {
      delete prompt.translations[lang].phrase
    }
  }
}

// ── Validate every modified prompt ────────────────────────────────────────────

const validationErrors: string[] = []

for (const id of SCENARIO_IDS) {
  const p = allPrompts.find(p => p.id === id)!

  if (p.type !== 'scenario') {
    validationErrors.push(`${id}: type is '${p.type}', expected 'scenario'`)
  }

  for (const [lang, t] of Object.entries(p.translations)) {
    if (t.phrase !== undefined) {
      validationErrors.push(`${id}: translations.${lang} still has a phrase field`)
    }
    if (!t.response) {
      validationErrors.push(`${id}: translations.${lang} is missing response`)
    }
  }

  if (!p.context['en-US']) {
    validationErrors.push(`${id}: context.en-US is empty after update`)
  }
}

if (validationErrors.length > 0) {
  console.error('ABORT — validation failed:')
  for (const e of validationErrors) console.error(`  ${e}`)
  process.exit(1)
}
console.log(`Prompt validation passed: all 12 scenario prompts have type='scenario', no phrase fields, responses present`)

// ── Count verification ────────────────────────────────────────────────────────

const scenarioCount = allPrompts.filter(p => p.type === 'scenario').length
const totalCount = allPrompts.length

if (scenarioCount !== 12) {
  console.error(`ABORT — expected exactly 12 scenario prompts, got ${scenarioCount}`)
  process.exit(1)
}
if (totalCount !== 179) {
  console.error(`ABORT — expected 179 total prompts, got ${totalCount} (prompts were lost or added)`)
  process.exit(1)
}
console.log(`Count verification passed: ${scenarioCount} scenarios, ${totalCount} total`)

// ── Write prompts.json (all checks passed — commit to disk) ───────────────────

writeFileSync(PROMPTS_FILE, JSON.stringify(data, null, 2), 'utf-8')
console.log('Written updated prompts.json')

// ── Delete phrase audio files ─────────────────────────────────────────────────

let deleted = 0
for (const filePath of phraseFilesToDelete) {
  rmSync(filePath)
  deleted++
}

console.log(`Deleted ${deleted} phrase audio files for 12 scenario prompts; ${responseFilesToKeep.length} response audio files preserved.`)
console.log('Done!')
