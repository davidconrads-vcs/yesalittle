# Handoff 6 — Native-Language Picker (infrastructure)

**Scope:** Make the learner's **native language** a real, selectable, persisted variable that drives
scaffolding resolution (`context`, `gloss`, native-anchor text) and per-pair progress — instead of the
current hardcoded `en-US`. Build the picker UI and wire it through. **English remains the only
*available* native language at the end of this handoff**, because it's the only one with authored
content; the picker is built and correct but offers a single option until a second native language's
content exists (a future handoff).

**Why now:** this is the prerequisite for English-as-a-target (the ES→EN pair, next milestone). That
direction needs the app's scaffolding shown in the learner's native language (Spanish), which is
impossible while native is hardcoded to en-US. This handoff exposes the multi-native capability the
Handoff 2 pair-system was designed for but left fixed in v1.

**Branch:** `native-picker` from `main`.

**Important framing — infrastructure, not content.** This handoff adds NO new language content and NO
new audio. It is pure plumbing + UI. The single available native language (English) already has all
its content. Do not author content or generate audio in this handoff.

---

## Part 0 — Confirm current state before implementing

Before writing code, CC should read and report the current shape of the native-language handling, so
implementation builds on reality rather than assumption. Specifically locate and summarize:

1. How the native language is currently fixed to `en-US` — search for the constant/literal. Where is
   it referenced?
2. The current signature and behavior of `resolveByNativeLang` (from Handoff 2) — what does it take,
   what does it fall back to?
3. The pair identifier construction — confirm it's `{native}::{target}` and find where `native` is
   currently always `en-US`.
4. The progress/streak localStorage key format (Handoff 2 used keys like
   `yesalittle:progress:en-US::es-ES`) — confirm exact format.
5. `SUPPORTED_TARGETS` (or equivalent) — the single source of truth for target languages. Is there an
   analogous structure for native languages, or does native need a new one?
6. The existing **target** selector UI — where it lives, how it persists the choice, so the native
   picker can mirror its pattern for consistency.

Report this back as a short summary, then propose the implementation against it. Proceed after that's
confirmed. (This mirrors the verify-then-implement pattern used in prior handoffs.)

---

## Part 1 — Native language as a first-class variable

Introduce native language as a selectable value parallel to target language.

- Add a `SUPPORTED_NATIVES` structure (mirroring `SUPPORTED_TARGETS`) as the single source of truth
  for which native languages exist. **For now it contains exactly one entry: `en-US`** (English).
  Structure it so adding a second entry later (e.g. `es-ES`) is a one-line change — the same way
  `SUPPORTED_TARGETS` drives the target switcher.
- Replace the hardcoded `en-US` native references with a runtime value sourced from the user's
  selection (defaulting to `en-US`).
- The pair identifier `{native}::{target}` now uses the selected native rather than a literal. With
  only English available, every pair is still `en-US::<target>` in practice — but the value flows from
  state, not a constant. This is the core change: the *mechanism* becomes variable even though the
  *available set* is still one.
- `resolveByNativeLang` continues to work as-is (it already takes a native language and falls back to
  en-US); just ensure it's being passed the selected native, not a hardcoded one.

---

## Part 2 — Persistence

- Persist the selected native language in localStorage, mirroring how the target selection persists.
  Suggested key: `yesalittle:native` (parallel to the existing `yesalittle:target`).
- On load: read the persisted native; if absent or not in `SUPPORTED_NATIVES`, default to `en-US`.
- The per-pair progress/streak keys already include native in their format
  (`yesalittle:progress:{native}::{target}`). Since native has been effectively `en-US` all along,
  **existing stored progress remains valid and correctly keyed** — no migration needed. Confirm this:
  a user's current progress under `en-US::es-ES` should continue to load unchanged after this handoff,
  because the selected native defaults to en-US.

---

## Part 3 — Picker UI

- Add a native-language picker, visually consistent with the existing target picker (same component
  pattern, styling, dark-theme tokens). Likely placement: near the target picker, clearly labeled so
  the two are distinguishable — e.g. "I speak" (native) and "I'm learning" (target), or similar
  framing that makes the direction obvious. CC can propose the exact labels/layout; the key UX
  requirement is that a user understands which selector is their language vs. the language they're
  learning.
