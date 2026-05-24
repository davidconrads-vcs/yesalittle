import { readFileSync, writeFileSync, renameSync, copyFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const ES_FILE = join(ROOT, 'src', 'data', 'prompts.json')
const PT_FILE = join(ROOT, 'src', 'data', 'prompts-pt.json')
const BACKUP_ES = join(ROOT, 'src', 'data', 'prompts-es.json')
const AUDIO_DIR = join(ROOT, 'public', 'audio')
const SPEEDS = ['slow', 'normal', 'fast']

interface OldPrompt {
  id: string
  phrase: string
  english: string
  context: string
  yourResponse: string
  yourResponseEnglish: string
  tags: string[]
  difficulty: number
}

interface OldScenario {
  id: string
  category: string
  icon: string
  color: string
  prompts: OldPrompt[]
}

interface Translation {
  phrase: string
  response: string
  practiceAsTarget?: boolean
}

interface UnifiedPrompt {
  id: string
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

// ── Idempotency guards ────────────────────────────────────────────────────────

if (existsSync(BACKUP_ES)) {
  console.log('prompts-es.json already exists — migration has already run. Exiting cleanly.')
  process.exit(0)
}

const rawEs = readFileSync(ES_FILE, 'utf-8')
const parsedEs = JSON.parse(rawEs)
if (parsedEs.scenarios?.[0]?.prompts?.[0]?.translations !== undefined) {
  console.log('prompts.json already uses the unified schema (translations key found). Exiting cleanly.')
  process.exit(0)
}

// ── Load source data ──────────────────────────────────────────────────────────

const esData: { scenarios: OldScenario[] } = parsedEs
const ptData: { scenarios: OldScenario[] } = JSON.parse(readFileSync(PT_FILE, 'utf-8'))

// ── Per-prompt source field validation ───────────────────────────────────────

const REQUIRED_FIELDS: (keyof OldPrompt)[] = ['phrase', 'english', 'context', 'yourResponse', 'yourResponseEnglish']
const validationErrors: string[] = []

for (const s of esData.scenarios) {
  for (const p of s.prompts) {
    for (const field of REQUIRED_FIELDS) {
      if (p[field] === undefined || p[field] === null) {
        validationErrors.push(`ES prompt ${p.id} missing field: ${field}`)
      }
    }
  }
}
for (const s of ptData.scenarios) {
  for (const p of s.prompts) {
    for (const field of REQUIRED_FIELDS) {
      if (p[field] === undefined || p[field] === null) {
        validationErrors.push(`PT prompt ${p.id} missing field: ${field}`)
      }
    }
  }
}

if (validationErrors.length > 0) {
  console.error('ABORT — source field validation failed:')
  for (const e of validationErrors) console.error(`  ${e}`)
  process.exit(1)
}
console.log(`Source field validation passed (${esData.scenarios.reduce((n, s) => n + s.prompts.length, 0) + ptData.scenarios.reduce((n, s) => n + s.prompts.length, 0)} prompts checked)`)

// ── Audio pre-flight (all checks before any disk write) ───────────────────────

const audioMissing: string[] = []
const audioCollisions: string[] = []

for (const s of esData.scenarios) {
  for (const p of s.prompts) {
    const oldId = p.id
    const newId = `es-${p.id}`
    for (const speed of SPEEDS) {
      for (const suffix of ['', '-response']) {
        const oldPath = join(AUDIO_DIR, `${oldId}${suffix}-${speed}.mp3`)
        const newPath = join(AUDIO_DIR, `${newId}${suffix}-${speed}.mp3`)
        if (!existsSync(oldPath)) audioMissing.push(`${oldId}${suffix}-${speed}.mp3`)
        if (existsSync(newPath)) audioCollisions.push(`${newId}${suffix}-${speed}.mp3`)
      }
    }
  }
}

if (audioMissing.length > 0) {
  console.error(`ABORT — ${audioMissing.length} expected audio file(s) missing:`)
  for (const f of audioMissing) console.error(`  ${f}`)
  process.exit(1)
}
if (audioCollisions.length > 0) {
  console.error(`ABORT — ${audioCollisions.length} rename target(s) already exist (would collide):`)
  for (const f of audioCollisions) console.error(`  ${f}`)
  process.exit(1)
}

const esAudioCount = esData.scenarios.reduce((n, s) => n + s.prompts.length, 0) * SPEEDS.length * 2
console.log(`Audio pre-flight passed: ${esAudioCount} files verified, 0 missing, 0 collisions`)

// ── Build unified data ────────────────────────────────────────────────────────

function transformESPrompt(p: OldPrompt): UnifiedPrompt {
  return {
    id: `es-${p.id}`,
    tags: p.tags,
    difficulty: p.difficulty,
    context: { 'en-US': p.context },
    translations: {
      'es-ES': { phrase: p.phrase, response: p.yourResponse, practiceAsTarget: true },
      'en-US': { phrase: p.english, response: p.yourResponseEnglish },
    },
  }
}

function transformPTPrompt(p: OldPrompt): UnifiedPrompt {
  const newId = p.id.startsWith('pt-') ? p.id : `pt-${p.id}`
  return {
    id: newId,
    tags: p.tags,
    difficulty: p.difficulty,
    context: { 'en-US': p.context },
    translations: {
      'pt-PT': { phrase: p.phrase, response: p.yourResponse, practiceAsTarget: true },
      'en-US': { phrase: p.english, response: p.yourResponseEnglish },
    },
  }
}

// PT scenario IDs that should be merged into a canonical ES scenario ID
const PT_ID_REMAP: Record<string, string> = {
  'getting-around': 'around',
}

const scenarioMap = new Map<string, UnifiedScenario>()
for (const s of esData.scenarios) {
  scenarioMap.set(s.id, {
    id: s.id, category: s.category, icon: s.icon, color: s.color,
    prompts: s.prompts.map(transformESPrompt),
  })
}

for (const s of ptData.scenarios) {
  const targetId = PT_ID_REMAP[s.id] ?? s.id
  const transformedPrompts = s.prompts.map(transformPTPrompt)

  if (scenarioMap.has(targetId)) {
    scenarioMap.get(targetId)!.prompts.push(...transformedPrompts)
    if (PT_ID_REMAP[s.id]) {
      console.log(`Merged PT scenario "${s.id}" → "${targetId}" (${transformedPrompts.length} prompts moved)`)
    }
  } else {
    scenarioMap.set(targetId, {
      id: targetId, category: s.category, icon: s.icon, color: s.color,
      prompts: transformedPrompts,
    })
  }
}

const unifiedData = { scenarios: Array.from(scenarioMap.values()) }

// ── Count and uniqueness verification ────────────────────────────────────────

const esCount = esData.scenarios.reduce((n, s) => n + s.prompts.length, 0)
const ptCount = ptData.scenarios.reduce((n, s) => n + s.prompts.length, 0)
const unifiedCount = unifiedData.scenarios.reduce((n, s) => n + s.prompts.length, 0)

if (unifiedCount !== esCount + ptCount) {
  console.error(`ABORT — count mismatch: ES ${esCount} + PT ${ptCount} = ${esCount + ptCount}, got ${unifiedCount}`)
  process.exit(1)
}

const allIds = unifiedData.scenarios.flatMap(s => s.prompts.map(p => p.id))
const seen = new Set<string>()
const dupes = allIds.filter(id => seen.size === seen.add(id).size)
if (dupes.length > 0) {
  console.error(`ABORT — duplicate IDs: ${dupes.join(', ')}`)
  process.exit(1)
}

// ── Write files (all checks passed — commit to disk) ─────────────────────────

copyFileSync(ES_FILE, BACKUP_ES)
console.log('Backed up prompts.json → prompts-es.json')

writeFileSync(ES_FILE, JSON.stringify(unifiedData, null, 2), 'utf-8')
console.log(`Written unified prompts.json  (ES: ${esCount}  PT: ${ptCount}  Total: ${unifiedCount} ✓)`)

let renamed = 0
for (const s of esData.scenarios) {
  for (const p of s.prompts) {
    const oldId = p.id
    const newId = `es-${p.id}`
    for (const speed of SPEEDS) {
      for (const suffix of ['', '-response']) {
        renameSync(
          join(AUDIO_DIR, `${oldId}${suffix}-${speed}.mp3`),
          join(AUDIO_DIR, `${newId}${suffix}-${speed}.mp3`),
        )
        renamed++
      }
    }
  }
}
console.log(`Audio files renamed: ${renamed} ✓`)
console.log('Done!')
