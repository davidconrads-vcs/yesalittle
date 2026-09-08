// Generates the static, crawlable content pages from authored page modules +
// prompts.json. Runs after `vite build`; writes straight into dist/ so nothing
// generated is ever committed. Every phrase, translation, context line and note
// is in the emitted HTML — no client-side rendering (that's the whole point).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { UnifiedScenario, UnifiedPrompt } from '../src/types'
import { resolveByNativeLang } from '../src/utils'
import { ContentPage, ContentSection } from '../content/types'
import { pages } from '../content/pages/index'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'dist')
const AUDIO_DIR = join(ROOT, 'public', 'audio')

// Mirrors the canonical host used by index.html and robots.txt.
const SITE = 'https://www.yesalittle.com'
const OG_IMAGE = `${SITE}/og-image.png`

// Content pages use normal speed only — slow and fast are a reason to open the app.
const SPEED = 'normal'

const errors: string[] = []
const warnings: string[] = []

// ── helpers ───────────────────────────────────────────────────────────────────

/** Escapes prompt-derived text. Authored prose fields are trusted HTML and skip this. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function ldJson(value: unknown): string {
  // `<` is escaped so a stray "</script>" in content can't close the block early.
  return JSON.stringify(value, null, 2).replace(/</g, '\\u003c')
}

function monthYear(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// ── data ──────────────────────────────────────────────────────────────────────

interface PromptsData { scenarios: UnifiedScenario[] }

const data: PromptsData = JSON.parse(readFileSync(join(ROOT, 'src/data/prompts.json'), 'utf8'))
const css = readFileSync(join(ROOT, 'content/page.css'), 'utf8')

interface Exchange {
  id: string
  context: string
  phrase: string
  nativePhrase: string
  response: string
  nativeResponse: string
  phraseAudio: string
  responseAudio: string
  note?: string
}

/**
 * Resolves one referenced prompt into everything the page needs, recording a
 * failure for anything the page can't honestly render.
 */
function resolve(page: ContentPage, scenario: UnifiedScenario | undefined, id: string): Exchange | null {
  const p: UnifiedPrompt | undefined = scenario?.prompts.find(x => x.id === id)
  if (!p) {
    errors.push(`${page.slug}: prompt "${id}" not found in scenario "${page.scenario}"`)
    return null
  }

  const t = p.translations[page.target]
  if (!t || t.practiceAsTarget !== true) {
    errors.push(`${page.slug}: prompt "${id}" is not drillable in ${page.target} (practiceAsTarget !== true)`)
    return null
  }
  const n = p.translations[page.native]
  if (!t.phrase || !n?.phrase) {
    errors.push(`${page.slug}: prompt "${id}" has no phrase in ${!t.phrase ? page.target : page.native} — content pages need both sides of the exchange`)
    return null
  }
  if (!n.response) {
    errors.push(`${page.slug}: prompt "${id}" has no ${page.native} response`)
    return null
  }

  const context = resolveByNativeLang(p.context, page.native)
  if (!context) {
    errors.push(`${page.slug}: prompt "${id}" has no context line`)
    return null
  }

  const phraseAudio = `${id}-${page.target}-${SPEED}.mp3`
  const responseAudio = `${id}-response-${page.target}-${SPEED}.mp3`
  for (const file of [phraseAudio, responseAudio]) {
    if (!existsSync(join(AUDIO_DIR, file))) {
      errors.push(`${page.slug}: prompt "${id}" is missing audio public/audio/${file}`)
    }
  }

  return {
    id,
    context,
    phrase: t.phrase,
    nativePhrase: n.phrase,
    response: t.response,
    nativeResponse: n.response,
    phraseAudio: `/audio/${phraseAudio}`,
    responseAudio: `/audio/${responseAudio}`,
    note: page.notes?.[id],
  }
}

// ── markup ────────────────────────────────────────────────────────────────────

