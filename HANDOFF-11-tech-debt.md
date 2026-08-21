# Handoff 11 — Tech Debt Round (ID convention, analytics, verification)

**Scope:** Five items. The big one is migrating prompt IDs off the misleading language-prefix
convention to readable category-based IDs (`greet-001`), which touches ~1000 audio filenames. Plus
enabling Vercel Analytics and verifying two prior decisions actually shipped.

**Branch:** `tech-debt-round` from `main`.

**No content changes.** No prompt text, no new prompts, no audio regeneration (renames only — the audio
bytes are untouched). No ElevenLabs needed for any part of this handoff.

---

## Part 0 — Assess before changing (report first)

**0a — Compute the full old→new ID mapping.** Do NOT rename anything yet. Report:
1. The complete mapping table (old ID → new ID) for every prompt.
2. **Collision analysis:** how many old IDs would collide if the language prefix were simply
   stripped? (e.g. `es-greet-017` and `pt-greet-017` both → `greet-017`.) Report the count and a few
   examples. This confirms why renumbering — not prefix-stripping — is required.
3. Total prompt count and per-category counts under the new scheme.

**0b — Audio inventory.** Report:
- Total audio files currently in `public/audio/`.
- How many follow the unqualified form `{id}-{speed}.mp3` / `{id}-response-{speed}.mp3` vs. the
  English-target qualified form `{id}-en-US-{speed}.mp3` / `{id}-response-en-US-{speed}.mp3`.
- The full old→new **audio filename** mapping (per the normalized scheme in Part 2), and confirmation
  that no two old files map to the same new name. Flag especially the `en-*` prompts, where the
  unqualified and qualified forms could both resolve to `{newId}-en-US-{speed}.mp3`.
- Confirm every audio file maps to a prompt in the mapping (no orphans), and every drillable
  prompt/language has its expected audio (no gaps). Report any orphans or gaps found — those are
  pre-existing issues worth knowing about before a mass rename.

**0c — Verify the two prior decisions (Parts 4 and 5 below)** and report their current state.

Report all of the above, then await go-ahead before applying.

---

## Part 1 — ID convention migration

**New convention:** `{category}-{NNN}` — drop the language prefix entirely, keep the category segment,
zero-padded 3-digit sequential number. Examples: `greet-001`, `rest-012`, `cafe-016`, `panic-004`.

**Rationale (for the commit message / docs):** the `es-`/`pt-`/`en-` prefixes originally meant "target
language" but drifted to mean "origin set" once prompts became multi-target (a prompt with an `es-`
prefix may be drillable in English). The prefix carried a claim that is no longer true. The category
segment is stable and carries no false claim. **`practiceAsTarget` is, and always was, the
authoritative signal for what's drillable in which language — the ID is just a stable identifier.**

**Numbering rule — preserve existing file order.** Walk `prompts.json` top to bottom. Within each
scenario, assign sequential numbers in the order prompts currently appear. This keeps related content
contiguous and the diff comprehensible (the file is already grouped by language within each scenario,
so that grouping is preserved as number ranges).

**Category segment:** use the scenario's `id` field (e.g. scenario id `greetings` → prompts
`greet-NNN`). CC should use a short, readable stem per scenario consistent with the existing prompt
IDs (`greet`, `rest`, `groc`, `around`, `checkin`, `shop`, `tickets`, `pharm`, `cafe`, `panic`) rather
than inventing new stems. Report the scenario-id → stem mapping used.

**ID-gap policy going forward (document this):** numbers are **never reused** after a deletion. If
`greet-042` is deleted, the next new greetings prompt takes the next unused number, not 042. This is
the existing policy, now restated under the new convention.

**Apply the mapping to:**
- Every `id` field in `prompts.json`.
- Anywhere else a prompt ID is referenced (CC: search for hardcoded prompt IDs anywhere in `src/`,
  scripts, or config — report and update any found; there may be none).

---

## Part 2 — Audio file renames

**Two changes at once:** rename to the new prompt IDs, AND normalize the filename scheme so every file
carries its target language explicitly.

**Why normalize:** the current scheme is asymmetric — es/pt audio is unqualified (`{id}-{speed}.mp3`)
while English audio is qualified (`{id}-en-US-{speed}.mp3`). That asymmetry exists because Handoff 7
qualified only the *overlay* target to avoid renaming ~1000 existing files at the time. It works, but
it encodes an implicit rule ("unqualified means the prompt's original target language") that you have
to know from context — the same class of implicit-convention drift being fixed in the IDs. Since a
mass rename is happening anyway, make it explicit.

**New scheme — every file carries its language:**
- Phrase audio: `{id}-{lang}-{speed}.mp3`
- Response audio: `{id}-response-{lang}-{speed}.mp3`

where `{lang}` is the full locale code (`es-ES`, `pt-PT`, `en-US`) and `{speed}` is `slow|normal|fast`.

**Mapping (all four old forms):**
- `{oldId}-{speed}.mp3` → `{newId}-{oldTargetLang}-{speed}.mp3`
- `{oldId}-response-{speed}.mp3` → `{newId}-response-{oldTargetLang}-{speed}.mp3`
- `{oldId}-en-US-{speed}.mp3` → `{newId}-en-US-{speed}.mp3`
- `{oldId}-response-en-US-{speed}.mp3` → `{newId}-response-en-US-{speed}.mp3`

`{oldTargetLang}` is derived from the old ID's prefix (`es-*` → `es-ES`, `pt-*` → `pt-PT`, `en-*` →
`en-US`). **Note:** for an `en-*` prefixed prompt (the fresh ES→EN content from Handoff 10), its
unqualified files were already English — those map to `{newId}-en-US-{speed}.mp3`, same as the
qualified form. CC must handle this correctly and confirm no `en-*` prompt ends up with two files
competing for the same new name.

