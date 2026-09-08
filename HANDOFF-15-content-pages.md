# Handoff 15 — Static Content Page Pipeline (first page: Spain / Restaurant)

**Scope:** Build a generator that produces static, crawlable HTML content pages from authored prose +
`prompts.json` data, and use it to produce one page end to end: **Eating Out in Spain**. The pipeline
must generalize to more pages without rework, but **only build this one page in this handoff.**

**Why:** the SPA is client-rendered, so search engines see an empty shell. These pages are a separate
static surface — purpose-built for search, linking into the app. They are NOT a prerender of the
practice screen (which deliberately hides answers and would confuse a search visitor).

**Branch:** `content-pages` from `main`.

**No changes to the SPA, `prompts.json`, or audio.** This handoff only adds a generator, page content,
and build output.

---

## Part 0 — Assess and report before building

1. **How does Vercel currently route?** The SPA presumably has a catch-all rewrite serving
   `index.html` for all paths. Report the current config (`vercel.json` or Vercel project settings)
   and what would be needed so `/spain/restaurant` serves a static HTML file instead of falling
   through to the SPA. **Do not guess** — report the actual current behavior and the minimal change.
2. **Where should generated HTML land** so Vercel serves it? (`public/`, a build output dir, etc.)
   Report what fits the existing Vite build.
3. **Confirm the audio path scheme** for content pages: per Handoff 11, files are
   `{id}-{lang}-{speed}.mp3` and `{id}-response-{lang}-{speed}.mp3` under `public/audio/`. Confirm a
   static page at `/spain/restaurant` can reference them (absolute `/audio/...` paths should work).
4. **Confirm the 11 prompt IDs exist** with the expected es-ES content: rest-001, rest-003, rest-004,
   rest-018, rest-010, rest-011, rest-005, rest-006, rest-007, rest-009, rest-015.

Report findings and proposed approach, then proceed.

---

## Part 1 — Page definition format (TypeScript, not markdown)

Page content lives in a typed TS module — no markdown parser dependency, and the structure is
type-checked. Suggested shape (CC may refine):

```ts
// content/pages/spain-restaurant.ts
export const page: ContentPage = {
  slug: 'spain/restaurant',
  target: 'es-ES',
  native: 'en-US',
  scenario: 'restaurant',
  title: 'Eating Out in Spain: What Waiters Actually Say',
  metaDescription: '...',
  eyebrow: 'Spain · Restaurant',
  h1: 'Eating Out in Spain: What Waiters Actually Say',
  standfirst: '...',
  lead: [ 'paragraph one...', 'paragraph two...' ],
  headsUp: { title: 'Three things that catch people out', items: [ '...', '...', '...' ] },
  sections: [
    { heading: 'Getting seated', note: '...', prompts: ['rest-001','rest-003','rest-004','rest-018'] },
    { heading: 'Ordering', note: '...', prompts: ['rest-010','rest-011','rest-005','rest-006','rest-007'] },
    { heading: 'Finishing and paying', note: '...', prompts: ['rest-009','rest-015'] },
  ],
  // Inline notes attached to specific exchanges, keyed by prompt id
  notes: {
    'rest-004': 'Worth knowing before you answer — the terrace often costs more. That\'s the next exchange.',
    'rest-010': 'The <em>menú del día</em> is a fixed-price weekday lunch...',
    'rest-006': 'Ask for <em>agua del grifo</em> and it\'s free...',
    'rest-009': 'This is usually your best opening to ask for the bill...',
  },
  midHook: { after: 'Getting seated', text: '...', linkText: 'Hear them at full speed →' },
  cta: { heading: 'Now try it without reading', body: '...', buttonText: 'Practice restaurant Spanish →' },
  related: [ { href: '/spain/cafe', text: '...' }, ... ],
}
```

**Key design point — the page selects its prompts.** Prompt inclusion, ordering, and grouping are
defined here, NOT by a flag in `prompts.json`. Adding a `showOnPage` flag to prompt data would mix a
presentation concern into content data and wouldn't extend to multiple pages per scenario. **Do not
add any field to `prompts.json`.**

Define a `ContentPage` type so page files are type-checked.

---

## Part 2 — The generator

`scripts/build-content-pages.ts`:

