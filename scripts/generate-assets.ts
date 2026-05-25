import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC = join(ROOT, 'public')

// Brand tokens — keep in sync with the app theme
const BG      = '#0D0D0F'
const ACCENT  = '#E85D3A'

// ── Favicon SVG ───────────────────────────────────────────────────────────────
// Lowercase "y" in orange on dark rounded square. Relies on monospace system
// font for consistent geometry at all sizes.

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="${BG}"/>
  <text x="16" y="24"
    font-family="'Courier New', 'Lucida Console', monospace"
    font-size="22"
    font-weight="700"
    fill="${ACCENT}"
    text-anchor="middle"
    dominant-baseline="auto"
  >y</text>
</svg>`

writeFileSync(join(PUBLIC, 'favicon.svg'), FAVICON_SVG)
console.log('Written favicon.svg')

const faviconBuf = Buffer.from(FAVICON_SVG)
await sharp(faviconBuf).resize(32, 32).png().toFile(join(PUBLIC, 'favicon-32.png'))
console.log('Written favicon-32.png')

await sharp(faviconBuf).resize(180, 180).png().toFile(join(PUBLIC, 'apple-touch-icon.png'))
console.log('Written apple-touch-icon.png')

// ── og-image (with emoji flags — fall back to text-only if they don't render) ─

function ogImageSvg(flags: boolean): string {
  const langLine = flags
    ? '🇪🇸 Spanish · 🇵🇹 Portuguese'
    : 'Spanish · Portuguese'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="wordmark-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.65"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="${BG}"/>

  <!-- Top orange accent bar -->
  <rect width="1200" height="6" fill="${ACCENT}"/>

  <!-- "LISTENING TRAINER" chip label -->
  <text x="600" y="218"
    font-family="'Courier New', 'Lucida Console', monospace"
    font-size="15"
    font-weight="600"
    fill="${ACCENT}"
    letter-spacing="3"
    text-anchor="middle"
  >LISTENING TRAINER</text>

  <!-- "yesalittle" wordmark -->
  <text x="600" y="315"
    font-family="'Helvetica Neue', 'Arial', sans-serif"
    font-size="96"
    font-weight="700"
    fill="url(#wordmark-grad)"
    text-anchor="middle"
  >yesalittle</text>

  <!-- Tagline -->
  <text x="600" y="383"
    font-family="'Helvetica Neue', 'Arial', sans-serif"
    font-size="26"
    font-weight="400"
    fill="rgba(255,255,255,0.55)"
    text-anchor="middle"
  >Understand what locals say — and respond like one.</text>

  <!-- Language line -->
  <text x="600" y="488"
    font-family="${flags ? 'Apple Color Emoji, ' : ''}'Helvetica Neue', 'Arial', sans-serif"
    font-size="19"
    font-weight="400"
    fill="rgba(255,255,255,0.3)"
    text-anchor="middle"
  >${langLine}</text>
</svg>`
}

// First pass: try with emoji flags
const svgWithEmoji = ogImageSvg(true)
const emojiPngBuf = await sharp(Buffer.from(svgWithEmoji))
  .resize(1200, 630)
  .png()
  .toBuffer()

// Probe pixel variance in the language-line area to detect emoji rendering.
// If flags rendered as color emoji the region will have high channel variance;
// glyph fallbacks ("ES", "PT" letters) are near-monochrome.
const { data: pixels } = await sharp(emojiPngBuf)
  .extract({ left: 450, top: 460, width: 300, height: 40 })
  .raw()
  .toBuffer({ resolveWithObject: true })

const rVals: number[] = []
const gVals: number[] = []
const bVals: number[] = []
for (let i = 0; i < pixels.length; i += 4) {
  rVals.push(pixels[i])
  gVals.push(pixels[i + 1])
  bVals.push(pixels[i + 2])
}
const spread = (arr: number[]) => Math.max(...arr) - Math.min(...arr)
const rSpread = spread(rVals)
const gSpread = spread(gVals)
const bSpread = spread(bVals)
const emojiRendered = rSpread > 60 && gSpread > 60 && bSpread > 60

console.log(`Emoji flag probe — R spread: ${rSpread}, G spread: ${gSpread}, B spread: ${bSpread}`)
console.log(`Emoji rendered as color: ${emojiRendered}`)

if (emojiRendered) {
  writeFileSync(join(PUBLIC, 'og-image.png'), emojiPngBuf)
  console.log('Written og-image.png (with emoji flags)')
} else {
  const svgNoEmoji = ogImageSvg(false)
  await sharp(Buffer.from(svgNoEmoji)).resize(1200, 630).png().toFile(join(PUBLIC, 'og-image.png'))
  console.log('Written og-image.png (text-only fallback — emoji did not render)')
}

console.log('Done!')
