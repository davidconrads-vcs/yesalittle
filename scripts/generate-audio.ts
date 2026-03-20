import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

interface Prompt {
  id: string
  spanish: string
}

interface Scenario {
  prompts: Prompt[]
}

interface PromptsData {
  scenarios: Scenario[]
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
if (!ELEVENLABS_API_KEY) {
  console.error('Error: ELEVENLABS_API_KEY environment variable is not set.')
  process.exit(1)
}

// A natural Peninsular Spanish female voice from ElevenLabs
// "Valentina" or use a suitable es-ES voice ID
// You can list voices at: https://api.elevenlabs.io/v1/voices
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'cgSgspJ2msm6clMCkdW9' // "Valentina" es-ES

const SPEEDS: Array<{ name: string; rate: number }> = [
  { name: 'slow', rate: 0.7 },
  { name: 'normal', rate: 0.85 },
  { name: 'fast', rate: 1.0 },
]

const audioDir = join(ROOT, 'public', 'audio')
if (!existsSync(audioDir)) {
  mkdirSync(audioDir, { recursive: true })
}

const data: PromptsData = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'prompts.json'), 'utf-8'))
const allPrompts = data.scenarios.flatMap(s => s.prompts)

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
  console.log(`Generating audio for ${allPrompts.length} prompts × ${SPEEDS.length} speeds...`)
  console.log(`Output directory: ${audioDir}\n`)

  for (const prompt of allPrompts) {
    console.log(`[${prompt.id}] "${prompt.spanish}"`)
    for (const speed of SPEEDS) {
      await generateAudio(prompt.id, prompt.spanish, speed.name, speed.rate)
      // Rate limit: small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  console.log('\nDone!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
