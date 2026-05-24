import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

interface Translation {
  phrase: string
  response: string
  practiceAsTarget?: boolean
}

interface UnifiedPrompt {
  id: string
  translations: Record<string, Translation>
}

interface UnifiedScenario {
  prompts: UnifiedPrompt[]
}

interface PromptsData {
  scenarios: UnifiedScenario[]
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
if (!ELEVENLABS_API_KEY) {
  console.error('Error: ELEVENLABS_API_KEY environment variable is not set.')
  process.exit(1)
}

// Voice IDs keyed by full locale code
// Spanish: "Valentina" — Peninsular Spanish female
// Portuguese: override with ELEVENLABS_VOICE_ID_PT env var
const VOICE_IDS: Record<string, string> = {
  'es-ES': process.env.ELEVENLABS_VOICE_ID_ES ?? 'cgSgspJ2msm6clMCkdW9',
  'pt-PT': process.env.ELEVENLABS_VOICE_ID_PT ?? 'c0rzOw18hxEhaSybUod2',
}

const DATA_FILE = join(ROOT, 'src', 'data', 'prompts.json')

const SPEEDS: Array<{ name: string; rate: number }> = [
  { name: 'slow', rate: 0.7 },
  { name: 'normal', rate: 0.85 },
  { name: 'fast', rate: 1.0 },
]

// Parse --lang flag (defaults to 'es-ES'); treated as an opaque locale string
const langArg = process.argv.find(a => a.startsWith('--lang='))
const lang = langArg ? langArg.split('=')[1] : 'es-ES'

if (!VOICE_IDS[lang]) {
  console.error(`Error: unsupported locale "${lang}". Supported: ${Object.keys(VOICE_IDS).join(', ')}`)
  process.exit(1)
}

// Parse --type flag (defaults to 'phrase')
const typeArg = process.argv.find(a => a.startsWith('--type='))
const type = typeArg ? typeArg.split('=')[1] : 'phrase'

if (!['phrase', 'response', 'all'].includes(type)) {
  console.error(`Error: unsupported type "${type}". Use --type=phrase, --type=response, or --type=all`)
  process.exit(1)
}

const VOICE_ID = VOICE_IDS[lang]

const audioDir = join(ROOT, 'public', 'audio')
if (!existsSync(audioDir)) {
  mkdirSync(audioDir, { recursive: true })
}

const data: PromptsData = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
// Availability rule: select prompts where translations[lang] exists and practiceAsTarget !== false
const allPrompts = data.scenarios
  .flatMap(s => s.prompts)
  .filter(p => {
    const t = p.translations[lang]
    return t != null && t.practiceAsTarget !== false
  })

async function generateAudio(promptId: string, text: string, speed: string, rate: number) {
  const outputPath = join(audioDir, `${promptId}-${speed}.mp3`)
  if (existsSync(outputPath)) {
    console.log(`  ✓ ${promptId}-${speed}.mp3 already exists, skipping`)
    return
  }

  console.log(`  Generating ${promptId}-${speed}.mp3 (rate: ${rate})...`)

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        speed: rate,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error(`  ✗ Failed to generate ${promptId}-${speed}.mp3: ${response.status} ${err}`)
    return
  }

  const buffer = await response.arrayBuffer()
  writeFileSync(outputPath, Buffer.from(buffer))
  console.log(`  ✓ Saved ${promptId}-${speed}.mp3`)
}

async function main() {
  const generatePhrases = type === 'phrase' || type === 'all'
  const generateResponses = type === 'response' || type === 'all'

  console.log(`Locale: ${lang} | Voice: ${VOICE_ID} | Type: ${type}`)
  console.log(`Generating audio for ${allPrompts.length} prompts × ${SPEEDS.length} speeds...`)
  console.log(`Output directory: ${audioDir}\n`)

  for (const prompt of allPrompts) {
    const t = prompt.translations[lang]
    if (generatePhrases) {
      console.log(`[${prompt.id}] phrase: "${t.phrase}"`)
      for (const speed of SPEEDS) {
        await generateAudio(prompt.id, t.phrase, speed.name, speed.rate)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }
    if (generateResponses) {
      console.log(`[${prompt.id}] response: "${t.response}"`)
      for (const speed of SPEEDS) {
        await generateAudio(`${prompt.id}-response`, t.response, speed.name, speed.rate)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }
  }

  console.log('\nDone!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