**Code change required:** the audio path resolution (`useAudio` and `scripts/generate-audio.ts`) must
be updated to the new uniform scheme. This *simplifies* the logic — the current conditional ("qualify
only if target is en-US") is replaced by always including the language segment. Confirm both the
player and the generator are updated, and that the generator will produce the new naming for any
future audio.

**CRITICAL — compute the full mapping upfront, then apply atomically.** Because old and new namespaces
overlap (e.g. `es-greet-017` → `greet-042` while some other prompt → `greet-017`), sequential in-place
renames can overwrite files. Use a safe strategy: rename via a temporary namespace (e.g. all files to
`tmp-{newId}-…` first, then strip the prefix), or compute a topologically safe order. **Verify no file
is overwritten.**

**Validation:**
- File count before === file count after. Report both.
- Every renamed file's bytes unchanged (audio is renamed, never regenerated — spot-check a few
  checksums before/after).
- After renaming, every drillable prompt/language resolves to an existing audio file (run the same
  check as Part 0b, post-rename).

Use `git mv` so renames are tracked as renames in git history.

---

## Part 3 — Migration map artifact

Write the complete old→new ID mapping to a committed file: **`ID-MIGRATION-MAP.json`** (repo root or
`docs/`). Format: a simple object or array of `{old, new}` pairs, plus a header comment/field noting
the date and the reason for the migration. This is a permanent record — useful if anything looks wrong
later, and it documents the migration the way the HANDOFF docs do.

---

## Part 4 — Vercel Analytics

Enable Vercel Web Analytics (free on the Hobby tier, 50k events/month — far above current needs).

- `npm i @vercel/analytics` (a real dependency, committed — not a transient install).
- Render the `<Analytics />` component at the app root (in `App.tsx`).
- **Import path note:** this is a Vite/React app, NOT Next.js. The Vercel dashboard's snippet defaults
  to the Next.js form. For React/Vite the import is `import { Analytics } from '@vercel/analytics/react'`
  — CC should confirm the correct current import path for a non-Next React app from the package's
  docs/types rather than copying the Next.js snippet.
- Verify it builds and the component renders without console errors.

*(Analytics must also be toggled on in the Vercel dashboard — that's a human step, not CC's.)*

---

## Part 5 — Verify two prior decisions actually shipped

**5a — `inLanguage` in JSON-LD.** A prior decision was to stop coupling static/crawler-facing surfaces
to the language list. A codebase search suggests `inLanguage` may already be gone from `index.html`'s
JSON-LD. **Confirm:** is it present or absent? If present, remove it (that was the decision — drop the
field rather than maintain a language list that's already stale). If absent, confirm and report — no
action needed.

**5b — og-image language-agnostic.** A prior decision was to remove the Spanish/Portuguese flags and
language names from the generated OG share image, making it language-agnostic (so it never dates or
needs regenerating when languages are added). **Confirm:** does `scripts/generate-assets.ts` still
render flags/language names, and does the current `public/og-image.png` show them? If they're still
there, remove them from the generator, regenerate the PNG (uses `sharp`, local — no API key), and show
the result. If already language-agnostic, confirm and report — no action needed.

---

## Part 6 — Progress data (explicit non-action)

Renaming prompt IDs invalidates any stored per-prompt progress in localStorage. **This is accepted and
intentional — do NOT write a migration for it.** Rationale: progress is localStorage-only, already lost
on cache clear / different browser / different device, there is no account system, and the product is
free with no durable progress guarantee. Do not attempt to be clever here; a migration would add
complexity for negligible benefit.

*(Note: the per-pair progress KEY format — `yesalittle:progress:{native}::{target}` — is unaffected;
it's the per-prompt records within that are keyed by prompt ID.)*

---

## Part 7 — Verification checklist

1. **Part 0 assessment reported** and approved before changes were applied.
2. **ID migration:** every prompt has a `{category}-{NNN}` ID; no collisions; count unchanged; order
   preserved (numbering follows existing file order within each scenario).
3. **No stale ID references** anywhere in `src/`, scripts, or config.
4. **Audio renames:** file count before === after; no overwrites; bytes unchanged (checksum
   spot-check); every drillable prompt/language resolves to an existing file; renames tracked as
   renames via `git mv`.
4b. **Normalized scheme applied:** EVERY audio file now carries an explicit language segment
   (`{id}-{lang}-{speed}.mp3` / `{id}-response-{lang}-{speed}.mp3`). No unqualified files remain.
   `useAudio` and `scripts/generate-audio.ts` both updated to the uniform scheme (the old
   "qualify only for en-US" conditional is gone). Confirm the generator would produce correctly-named
   files for future audio in all three languages.
5. **`ID-MIGRATION-MAP.json` committed** with the complete mapping.
6. **Analytics:** `@vercel/analytics` installed and committed, `<Analytics />` at app root, correct
   non-Next import path, build clean.
7. **5a/5b reported** with action taken or confirmation of no action needed. If og-image was
   regenerated, show it.
8. **App works end to end:** load in both UI languages, run a practice session in EN→ES, ES→EN, and
   EN→PT, confirm audio plays in each (this is the real proof the renames are correct), progress
   records write, summary and progress screens render.
9. **Build clean, tsc clean, no console errors.**

Report: the Part 0 assessment (mapping summary, collision count, audio inventory), before/after file
counts, the checksum spot-check, 5a/5b findings, and confirmation that audio plays across all three
target directions post-rename.
