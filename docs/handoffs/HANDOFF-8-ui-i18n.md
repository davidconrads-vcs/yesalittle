# Handoff 8 — UI Internationalization (chrome follows "I speak")

**Scope:** Make the entire UI chrome switch language with the selected native language ("I speak"), so
a Spanish speaker gets a Spanish interface — not just Spanish prompt scaffolding (Handoff 7 did that).
Build a home-grown i18n system, extract all ~60 UI strings, localize category names (data-side),
handle the two language-name treatments, and add Spanish as the first non-English UI language. Built
on the pre-work assessment (architecture below reflects its findings).

**This handoff does NOT add prompt content or audio.** Pure UI/structure + Spanish UI strings.

**Branch:** `ui-i18n` from `main`.

**Two-phase delivery:** (1) build the system + extract English verbatim + prove zero English change
via screenshot diff; (2) add Spanish strings. The Spanish translation *values* come from a separate
worksheet (drafted/reviewed with the human) — CC should build the structure and English extraction
first, and can stub Spanish entries (or use a provided worksheet) per the human's instruction.

---

## Part 1 — The i18n system (home-grown)

Build a lightweight, correct translation layer. **Do NOT use the `count !== 1 ? 's' : ''` append
trick** — build real primitives so this scales to CJK later.

**1a — String table.** A keyed dictionary per UI language:
```
strings = {
  'en-US': { 'home.tagline': "Understand what locals say — and respond like one.", ... },
  'es-ES': { 'home.tagline': "<Spanish>", ... }
}
```
Keys are stable identifiers (e.g. `home.start_practice`, `practice.reveal_answer`). English values are
**verbatim copies of today's literals** (see Part 4 — this is the regression-critical part).

**1b — `t(key, vars?)` helper.** Looks up `key` in the active UI language's table, falls back to
`en-US` if missing, and interpolates `vars` into `{placeholder}` slots. Example:
`t('home.start_practice', { n: 177, phrase: pluralize(...) })`. Missing-key behavior: fall back to
en-US, and (dev only) warn — never render a raw key to the user.

**1c — `pluralize(lang, n, forms)` helper.** A real pluralization function, not string concatenation.
For en-US and es-ES the rule is the same (n === 1 → singular, else plural), but implement it as a
proper function keyed by language so CJK (single form) and other rules slot in later:
```
pluralize('en-US', n, { one: 'phrase', other: 'phrases' })
pluralize('es-ES', n, { one: 'día', other: 'días' })
```
The interpolated strings that need this: "Start Practice — {n} phrase{s}", "🔥 {streak} day{s}".

**1d — UI-language React context.** Per the assessment, `native` currently only reaches Home;
Practice/Summary/Progress/SpeedControl receive `lang` (target), not `native` (UI language). Add a
**UI-language context/provider at App** exposing the active UI language (= selected native) and the
`t`/`pluralize` helpers, so every component can localize its chrome without prop-drilling. The context
value derives from the same native state (Handoff 6) and re-renders reactively on language switch
(no reload).

---

## Part 2 — Extract all UI strings (~60)

Replace every hardcoded English UI string with a `t(key)` call, populating the en-US table with the
**exact current literal**. Inventory by area (from assessment):

- **Home:** eyebrow "Listening Trainer" (translate to ES, but English stays "Listening Trainer" — a
  rename is deferred to a future pass); tagline; "📊 Progress"; "I speak"; "I'm learning"; "Playback
  Speed"; "Session Mode"; the three mode names + descriptions ("Full Practice"/"All phrases, weighted
  by progress", "Quick Review"/"Previously missed, up to {n}", "New Phrases"/"Only phrases you haven't
  seen"); "Scenarios (or start with all)"; "Start Practice — {n} phrase{s}"; "🔥 {streak} day{s}".
- **SpeedControl:** "Slow", "Normal", "Fast".
- **Practice:** "← Exit"; "The Situation"; "What you'd say"; "You could respond"; "Listen & try to
  understand"; "Here's what they said"; "Reveal Answer"; "Didn't Get It"; "Understood ✓". (Numeric
  "{i}/{n}" needs no translation.)
