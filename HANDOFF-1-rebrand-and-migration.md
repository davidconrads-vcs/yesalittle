# Handoff 1 — Rebrand to "yesalittle" + Data Migration to Unified Schema

**Scope:** This handoff covers (1) renaming the project to `yesalittle` and (2) migrating the
two existing per-language prompt files into a single unified `prompts.json` with a new schema.
It does **not** cover the language-picker UI, per-pair progress, or gloss rendering — those come
in Handoff 2. Build and verify this handoff completely before starting the next.

**Guiding principle:** This is a *transformation*, not a rewrite. No prompt content, translation,
context note, tag, or difficulty value may be lost. Every field in the old data must land somewhere
in the new structure. When in doubt, preserve.

---

## Part A — Rebrand to `yesalittle`

The app was previously called something like `spanish-trainer`. Rename it to `yesalittle`
throughout. The name plays on "yes, a little" — the universal answer to "do you speak [language]?"

Tasks:

1. **`package.json`** — change `name` to `yesalittle`. Update any `description` field to reflect a
   multi-language listening trainer (not Spanish-specific).
2. **In-app branding** — update the visible app title/header, the HTML `<title>` tag, and any
   on-screen text that says "Spanish Trainer" or similar to "yesalittle" (lowercase is the brand
   styling; in running prose marketing copy it can be "Yes A Little", but the logotype/title is
   lowercase `yesalittle`).
3. **PWA manifest** (if present, e.g. `manifest.json` or `manifest.webmanifest`) — update `name`,
   `short_name`, and any description fields.
4. **README** — update the project name and any Spanish-specific framing to reflect that this is
   now a multi-language (Spanish + Portuguese to start) listening trainer.
5. **Hardcoded strings / identifiers** — search the codebase for "spanish-trainer", "spanishtrainer",
   "Spanish Trainer", "spanish_trainer" (and case variants) and update them. Be careful: do **not**
   blanket-replace the substring "spanish" everywhere, since legitimate references to the Spanish
   *language* (e.g. a label "Spanish" in a language list, or the `es` language code) must remain.
   Only rename the *product/project* identity, not references to the languages themselves.
6. **Do not** rename the git repository as part of this task (the human will do that separately on
   GitHub). Just handle in-code references.

After the rebrand, the app should still build and run exactly as before — same functionality, new name.

---

## Part B — The Unified Schema

### Language code convention (READ FIRST)

This project uses **BCP 47 locale codes** as `translations` keys and as the audio `--lang` argument,
**not** bare language codes. This is deliberate: it lets us add regional variants later (e.g.
Brazilian Portuguese, Latin American Spanish) as purely additive changes, with no renaming of
existing data. The codes for v1:

- `es-ES` — European / Peninsular Spanish (the existing Spanish content is Barcelona-flavored, i.e. Peninsular)
- `pt-PT` — European Portuguese (the existing Portuguese content is Portugal-flavored)
- `en-US` — English (the native anchor for v1). Uses a region code for symmetry with the other locale
  codes, so all language codes follow the same `language-REGION` shape. This also leaves room for
  `en-GB` or other English variants later with no special-casing.

All three codes follow the same shape; treat them uniformly.

Future additions would be `pt-BR`, `es-419` (generic Latin American Spanish), `es-MX`, etc. — these
are **not** in scope for v1, but the schema and code must not assume codes are always 2 letters.
Treat language codes as opaque strings, never parse or truncate them.

**Important distinction — language codes vs. ID prefixes.** The `translations` keys and audio paths
use full locale codes (`es-ES`, `pt-PT`). But prompt **`id` prefixes** stay short and readable
(`es-`, `pt-`) — an id is just a unique, legible identifier denoting origin, and `es-ES-rest-001`
would be needlessly ugly and hyphen-confusing. So: id `es-rest-001` has a `translations` entry keyed
`es-ES`. These are intentionally different; do not try to make the id prefix match the full locale code.

### Overview