1. Reads page definition modules.
2. Reads `prompts.json`, resolves each referenced prompt for the page's `target`/`native` —
   pulling target phrase, native phrase, target response, native response, and context (via the same
   native-resolution logic the app uses).
3. Emits static HTML per page to the output location determined in Part 0.

**Validation — fail the build on:**
- A referenced prompt ID that doesn't exist
- A referenced prompt not drillable in the page's target (`practiceAsTarget !== true`)
- A referenced prompt whose expected audio files are missing
- A note keyed to a prompt ID not in the page's sections

**Warn (don't fail) on:** prompts in the scenario that no page references — useful signal, not an error.

Wire it into the build so pages regenerate on deploy. Report how.

---

## Part 3 — Page markup and SEO

Use the approved mockup (provided separately as `restaurant-spain-v2.html`) as the target output.
Match its structure and styling. Notes on the markup:

- **`<html lang="en" translate="no">`** — same translate-protection as the app.
- **Semantic HTML**: real `<h1>`, `<h2>`, `<article>`/`<section>` where sensible. Crawlers read this.
- **All content in the initial HTML.** No client-side rendering of phrases, translations, or notes.
  This is the entire point — verify with `curl` that the phrases appear in the raw response.
- **Per-page `<title>` and `<meta name="description">`** from the page definition.
- **Open Graph tags** for the page (title, description, url, the existing og-image).
- **Canonical URL** for the page.
- **JSON-LD**: mark up as an `Article` (or `HowTo` if it fits cleanly — CC's judgment, report which and
  why). Do NOT include `inLanguage` enumeration (per the established decision on not coupling static
  surfaces to the language list).
- **Styling: independent CSS**, inlined in a `<style>` block or a single shared stylesheet for content
  pages. Do NOT couple to the SPA's inline-style approach. Pull brand values (`#E85D3A`, background,
  fonts) from a shared constants module if one is cheap to add — otherwise define them once in the
  content-page CSS with a comment noting they mirror the app.

---

## Part 4 — Audio (shared player)

One `<audio>` element per page. Each play button carries its file path in a `data-src` attribute; a
small inline script sets `src` and plays on click.

- **Use normal speed only** on content pages (`...-normal.mp3`). Slow/fast are a reason to enter the app.
- Playing a second phrase interrupts the first — one `<audio>` element gives this for free.
- Indicate playing state on the active button (simple class toggle).
- **Graceful degradation:** all text content must be present and readable without JS. Only audio
  requires it.
- Script should be tiny and inlined — no bundler, no dependency.

---

## Part 5 — Links into the app

The mid-page hook and the closing CTA both link into the SPA with the scenario and target preselected:
`/?scenario=restaurant&target=es-ES`.

**The SPA does not currently read query params.** For this handoff, emit the links as specified but do
NOT modify the SPA — a visitor landing on `/` with unrecognized params gets the normal home screen,
which is an acceptable fallback. Wiring the SPA to honor these params is future work; note it in the PR.

---

## Part 6 — Sitemap

Add the generated content pages to `sitemap.xml`. The existing sitemap lists only the homepage; it
should now also list `/spain/restaurant`. Generate the sitemap as part of the build so future pages are
included automatically rather than hand-maintained.

---

## Part 7 — Verification

1. **Part 0 findings reported** and routing approach confirmed before building.
2. **`curl https://<preview>/spain/restaurant`** returns HTML containing the actual Spanish phrases,
   English translations, context lines, and notes — all in the raw response, no JS required. **This is
   THE critical check; paste the relevant portion of the output.**
3. **Page renders correctly** in a browser and matches the approved mockup's structure.
4. **Audio works:** clicking a play button plays the correct normal-speed file; clicking another
   interrupts the first.
5. **Text readable with JS disabled** — only audio degrades.
6. **Validation works:** temporarily reference a nonexistent prompt ID and confirm the build fails with
   a clear error, then revert.
7. **SEO tags present:** title, meta description, OG tags, canonical, JSON-LD. Validate the JSON-LD.
8. **Sitemap** includes the new page and is valid XML.
9. **The SPA is unchanged** — practice sessions in all three directions still work, no regression.
10. **Build clean, no console errors** on the content page.

Report: Part 0 findings, the curl output proving content is in the raw HTML, a screenshot of the
rendered page, the JSON-LD type chosen and why, and confirmation the SPA is untouched.
