# Handoff 3 — SEO & Discoverability

**Scope:** Make yesalittle discoverable and well-presented to search engines, AI crawlers/answer
engines, and link-preview unfurlers (when the URL is shared on the blog, social, messaging). This is
almost entirely additive: meta tags in `index.html`, two `public/` files, a JSON-LD block, a
generated favicon + social share image, and one small visible description section on the home screen.

**Explicitly NOT in scope:**
- Server-side rendering / static pre-rendering. yesalittle is a single-purpose utility SPA; the
  goal is a discoverable, well-described *homepage*, not indexing every phrase. Do **not** migrate to
  Next.js or add an SSR/pre-render pipeline. Make the static HTML shell rich instead (see Part C).
- `vercel.json` audio cache headers. Deliberately deferred — audio filenames are not yet
  content-hashed and audio is expected to churn (regeneration), so aggressive immutable caching would
  serve stale audio. (Parked future work: content-hash audio filenames, *then* add immutable caching.)

**Branch:** `seo-discoverability` from `main`.

**Primary domain:** `https://www.yesalittle.com` is primary (apex redirects to www, per the Vercel
setup). Use the **www** form as the canonical/absolute URL in all tags below. (If you instead confirm
the apex is primary, use that consistently — but match whatever Vercel has as primary.)

---

## Part A — Meta Tags in `index.html`

Replace the current minimal `<head>` content with a complete set. All absolute URLs use the primary
domain.

- **`<title>`**: `yesalittle — practice real Spanish & Portuguese conversations`
  (Keep under ~60 chars so it isn't truncated. NOTE: the title is intentionally framed around
  "conversations" rather than an enumerated language list so it does NOT require updating every time a
  language is added — a flagship mention of the current main languages is fine, but design it to
  degrade gracefully, e.g. eventually just "practice real conversations" once there are many
  languages. See the maintenance note in the parked section.)
- **`<meta name="description">`**: ~150–160 chars, framed around BOTH understanding and responding
  (the app trains both halves of the exchange), e.g.:
  `Practice real-world Spanish and Portuguese: understand what locals actually say in cafés, shops,
  and on the street — and learn natural ways to respond.`
- **`<meta name="viewport">`**: confirm present (`width=device-width, initial-scale=1`) — likely
  already there from Vite; keep it.
- **`<link rel="canonical" href="https://www.yesalittle.com/">`**
- **`<html lang="en">`**: confirm the root html lang is set to `en` (the UI language).
- **`<meta name="theme-color" content="...">`**: use the app's dark background color (match the
  existing theme token) so mobile browser chrome matches.

### Open Graph tags (for link previews — important for the blog/social links)
- `<meta property="og:type" content="website">`
- `<meta property="og:url" content="https://www.yesalittle.com/">`
- `<meta property="og:title" content="yesalittle — understand locals and respond naturally">`
- `<meta property="og:description" content="...">` (reuse/condense the meta description — keep the
  understand-AND-respond framing)
- `<meta property="og:image" content="https://www.yesalittle.com/og-image.png">`
- `<meta property="og:image:width" content="1200">`
- `<meta property="og:image:height" content="630">`
- `<meta property="og:site_name" content="yesalittle">`

### Twitter Card tags
- `<meta name="twitter:card" content="summary_large_image">`
- `<meta name="twitter:title" content="...">`
- `<meta name="twitter:description" content="...">`
- `<meta name="twitter:image" content="https://www.yesalittle.com/og-image.png">`

**Copy consistency:** all titles and descriptions across meta, OG, Twitter, and JSON-LD should
consistently convey that the app trains BOTH understanding what's said AND responding naturally — not
listening alone. Avoid "listening trainer" framing in the descriptive copy (the in-app section label
may keep "Listening Trainer" as a recognizable search term, but the meta/OG/description copy should
reflect the full conversation loop).

Note: these must be in the static `index.html` `<head>`, present in the HTML that ships before JS
runs — NOT injected at runtime by React — so non-JS crawlers and unfurlers see them.

---

## Part B — Structured Data (JSON-LD)

Add a `<script type="application/ld+json">` block in `index.html` describing the app, so search
engines and AI tools can categorize it accurately. Use schema.org `WebApplication`:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "yesalittle",
  "url": "https://www.yesalittle.com/",
  "description": "Practice real-world Spanish and Portuguese: understand what locals actually say, and learn natural ways to respond.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "inLanguage": ["es-ES", "pt-PT"],
  "audience": { "@type": "Audience", "audienceType": "Travelers and language learners" }
}
```

(`price: 0` is accurate today; revisit if/when monetization is added.) Keep the description text
consistent with the meta description — understand AND respond. The `inLanguage` array does need a
new entry per language added, but it's low-priority to maintain: it's a weak discovery signal and
nothing breaks if it lags behind. (See the maintenance note in the parked section.)

---

## Part C — Rich Static Shell + Visible Description

The app is a client-rendered SPA, so the shipped HTML is currently a near-empty `<div id="root">`.
Many AI crawlers and some search crawlers do not execute JavaScript, so they currently see a blank
page. Two complementary fixes:

**C1 — Noscript / static fallback content in `index.html`.**
Add meaningful human-readable text inside the HTML that ships before JS. A clean way: a `<noscript>`
block (and/or static content inside `#root` that React replaces on hydration) containing a short
real description — what yesalittle is, the languages it covers, who it's for. ~2–4 sentences of real
prose. This gives non-JS crawlers actual content to read and index. The copy must reflect BOTH halves
of what the app does — understanding what's said AND responding naturally. Example content:
"yesalittle is a free trainer for real-world Spanish and Portuguese conversations. Practice
understanding what locals actually say in everyday situations — cafés, shops, greetings, getting
around — and learn natural ways to respond. Built for travelers and language learners."