Today there are two prompt files (Spanish and Portuguese) with a flat, English-coupled structure.
We are merging them into **one** `prompts.json` with a structure where each prompt carries its
content in one or more languages inside a `translations` object. Whether a given language entry
acts as the *target* (the language being drilled, spoken aloud) or as the *native anchor* (the
learner's own language, shown for reference) is determined at runtime by the learner's selected
language pair — **not** by anything stored on the prompt. The same `en-US` entry is the native anchor
for an EN→ES learner and would be the target for a future ES→EN learner.

### Final structure

Top level is unchanged in spirit: a `scenarios` array, each scenario containing `prompts`.

**Scenario (category) object:**
```json
{
  "id": "restaurant",
  "category": "Restaurant",
  "icon": "🍽️",
  "color": "#E85D3A",
  "prompts": [ ... ]
}
```
- `id`, `category`, `icon`, `color` are all preserved exactly as in the current files.
- Scenarios are unified by `id`: if both source files define a scenario with the same `id`
  (e.g. `greetings`, `restaurant`), the merged file must contain **one** scenario object for that
  `id`, taking the metadata (`category`/`icon`/`color`) once, with **all** prompts from both sources
  pooled into its single `prompts` array.

**Prompt object:**
```json
{
  "id": "es-rest-001",
  "tags": ["greeting", "arrival"],
  "difficulty": 1,
  "context": {
    "en-US": "Hostess greeting you at the door"
  },
  "translations": {
    "es-ES": {
      "phrase": "¡Hola! ¿Para cuántos?",
      "response": "Para cuatro, por favor.",
      "practiceAsTarget": true
    },
    "en-US": {
      "phrase": "Hi! For how many?",
      "response": "For four, please."
    }
  }
}
```

Field-by-field:

- **`id`** — string, globally unique, normalized to be **target-language-prefixed**: `es-...` for
  Spanish-origin prompts, `pt-...` for Portuguese-origin prompts. See the ID normalization rules in
  Part C.
- **`tags`** — array of strings. Preserve exactly from the source.
- **`difficulty`** — integer 1–3. Preserve exactly from the source.
- **`context`** — an **object keyed by native-language code**, not a flat string. At migration time
  the existing flat English `context` string becomes `{ "en-US": "<that string>" }`. Rendering (Handoff
  2) will resolve `context[nativeLang]` with fallback to `context["en-US"]`. For now the migration only
  produces an `en-US` key.
- **`translations`** — an object keyed by language code. Each entry contains:
  - **`phrase`** — the utterance the learner hears/reads in this language (when this language is the
    target, this is what gets spoken aloud / has audio).
  - **`response`** — the suggested reply in this language.
  - **`gloss`** *(optional)* — an object keyed by native-language code, giving a native-language
    explanation of a non-literal or culturally-specific phrase. Omit entirely when not needed (most
    prompts won't have it). The migration does **not** create glosses; this field is defined in the
    schema and populated later. Include the field definition/handling in code but expect it absent in
    the migrated data.
  - **`practiceAsTarget`** *(optional, defaults to `true`)* — boolean. `false` means "do not offer
    this language as a drill target for this prompt" (used later to suppress a phrase from being
    drilled in a language where it doesn't make sense). A missing flag must be treated as `true`.
    The migration sets `practiceAsTarget: true` explicitly on the origin-language entry of each
    migrated prompt; it may omit it on the `en-US` native-anchor entry (since `en-US` is not a v1 target).

### Role-by-pair model (important for implementers)

A `translations[lang]` entry is just "this prompt expressed in `lang`." Its role is decided by the
learner's selected pair:
- When `lang` == the learner's **target**, the entry's `phrase`/`response` are the drilled content
  and (for the target) the `phrase` is what has generated audio.
- When `lang` == the learner's **native**, the entry's `phrase`/`response` are shown as the native
  anchor/reference.

Do **not** introduce separate fields for "target text" vs "native text" — it is the same data viewed
through the lens of the selected pair. This keeps a single source of truth per language.

### Availability rule

A prompt is **drillable for target language T** if and only if `translations[T]` exists **and**
`translations[T].practiceAsTarget !== false`. This single rule governs everything: which prompts a
learner sees, and which prompts a given language's audio script generates audio for.

---

## Part C — ID Normalization

The current Spanish file uses bare IDs (`rest-001`, `greet-001`, `panic-003`). The current Portuguese
file uses `pt-`-prefixed IDs (`pt-rest-001`, `pt-greet-001`). To guarantee global uniqueness in the
merged file and make a prompt's origin legible:

- **Spanish-origin prompts:** prefix the bare ID with `es-`. So `rest-001` → `es-rest-001`,
  `greet-001` → `es-greet-001`, `panic-003` → `es-panic-003`, etc.
- **Portuguese-origin prompts:** already `pt-`-prefixed; leave as-is (`pt-rest-001` stays
  `pt-rest-001`). If any Portuguese prompt is found *without* the `pt-` prefix, add it.
- The prefix denotes the **origin/primary target language** of the prompt: id-prefix `es-` maps to
  the locale code `es-ES`, id-prefix `pt-` maps to `pt-PT`. (Short prefix on the id; full locale code
  in `translations` and audio paths.) A prompt keeps this ID permanently even if it later gains
  additional language entries.

**Audio file paths must be updated to match the new IDs.** This is critical — renaming IDs without
updating audio references will break playback.

1. Inspect how audio files are currently named and referenced (look in `scripts/generate-audio.ts`
   and wherever the app resolves audio URLs). Determine the current naming convention
   (likely something like `<id>-<speed>.mp3`, possibly under a per-language directory).
2. Rename the existing **Spanish** audio asset files on disk to match the new `es-`-prefixed IDs,
   preserving whatever speed-tier / type suffix convention currently exists. Portuguese files already
   match their `pt-` IDs and should not need renaming (verify this).
3. Update any code that constructs or references audio paths so it derives from the new IDs.
4. If the audio path convention includes a language directory, the directory name should be the
   **full locale code** (`audio/es-ES/...`, `audio/pt-PT/...`) — see Part E. If directories currently
   use bare `es`/`pt`, rename them to the locale form as part of this work and update path resolution.

If the exact current audio-naming convention is ambiguous after inspecting the repo, **stop and
report what you found** rather than guessing — a wrong rename will silently break audio.

---

## Part D — The Migration

Write a migration script (e.g. `scripts/migrate-prompts.ts`, runnable once) that:

1. Reads the existing Spanish prompts file and the existing Portuguese prompts file.
2. For every prompt in each source, transforms the flat structure into the new prompt object:
   - map carefully:
     - source `phrase` → `translations.<originLocale>.phrase`
     - source `yourResponse` → `translations.<originLocale>.response`
     - source `english` → `translations["en-US"].phrase`
     - source `yourResponseEnglish` → `translations["en-US"].response`
   - where `<originLocale>` is **`es-ES`** for Spanish-source prompts, **`pt-PT`** for
     Portuguese-source prompts. (Note: the `translations` key is the full locale code, while the
     prompt `id` prefix stays short — `es-`/`pt-` — per Part B and Part C.)
   - source `context` (flat English string) → `context["en-US"]` (wrap into object).
   - `tags` → copy unchanged.
   - `difficulty` → copy unchanged.
   - set `translations.<originLocale>.practiceAsTarget = true`.
   - normalize `id` per Part C.
3. Drops the now-relocated flat fields (`phrase`, `english`, `yourResponse`, `yourResponseEnglish` as
   top-level keys) — their data now lives inside `translations`. No data is lost; it is moved.
4. Merges scenarios by `id` (one scenario object per id, metadata taken once, prompts pooled).
5. Writes a single unified `prompts.json`.
6. Renames Spanish audio files to match normalized IDs (Part C) — or, if you prefer to keep the
   migration script data-only, perform the audio rename as a clearly separated step and document it.

The two original source files should be retained (not deleted) until the human has verified the
migration, but the app and audio script should switch to reading the new unified `prompts.json`.

### Edge cases to handle explicitly

- **`yourResponse` placeholder values:** some prompts have non-translatable response placeholders
  like `"— (just enter PIN) —"` (see `groc-014`) or bracketed tokens like `"¿Qué quiere decir
  [palabra]?"`. Migrate these verbatim — do not "fix" or interpret them.
- **Scenarios present in only one source:** the Spanish file has scenarios the Portuguese file lacks
  (`panic`, `shopping`, `tickets`, `pharmacy`, `cafe`, `around`, `checkin`). These migrate normally;
  they simply contain only `es-ES`-target prompts for now. Do not drop them and do not fabricate
  Portuguese prompts for them.
- **Trailing whitespace / formatting quirks** in the source JSON (there are a few trailing spaces on
  some lines) — irrelevant once parsed; the output should be clean, consistently-formatted JSON.

---

## Part E — Audio Script Update

`scripts/generate-audio.ts` is invoked by the existing wrappers `generate-es.sh` and `generate-pt.sh`.
Currently they pass `--lang=es` / `--lang=pt`. **Update the `--lang` value to the full locale code**
so the script's selection matches the new `translations` keys:

- `generate-es.sh` → `npx tsx scripts/generate-audio.ts --lang=es-ES --type=all`
- `generate-pt.sh` → `npx tsx scripts/generate-audio.ts --lang=pt-PT --type=all`

Keep the wrapper **filenames** the same (`generate-es.sh`, `generate-pt.sh`) for convenience — only
the locale value they pass changes. Keep the `--type` flag and its behavior unchanged. When regional
variants are added later, you'd add wrappers like `generate-pt-br.sh` passing `--lang=pt-BR`.

Change only the data-loading/selection layer inside `generate-audio.ts`:

- Instead of reading a per-language source file, load the unified `prompts.json`.
- Treat `--lang` as an opaque locale string (do not assume 2 letters or parse a region off it).
- Select the prompts to generate audio for using the **availability rule**: all prompts where
  `translations[<--lang>]` exists and `practiceAsTarget !== false`. (So `--lang=es-ES` selects
  prompts that have an `es-ES` translation entry that is a drill target.)
- For each selected prompt, generate/refresh audio for that locale's `phrase` (and `response` if the
  current script does so — preserve whatever it currently generates).
- **Preserve the existing `--type` behavior and the speed-tier (slow/normal/fast or however it's
  implemented) logic exactly.** Do not alter how many audio variants are produced or their parameters;
  this is orthogonal to the schema change.
- Audio output filenames must use the normalized IDs (Part C). If audio is organized into per-language
  directories, use the **full locale code** as the directory name (e.g. `audio/es-ES/...`,
  `audio/pt-PT/...`) so regional variants stay cleanly separated later. If the existing structure uses
  bare `es`/`pt` directories, rename them to `es-ES`/`pt-PT` as part of this change and update path
  resolution accordingly — but if this rename is risky or the convention is unclear, **stop and report**
  (same caution as the ID-rename in Part C).

The net effect: `generate-es.sh` still generates exactly the Spanish audio, now selected by
"`es-ES` is a drill target for this prompt" rather than "this prompt is in the Spanish file." This is
more robust and is the intended behavior.

---

## Part F — Verification Checklist

Before declaring this handoff done, verify:

1. **Build & run:** the app builds and runs under the new `yesalittle` name with no broken references.
2. **No "spanish-trainer" identity strings remain** (but language-name references like "Spanish" and
   the `es-ES` locale code are intact).
3. **Prompt count integrity:** total prompts in `prompts.json` == (Spanish source count) + (Portuguese
   source count). Print the counts. No prompt lost, none duplicated.
4. **Field integrity (spot-check several prompts across categories):** for migrated prompts,
   `translations.<originLocale>.phrase` == old `phrase`, `translations.<originLocale>.response` == old
   `yourResponse`, `translations["en-US"].phrase` == old `english`, `translations["en-US"].response` == old
   `yourResponseEnglish`, `context["en-US"]` == old `context`, `tags`/`difficulty` unchanged. (`<originLocale>`
   is `es-ES` for Spanish-origin prompts, `pt-PT` for Portuguese-origin.)
5. **Scenario merge:** scenarios with shared ids (`greetings`, `restaurant`) appear once each, with
   pooled prompts; single-source scenarios are all present.
6. **ID normalization:** all Spanish-origin ids are `es-`-prefixed, all Portuguese-origin ids are
   `pt-`-prefixed, all ids unique. Their `translations` keys are the full locale codes `es-ES` /
   `pt-PT` respectively.
7. **Audio resolves & plays:** existing audio still plays in the app for both languages; audio file
   names match normalized ids; audio directories (if used) are locale-named (`es-ES`/`pt-PT`); no 404s.
8. **Audio scripts target correctly:** `generate-es.sh` (passing `--lang=es-ES`) selects exactly the
   Spanish-target prompts, `generate-pt.sh` (passing `--lang=pt-PT`) exactly the Portuguese-target
   prompts (verify by dry-run/log of which ids each would process, without necessarily regenerating
   everything).
9. **Original source files retained** for the human's verification.

Report the prompt counts, a few spot-checked field mappings, and any ambiguity you hit (especially
around audio naming) so the human can confirm before Handoff 2.