function playButton(src: string, label: string, withText: boolean): string {
  return (
    `<button type="button" class="audio" data-src="${esc(src)}" aria-label="Play: ${esc(label)}">` +
    `<span aria-hidden="true">▶</span>${withText ? ' Listen' : ''}</button>`
  )
}

function renderExchange(x: Exchange, target: string): string {
  // Target-language text only. Chrome translating "¿Para cuántos?" into English would
  // destroy the one thing the reader came for.
  const lang = ` lang="${esc(target)}" translate="no" class="notranslate"`
  return `  <article class="x">
    <div class="ctx">${esc(x.context)}</div>
    <p class="they"><span${lang}>${esc(x.phrase)}</span> ${playButton(x.phraseAudio, x.phrase, true)}</p>
    <p class="they-en">${esc(x.nativePhrase)}</p>
    <div class="reply">
      <div class="reply-label">You could say</div>
      <p class="reply-es"><span${lang}>${esc(x.response)}</span> ${playButton(x.responseAudio, x.response, false)}</p>
      <p class="reply-en">${esc(x.nativeResponse)}</p>
    </div>${x.note ? `\n    <div class="note">ℹ️ ${x.note}</div>` : ''}
  </article>`
}

function renderSection(page: ContentPage, section: ContentSection, exchanges: Exchange[]): string {
  const parts = [`  <h2>${esc(section.heading)}</h2>`]
  if (section.note) parts.push(`  <p class="sectnote">${section.note}</p>`)
  for (const x of exchanges) parts.push(renderExchange(x, page.target))

  if (page.midHook?.after === section.heading) {
    parts.push(`  <div class="hook">
    <p>${page.midHook.text}</p>
    <a href="${esc(page.midHook.href)}">${esc(page.midHook.linkText)}</a>
  </div>`)
  }
  return parts.join('\n')
}

