# Handoff 8 — Pre-work: i18n Exploratory Assessment (ASSESS ONLY, NO CHANGES)

**Purpose:** This is an assessment pass, not an implementation. Do NOT change any code, do NOT create
a branch, do NOT install anything. Inspect the codebase and report findings so the full i18n handoff
can be written against known architecture. Report back; await the spec.

The upcoming work (for context, so your assessment is aimed right): internationalize the UI so that
selecting a native language ("I speak") switches the entire interface to that language — UI chrome,
mode descriptions, category names, practice-screen labels — not just the prompt learning content
(which Handoff 7 already localized via `context[native]`). First UI language to add: Spanish. System
must be built so adding more UI languages later (incl. CJK eventually) is additive.

Please assess and report on the following:

## 1. Translation-approach recommendation
Inspect the current code and recommend ONE of:
- **(a) Lightweight home-grown string table** — a keyed dictionary per UI language + a small `t(key)`
  helper reading the active native/UI language. No dependency.
- **(b) react-i18next** (or similar standard library).

Base the recommendation on what you actually find, considering:
- How many distinct UI strings are there roughly? (rough count from a scan)
- Is there **interpolation** needed? (e.g. "Start Practice — 177 phrases" — a count injected into a
  string; "Quick Review — up to 15" etc.) List the interpolated strings you find.
- Is there **pluralization** that matters? (e.g. "1 phrase" vs "2 phrases" — does the UI currently
  pluralize, and would Spanish pluralization differ?)
- Any existing i18n-ish patterns already in the code?
Give a clear recommendation with a one-paragraph rationale. (Prior lean from planning: for an app
this size, home-grown is likely cleaner unless interpolation/pluralization is heavy enough to justify
the library — but assess and decide from the actual code.)

## 2. Full UI-string inventory
Produce a categorized inventory of every hardcoded English UI string that would need translating.
Group by area:
- Home screen (title, tagline, "I speak"/"I'm learning" labels, "Playback Speed", "Slow/Normal/Fast",
  "Session Mode" + the three mode names and their descriptions, "Scenarios (or start with all)",
  "Start Practice — N phrases", "Progress" button, etc.)
- Practice screen (the scenario/conversation labels: "THE SITUATION", "WHAT YOU'D SAY", "HERE'S WHAT
  THEY SAID", "YOU COULD RESPOND", Listen / Play Again / Reveal Answer / Understood / Didn't Get It,
  any others)
- Progress screen (all labels)
- Any error/empty/loading states
Give a rough total count. Flag any string that contains injected values (interpolation).

## 3. Category names — WHERE DO THEY LIVE? (critical)
Determine whether the scenario category names ("Restaurant", "Greetings & Pleasantries", "Panic
Button", etc.) are:
- **(a) in the data** — i.e. a `category` field on each scenario object in `prompts.json`, OR
- **(b) hardcoded UI strings** in a component, OR
- **(c) some mix.**
This is critical because it determines the mechanism: if they're in the data, localizing them is a
data change (add per-language category values, resolved like `context[native]`), NOT a UI-string-table
change. Report exactly where they live and how they're currently rendered. Also note: are the scenario
`icon`/`color` separate from the name (so only the name needs translating)?

## 4. Language-name handling (two kinds — confirm feasibility)
The design calls for TWO distinct treatments of language names:
- **"I speak" (native) picker → autonyms:** each language shown in its own name/script (English,
  Español, Português; later 中文, 한국어). Essentially fixed data, one per language, NOT translated
  per-UI-language.
- **"I'm learning" (target) picker → localized names:** translated to the active UI language (Inglés,
  Portugués when UI is Spanish). These ARE translatable strings.
Report: where are language names currently defined (NATIVE_META / TARGET_META in types.ts?), and what
would it take to support these two different treatments? Confirm the structure can hold both an
autonym (fixed) and a localized display name (per-UI-language) per language.

## 5. The pixel-identical-English regression risk
The refactor swaps hardcoded English strings for keyed lookups. The English values must remain
EXACTLY as they currently appear (the existing EN-native users must see zero change). Report: any
strings where the current English wording is non-obvious or might be easy to alter accidentally during
extraction? (We want the English entries in the table to be verbatim copies of today's text.)

## 6. Persistence / reactivity
- The active UI language should follow the selected native language (from Handoff 6's `yesalittle:native`
  + state). Confirm: does the UI re-render reactively when native changes (the Handoff 6 useMemo
  reactivity), so a language switch updates chrome live without reload?
- Any place where a string is computed once at module load (like the old DATA const issue) that would
  NOT pick up a language change?

## 7. Anything else you notice
Flag any complication not anticipated above — RTL concerns, font/glyph concerns for future scripts,
strings embedded in non-obvious places (document title, meta tags, OG tags, aria-labels,
placeholder text), date/number formatting, etc.

---

**Deliverable:** a written report covering items 1–7. NO code changes, NO branch, NO installs. Once we
review your findings, we'll finalize and hand you the full Handoff 8 implementation spec.