- **SpeakButton:** "Playing...", "Play Again", "...", "Listen".
- **Summary:** "Session Complete"; "understood on first listen"; "{pct}% comprehension"; "Review these
  ({n})"; "The Situation"; "What you'd say"; "Retry Missed"; "New Session".
- **Progress:** "← Back"; "Progress"; "Comprehension"; "Day Streak"; "Total Attempts"; "By Category";
  "Not started"; "Weakest Phrases"; "Reset All Progress"; "Reset all progress? This cannot be undone."
- **App:** "No new phrases in this selection!"; "No phrases to review!"

**Do NOT translate / do NOT key for translation:** the brand "yesalittle". (The "Listening Trainer"
eyebrow IS translated — its English value just stays the current text for now.)

**Module-load-freezing fixes (assessment item 6):** `SPEEDS` (SpeedControl) and the label fields in
`NATIVE_META`/`TARGET_META` (types.ts) are module-level constants whose strings won't react to a
language switch. Keep their non-text fields (value, flag, ttsLang) in the constant; resolve the
visible label via `t()` inside the component render. `SESSION_MODES` is already built inside Home's
render, so it can call `t()` directly.

---

## Part 3 — Category names (data-side, with key/display decoupling)

**This is the biggest structural item.** Category names live in `prompts.json` as a `category` string
on each scenario, rendered at Home, Practice, Progress. **Critically, the category string is also used
as a selection/filter KEY** (`selected.has(s.category)`, `toggleCategory(s.category)`,
`categories.has(p.category)`, and passed up via `onStart`). Localizing the displayed value would break
all selection/filtering, because the key would change per language.

**Required fix — decouple key from display:**
1. Switch ALL selection/filter/toggle logic to key off the stable **`scenario.id`** (e.g. `"restaurant"`,
   `"panic"`), never the display string. The Set of selected categories, the toggle, the filter, and
   the value passed through `onStart` all use `scenario.id`.
2. Localize only the **display name**. Add per-language category names to the data, resolved like
   `context[native]` via the existing native-aware resolver. Recommended data shape: change scenario
   `category` (string) into a localized structure, e.g. `categoryName: { "en-US": "Restaurant",
   "es-ES": "Restaurante", ... }` (keep `id`, `icon`, `color` as language-neutral fields). OR keep
   `category` as the en-US value and add a parallel localized map — CC picks the cleaner approach
   consistent with how `context` is structured, and reports which.
3. `icon` and `color` are language-neutral — do not touch.

Verify after: selecting categories, toggling, "start with all", filtering, and the per-category
progress display all work identically in both languages, and switching language changes only the
*displayed* category names, not the selection state.

---

## Part 4 — Verbatim-English regression discipline (CRITICAL)

Existing English-native users (EN→ES, EN→PT) must see **zero change**. The en-US table values must be
exact copies of today's literals. **No English string changes in this handoff** — no exceptions.

At-risk characters to copy exactly (do NOT normalize/autocorrect):
- Em-dash `—` in the tagline and "Start Practice — …"
- Checkmark in "Understood ✓"
- Literal three-dot `...` in "Playing..." (NOT the `…` ellipsis char)
- Emoji prefixes that are part of the string: 🔥 📊 🎬 (and any others)
- Straight apostrophes `'` in "haven't", "Here's", "Didn't", "you'd" — must NOT be curled
- Ampersands + accents in category data: "Greetings & Pleasantries", "Activities & Tickets",
  "Café & Bar" (note the é)
- Exact punctuation/casing in alerts and the confirm string
- Spacing around dashes/placeholders in interpolated strings

**Proof of zero change:** render the app in English (default), screenshot the key screens, and diff
against `main` (pre-handoff). Prove pixel-identical English BEFORE adding any Spanish. Report the diff
result.

---

## Part 5 — Language-name treatments (two kinds)

Per the design (each name shown in what the user can read):

**5a — "I speak" (native) picker → autonyms (fixed).** `NATIVE_META` already holds autonyms
("English", "Español"). Rename the field `label` → `autonym` for clarity. These are fixed, one per
language, NOT translated per-UI-language. Resolve the autonym for display in the native picker.