function renderPage(page: ContentPage, allSlugs: Set<string>): string {
  const scenario = data.scenarios.find(s => s.id === page.scenario)
  if (!scenario) errors.push(`${page.slug}: scenario "${page.scenario}" not found in prompts.json`)

  const referenced = new Set(page.sections.flatMap(s => s.prompts))

  // Notes must attach to an exchange the page actually shows, or they're invisible.
  for (const id of Object.keys(page.notes ?? {})) {
    if (!referenced.has(id)) {
      errors.push(`${page.slug}: note keyed to "${id}", which no section references`)
    }
  }
  if (page.midHook && !page.sections.some(s => s.heading === page.midHook!.after)) {
    errors.push(`${page.slug}: midHook.after "${page.midHook.after}" matches no section heading`)
  }

  // Not an error — a prompt the scenario has and no page uses is a content signal.
  for (const p of scenario?.prompts ?? []) {
    if (p.translations[page.target]?.practiceAsTarget === true && !referenced.has(p.id)) {
      warnings.push(`${page.slug}: scenario prompt "${p.id}" is drillable in ${page.target} but unused`)
    }
  }

  const sections = page.sections.map(s => {
    const exchanges = s.prompts.map(id => resolve(page, scenario, id)).filter((x): x is Exchange => x !== null)
    return renderSection(page, s, exchanges)
  })

  const url = `${SITE}/${page.slug}`
  const count = referenced.size

  const jsonLd = ldJson({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1,
    description: page.metaDescription,
    datePublished: page.published,
    dateModified: page.updated,
    image: OG_IMAGE,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'yesalittle', url: `${SITE}/` },
    publisher: { '@type': 'Organization', name: 'yesalittle', url: `${SITE}/` },
  })

  // Related links to pages that don't exist yet would ship as 404s, so they're
  // dropped until those pages are built. Adding the page makes its links appear.
  const relatedLinks = (page.related?.links ?? []).filter(l => {
    const internal = l.href.replace(/^\//, '')
    if (!l.href.startsWith('/') || allSlugs.has(internal)) return true
    warnings.push(`${page.slug}: related link "${l.href}" has no built page — dropped`)
    return false
  })

  return `<!DOCTYPE html>
<!-- Unlike the app, these pages are found by strangers, not all of whom read English.
     Browser translation of the prose is a feature here, so protection is SELECTIVE:
     only the target-language spans carry translate="no" (see \`lang\` below). -->
<html lang="${esc(page.native.split('-')[0])}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0D0D0F">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.metaDescription)}">
<link rel="canonical" href="${esc(url)}">

<meta property="og:type" content="article">
<meta property="og:url" content="${esc(url)}">
<meta property="og:site_name" content="yesalittle">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.metaDescription)}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.metaDescription)}">
<meta name="twitter:image" content="${OG_IMAGE}">

<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<script type="application/ld+json">
${jsonLd}
</script>

<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap" rel="stylesheet">
<style>
${css.trim()}
</style>
<script>document.documentElement.className += ' js'</script>
</head>
<body>
<main class="wrap">

  <p class="eyebrow">${esc(page.eyebrow)}</p>
  <h1>${esc(page.h1)}</h1>
  <p class="standfirst">${page.standfirst}</p>
  <p class="byline">Updated <time datetime="${esc(page.updated)}">${monthYear(page.updated)}</time> · ${count} exchange${count === 1 ? '' : 's'} with audio</p>

  <div class="lead">
${page.lead.map(p => `    <p>${p}</p>`).join('\n')}
  </div>
${page.headsUp ? `
  <aside class="heads-up">
    <strong class="hdr">${esc(page.headsUp.title)}</strong>
    <ul>
${page.headsUp.items.map(i => `      <li>${i}</li>`).join('\n')}
    </ul>
  </aside>
` : ''}
${sections.join('\n\n')}

  <aside class="cta">
    <h3>${esc(page.cta.heading)}</h3>
    <p>${page.cta.body}</p>
    <a class="btn" href="${esc(page.cta.href)}">${esc(page.cta.buttonText)}</a>
  </aside>
${relatedLinks.length ? `
  <nav class="related">
    <h4>${esc(page.related!.title)}</h4>
${relatedLinks.map(l => `    <a href="${esc(l.href)}">${esc(l.text)}</a>`).join('\n')}
  </nav>
` : ''}
</main>

<script>
(function () {
  var audio = new Audio()
  var current = null

  function clear() {
    if (current) current.classList.remove('playing')
    current = null
  }

  audio.addEventListener('ended', clear)
  audio.addEventListener('error', clear)

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.audio') : null
    if (!btn) return
    var wasCurrent = btn === current
    // One <audio> element, so starting a phrase interrupts whatever was playing.
    audio.pause()
    clear()
    if (wasCurrent) return
    audio.src = btn.getAttribute('data-src')
    btn.classList.add('playing')
    current = btn
    audio.play().catch(clear)
  })
})()
</script>
</body>
</html>
`
}

// ── build ─────────────────────────────────────────────────────────────────────

const slugs = new Set(pages.map(p => p.slug))
const duplicates = pages.map(p => p.slug).filter((s, i, a) => a.indexOf(s) !== i)
if (duplicates.length) errors.push(`duplicate page slugs: ${duplicates.join(', ')}`)

const rendered = pages.map(page => ({ page, html: renderPage(page, slugs) }))

for (const w of warnings) console.warn(`  warn  ${w}`)

if (errors.length) {
  console.error(`\nContent page build failed — ${errors.length} error${errors.length === 1 ? '' : 's'}:`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  process.exit(1)
}

for (const { page, html } of rendered) {
  const dir = join(OUT, page.slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html)
  console.log(`  ✓ dist/${page.slug}/index.html`)
}

// Sitemap is generated, not hand-maintained, so new pages list themselves.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}/</loc>
    <changefreq>monthly</changefreq>
  </url>
${pages.map(p => `  <url>
    <loc>${SITE}/${p.slug}</loc>
    <lastmod>${p.updated}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`).join('\n')}
</urlset>
`
mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'sitemap.xml'), sitemap)
console.log(`  ✓ dist/sitemap.xml (${pages.length + 1} urls)`)