- **Single-option behavior:** with only English in `SUPPORTED_NATIVES`, the picker either (a) shows
  English as the sole selectable option, or (b) renders in a visually complete but effectively-inert
  state (e.g. shows "English" as the native language, selectable but with no alternative yet). Prefer
  whichever looks intentional rather than broken — a picker with one option can look like a bug. CC
  should propose the treatment. One good option: render the native picker fully (so the UI is
  complete and the mechanism is visible/testable) but, since there's only one choice, it simply stays
  on English. When a second native is added later, the picker "comes alive" with no further UI work.
- Selecting a native language updates state, persists it, and switches the active pair (which in turn
  drives which progress data is shown) — exactly as the target picker does. With one native option
  this is a no-op in practice, but the wiring must be real and correct so the future second language
  works without further plumbing.

Surface to the human in the PR: the proposed labels and the single-option treatment, with a
screenshot, for approval before merge.

---

## Part 4 — What this handoff explicitly does NOT do

To keep scope clean (and avoid the trap of half-building the next milestone):

- **No new native-language content.** No Spanish/Portuguese/other `context` or `gloss` authoring. The
  only native language is English, which already has content.
- **No English-as-a-target work.** English remains the native anchor only; it is not yet a drillable
  target. No English target content, no English audio, no `generate-en.sh`.
- **No second native language enabled.** `SUPPORTED_NATIVES` has exactly one entry. The point is that
  *adding* one later is trivial because the plumbing is done here.
- **No audio generation or deletion of any kind.**

These are the next handoff (the ES→EN pair). This handoff is the foundation that makes that one a
content effort rather than a content-plus-plumbing effort.

---

## Part 5 — Verification checklist

1. **Build clean** (tsc + vite build, no errors).
2. **Native is no longer hardcoded:** the `en-US` literal that fixed native language is gone, replaced
   by a state-sourced value. (CC shows the before/after of that reference.)
3. **Default behavior unchanged for existing users:** on load with no stored native (or stored en-US),
   the app behaves exactly as before — English scaffolding, ES/PT targets, existing progress intact.
   This is the critical regression check: a returning user notices nothing changed.
4. **Progress continuity:** existing `en-US::<target>` progress/streak data loads unchanged. No
   migration, no reset.
5. **Native selection persists:** selecting English (the only option) writes `yesalittle:native`;
   reloading reads it back. (Trivial with one option, but confirms the persistence path works for when
   there are more.)
6. **Pair identifier flows from state:** confirm (via a log or inspection) that the active pair's
   native segment comes from the selected/persisted value, not a hardcoded literal — even though the
   value is currently always en-US.
7. **Picker renders correctly:** the native picker appears, is visually consistent with the target
   picker, is clearly distinguishable as "your language" vs. "learning," and the single-option state
   looks intentional (not broken). Screenshot for human approval.
8. **`SUPPORTED_NATIVES` is the single source of truth:** adding a hypothetical second entry would
   make it appear in the picker with no other code change. (CC can demonstrate by temporarily adding a
   dummy entry, confirming it appears, then removing it — to prove the wiring, without shipping the
   dummy.)
9. **No content or audio changed:** prompt count unchanged (177), no audio files added/removed.

Report: the Part-0 current-state summary, the before/after of the de-hardcoded native reference, a
screenshot of the picker, confirmation that existing progress loads unchanged, and the proposed
native-picker labels/treatment for approval.

---

## Forward note (for context, not action)

The next handoff (ES→EN pair / English-as-target) will: add `es-ES` to `SUPPORTED_NATIVES`; author
English target content (using CONTENT-NOTES.md's (a)-extend vs (b)-author-fresh sort); author
Spanish-native `context`/`gloss` scaffolding for the ES→EN pair; add English audio generation
(`generate-en.sh`, English ElevenLabs voice); and run the EN-target naturalness audit on the English
strings being promoted from native-anchor to target. None of that happens here — but this handoff's
plumbing is what makes it purely a content effort.