**C2 — A visible description section on the Home screen.**
Currently the home screen jumps straight into controls (language picker, etc.). Add a brief, real
intro line/section near the top (below the tagline, above or near the LANGUAGE control) — one or two
sentences describing what the app does. This doubles as: (a) crawl/AI-readable content in the rendered
DOM, and (b) better first-visit UX for someone landing cold. Keep it short and on-theme; reuse
existing typography/color tokens. Do not disrupt the existing layout's feel — this is a small
addition, not a redesign. The intro should convey BOTH halves — understanding what locals say and
responding naturally — not listening alone. The current tagline "Listen to what locals say in real
situations." captures only half; either expand it to include responding (e.g. "Understand what locals
say — and respond like one.") or add a sentence alongside it that covers the responding half.

---

## Part D — robots.txt and sitemap.xml

Both go in `public/` (served at domain root by Vite).

**`public/robots.txt`:**
```
User-agent: *
Allow: /

Sitemap: https://www.yesalittle.com/sitemap.xml
```
(Explicitly welcoming all crawlers — consistent with the goal of being discoverable. Do not
disallow AI crawlers.)

**`public/sitemap.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.yesalittle.com/</loc>
    <changefreq>monthly</changefreq>
  </url>
</urlset>
```
(Single-page app → one URL. Fine.)

---

## Part E — Favicon and Social Share Image (CC generates, human approves)

CC designs and generates these to match the app's existing visual identity (dark background, orange
accent — reuse the actual theme token color values from the codebase, do not invent new ones; lowercase
`yesalittle` wordmark style).

**Process:** CC proposes a simple mark, generates the assets, shows the human (favicon in the browser
tab + a preview of the og-image), and iterates if requested before finalizing. The human will react to
the proposed direction.

**E1 — Favicon.** Must read at very small sizes (16×16 in a browser tab), so the full wordmark will
NOT work — use a single glyph (e.g. a "y") or a simple geometric mark in the orange-on-dark palette.
Generate:
- `favicon.svg` (modern scalable favicon) in `public/`
- PNG fallbacks: `favicon-32.png`, `apple-touch-icon.png` (180×180)
- Wire them into `index.html` (`<link rel="icon" ...>`, `<link rel="apple-touch-icon" ...>`).
- Also update the PWA manifest icons (192×192, 512×512) if a manifest exists, using the same mark.

**E2 — Social share image.** `public/og-image.png`, 1200×630. This one CAN use the full wordmark —
`yesalittle` plus the tagline ("Listen to what locals say in real situations." or similar), on the
dark theme with the orange accent. Clean and text-forward is appropriate; this is a utility app, not
an illustration. Referenced by the og:image / twitter:image tags in Part A.

**Generation approach:** design as SVG (matching theme), then rasterize to PNG (e.g. via `sharp` or a
headless-browser screenshot in the build/script environment). Commit the resulting static PNG/SVG
files to `public/`. Do not rely on runtime image generation.

---

## Part F — Verification Checklist

1. **Static HTML has content:** `curl https://www.yesalittle.com/` (or view-source) shows the real
   title, meta description, OG tags, JSON-LD, and the noscript/static description text — i.e. a
   non-JS fetch sees meaningful content, not a blank shell. This is the key discoverability check.
2. **Meta tags present and correct:** title, description, canonical, OG (incl. image URL + dimensions),
   Twitter card — all in the static `<head>`.
3. **Link preview works:** validate the OG card. Use a preview/debug tool (e.g. paste the URL into a
   link-unfurl tester, or the platform debuggers) and confirm the share image, title, and description
   render. The human can also just paste the link into a message/Slack to eyeball the card.
4. **og-image loads:** `https://www.yesalittle.com/og-image.png` returns the 1200×630 image.
5. **Favicon shows:** appears in the browser tab; `favicon.svg` + PNG fallbacks resolve; apple-touch
   and manifest icons present.
6. **robots.txt + sitemap.xml resolve:** both load at their root URLs; robots references the sitemap;
   sitemap is valid XML.
7. **JSON-LD valid:** validate the structured data (e.g. schema.org / rich-results validator) — no
   errors.
8. **Visible description on Home:** the intro text renders in the app without disrupting layout/feel.
9. **Build & run clean:** app builds, deploys, no console errors, audio still plays, language switch
   still works (regression check — this handoff shouldn't touch app logic, but confirm).
10. **Favicon/og-image approved by human** before finalizing (per Part E process).

Report: the view-source / curl output showing the populated head + static content, a confirmation the
OG card previews correctly, and the favicon/og-image for human approval.

---

## Parked for later (note in PR, do not implement)
- Content-hash audio filenames, then add `vercel.json` immutable cache headers for `/audio/*`. Deferred
  until audio content stabilizes, to avoid serving stale regenerated audio.

## Maintenance note for adding a language later (document, not implement)
When a new target language is added to the app, the discoverability copy should be refreshed too —
but the surface is deliberately kept small:
- **Update:** the prose descriptions (meta description, OG/Twitter descriptions, noscript content,
  Home intro) to mention the new language — this is where language names carry real SEO value
  (people search "learn French phrases", not "multi-language app"). Updating this coincides naturally
  with announcing the new language (e.g. a blog post), so it's not pure overhead.
- **Update (low priority):** the JSON-LD `inLanguage` array — one line, weak signal, nothing breaks
  if it lags.
- **Do NOT need to update:** the `<title>` — it's intentionally framed around "conversations" rather
  than an enumerated language list, so it never requires per-language maintenance. As the list grows,
  let the title stay general rather than enumerating.