**5b — "I'm learning" (target) picker → localized names (translatable).** `TARGET_META.label` is
currently a single English name. Move target display names into the string table, keyed per UI
language (e.g. `lang.es-ES` → "Spanish" in the en table, "Español" in the es table; `lang.pt-PT` →
"Portuguese"/"Portugués"). When UI is Spanish, the "I'm learning" buttons show "Inglés"/"Portugués".
Keep `flag` and `ttsLang` as language-neutral metadata in TARGET_META.

(Structure note: leave room to add a secondary autonym to target names later if ever wanted, but do
NOT build that now — pure localized names for now.)

---

## Part 6 — Parameterize the hardcoded "15"

The "Quick Review — Previously missed, up to 15" description has a literal `15` baked into prose. The
real limit is a constant elsewhere (find it). Parameterize: `t('home.mode.quick_review_desc', { n:
<the real limit constant> })` → "Previously missed, up to {n}". So the text can't drift from the
actual limit. Apply in both languages.

---

## Part 7 — document.documentElement.lang on switch (a11y)

When the UI language switches, update `document.documentElement.lang` to the active UI language
(`'en'`/`'es'`) in JS, for screen-reader correctness. **Scope OUT everything else in index.html** —
the `<title>`, meta description, OG/Twitter tags, JSON-LD, and `<noscript>` stay English (they're
crawler/share-facing, handled separately if ever). Only the live `documentElement.lang` follows the
in-app switch.

---

## Part 8 — Spanish string values

The Spanish translations for all keyed strings (chrome, category names, target language names,
tagline, mode descriptions, the "Listening Trainer" eyebrow) come from a **separate worksheet**
drafted and reviewed with the human (same draft-and-review process as the prompt content). 

CC: build Parts 1–7 first (system + English extraction + structure), prove zero English change, THEN
populate the es-ES table from the human-provided worksheet. Do NOT invent Spanish translations
unilaterally — the human reviews them for naturalness. If the worksheet isn't ready when you reach
this part, stub the es-ES entries (e.g. fall back to en-US) so the system is testable, and flag that
Spanish values are pending.

---

## Part 9 — Verification checklist

1. **System works:** `t(key)` resolves, falls back to en-US on missing key (dev warning, never a raw
   key shown), interpolates vars, `pluralize` handles singular/plural correctly in both languages.
2. **English pixel-identical:** screenshot diff vs. main shows zero change in English across Home,
   Practice (conversation + scenario), Summary, Progress. (The regression-critical check.)
3. **Language switch works live:** selecting "I speak Spanish" switches ALL chrome to Spanish —
   Home, SpeedControl, Practice, Summary, Progress — without reload. Switching back to English
   restores English. No raw keys, no English leaking into the Spanish UI (and vice versa).
4. **Category names:** localize for display in both languages; selection/toggle/filter/"start with
   all"/per-category progress all key off `scenario.id` and work identically regardless of language;
   switching language changes only displayed names, not selection state.
5. **Module-load strings fixed:** Slow/Normal/Fast and the picker labels update on language switch
   (not frozen at load).
6. **Language names:** "I speak" shows autonyms (English, Español); "I'm learning" shows localized
   names (Inglés/Portugués in Spanish UI, Spanish/Portuguese in English UI). Flags unchanged.
7. **Parameterized limit:** "up to {n}" reflects the real constant, both languages.
8. **a11y:** `document.documentElement.lang` updates on switch; index.html SEO/OG/meta untouched.
9. **No prompt-content/audio changes:** prompt count unchanged, no audio touched, `translate="no"`
   on learning content still intact (and does not interfere with chrome translation).
10. **Build clean, no console errors** on language switch, target switch, practice, progress.

Report: the architecture as built (table location, context, helpers), the screenshot-diff proof of
zero English change, confirmation of the scenario.id decoupling, a screenshot of the Spanish UI (once
Spanish values are in), and any strings where Spanish is pending the worksheet.
