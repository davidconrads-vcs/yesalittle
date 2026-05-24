# Handoff 2 — Pair-Based Identifiers, Per-Pair Progress, and Gloss Rendering

**Scope:** This handoff (1) retires the legacy short language codes (`'es'`/`'pt'`) and the `LOCALE`
bridge in favor of a single locale-code-based identifier system organized around a `{native, target}`
**language pair**; (2) re-keys progress storage to be per-pair; (3) makes the supported-language list
a single source of truth that drives data building; (4) adds a `resolveByNativeLang` helper for
`context`/`gloss` with English fallback; and (5) wires up gloss rendering in the practice UI.

**Out of scope (already working — do not rebuild):** the target-language switcher UI, per-target
scenario hiding, per-target prompt-count recompute, progress reload-on-language-switch. These were
verified working after Handoff 1. Touch them only insofar as the identifier refactor requires.

**Also out of scope (deliberately deferred):** a *native*-language picker UI. For v1 the native
language is fixed to `en-US`. The code must be pair-shaped (so a native picker is a later additive
change) but must NOT expose a native-language control yet.

**Branch:** create `pairs-and-gloss` from `main` (after Handoff 1 is merged).

**Step 0 — inspect and report before editing.** Confirm the current shapes of: the `Language` type
and everywhere it's referenced; the `LOCALE` map in `App.tsx`; the `DATA` build (the
`buildScenarios('es')` / `buildScenarios('pt')` calls); the progress/streak storage key functions and
the `useProgress` hook; and how the language toggle sets state. Report a short plan before making
changes. (Findings from Handoff 1's investigation: data is built once at module load via
`buildScenarios` per language; progress is keyed `trainer-progress-<short>` / `trainer-streak-<short>`
as `Record<promptId, PromptStats>` and `{lastPracticed, streak}` respectively; prompt IDs in progress
are already the new prefixed form; counts/visibility/progress all update on switch.)

---

## Part A — Collapse to a Single Locale-Code Identifier System

### The problem being fixed

The app currently runs two parallel identifier systems: a UI-layer `Language = 'es' | 'pt'` short
code, and the full locale codes (`es-ES`, `pt-PT`) used by the unified data, bridged by a `LOCALE`
mapping table. This split is a vestige of the single-language origin. We are eliminating the short
codes so the app speaks **one** identifier language end to end, matching the data layer. This makes
adding languages an additive change with no mapping table to keep in sync.

### Target model

Introduce an explicit **language pair** concept:

```ts
interface LanguagePair {
  native: string;   // BCP 47 locale, fixed to 'en-US' for v1
  target: string;   // BCP 47 locale, e.g. 'es-ES' | 'pt-PT'
}
```

- Replace the `Language = 'es' | 'pt'` union and all its usages with locale-code-based logic.
  Where the app currently stores/passes a short code, it should store/pass the **target locale**
  (`'es-ES'` / `'pt-PT'`) — or the full `LanguagePair` where both ends are needed (storage, lookups).
- **Delete the `LOCALE` map** in `App.tsx` once nothing references it. There is no longer a short
  code to map from; the app uses locale codes directly.
- Treat all locale codes as **opaque strings**. Never parse, slice, or assume a length (no
  `code.slice(0,2)`), so future codes like `pt-BR` / `es-419` work unchanged.
- The current target switcher continues to work; it now sets the **target locale** (and thus the
  active pair, with `native` fixed to `en-US`) instead of a short code. Its labels/flags are unchanged.

### Native language for v1

- `native` is hard-coded to `'en-US'` everywhere a pair is constructed. Do **not** add UI to change it.
- Centralize this default (e.g. a `DEFAULT_NATIVE = 'en-US'` constant) so a future native picker has
  one obvious place to take over from.

---

## Part B — Single Source of Truth for Supported Languages

The `DATA` object is currently built with hardcoded `buildScenarios('es')` / `buildScenarios('pt')`
calls. Replace this with a single declared list that drives the build, so adding a language is a
one-line change rather than new module-load code.

- Define one canonical list of supported **target locales** (and/or supported pairs), e.g.:
  ```ts
  const SUPPORTED_TARGETS = ['es-ES', 'pt-PT'] as const;
  ```
  with a parallel display-metadata lookup (label + flag emoji) keyed by locale:
  ```ts
  const TARGET_META: Record<string, { label: string; flag: string }> = {
    'es-ES': { label: 'Spanish', flag: '🇪🇸' },
    'pt-PT': { label: 'Portuguese', flag: '🇵🇹' },
  };
  ```
- Build `DATA` by iterating `SUPPORTED_TARGETS` (e.g. `Object.fromEntries(SUPPORTED_TARGETS.map(t =>
  [t, buildScenarios(t)]))`), keyed by target locale.
- The switcher UI renders its options from `SUPPORTED_TARGETS` + `TARGET_META` rather than hardcoded
  buttons, so a new language appears in the UI automatically when added to the list.
- `buildScenarios` continues to filter by the availability rule (`translations[target]` exists and
  `practiceAsTarget !== false`) — unchanged logic, just called via the list.

Net effect: adding `pt-BR` later = add `'pt-BR'` to `SUPPORTED_TARGETS`, add its `TARGET_META` entry,
add its prompt data and audio. No other code changes.

---

## Part C — Per-Pair Progress Storage (with clean reset)

### Key format

Progress and streak are keyed **per pair**, namespaced with the app name, `::` separating native from
target:

- progress: `yesalittle:progress:<native>::<target>` → e.g. `yesalittle:progress:en-US::es-ES`
- streak:   `yesalittle:streak:<native>::<target>`   → e.g. `yesalittle:streak:en-US::es-ES`

The stored value shapes are unchanged: progress is `Record<promptId, PromptStats>`, streak is
`{ lastPracticed: string, streak: number }`. Only the **key** changes (from short-code to pair-based).

### Clean reset — no migration

Existing progress data is throwaway (pre-migration bare-ID data is already orphaned, and post-migration
data is from testing only). **Do not write migration logic** to carry old data forward. Instead:

- The new code simply reads/writes the new pair-based keys. Old keys (`trainer-progress-es`,
  `trainer-progress-pt`, `trainer-streak-*`) are left unread; they become dead entries.
- Add a **one-time cleanup** that removes the known old keys from localStorage if present
  (`trainer-progress-es`, `trainer-progress-pt`, `trainer-streak-es`, `trainer-streak-pt`), so the
  user's storage isn't littered with dead data. Guard it so it only runs once (e.g. a
  `yesalittle:migrated-v2` flag) and never deletes anything else.
- Net user-facing effect: progress resets to empty for both languages. This is expected and
  acceptable — confirm in the PR notes so it's not a surprise.

### `useProgress` changes

- `useProgress` currently reloads on `language` change via a `useEffect`. Update it to key off the
  full **pair** (or at minimum native+target) so the effect dependency and the storage key both use
  the pair. Since `native` is fixed for v1, the practical behavior (reload on target switch) is
  unchanged — but the keys and dependencies are now pair-shaped for the future.

---

## Part D — `resolveByNativeLang` Helper (context + gloss)

Both `context` and `gloss` are objects keyed by **native**-language code, with an English fallback.
Add one shared helper and use it for both, so resolution behavior never drifts between them.

```ts
// Resolves a native-language-keyed field to the best available string for the
// learner's native language, falling back to English, then to any available entry.
function resolveByNativeLang(
  field: Record<string, string> | undefined,
  nativeLang: string
): string | undefined {
  if (!field) return undefined;
  return field[nativeLang]
    ?? field['en-US']
    ?? Object.values(field)[0]   // last-resort fallback: any available entry
    ?? undefined;
}
```

- Use it for `context`: `resolveByNativeLang(prompt.context, pair.native)`.
- Use it for `gloss`: `resolveByNativeLang(prompt.translations[pair.target]?.gloss, pair.native)`.
- For v1, `nativeLang` is always `'en-US'`, so resolution returns the `en-US` entry — but the helper
  is written generally so a future Spanish-native learner resolves correctly with no code change.
- Wherever `context` is currently rendered (it was a flat string pre-Handoff-1, now `context['en-US']`),
  route it through this helper instead of reading `.en-US` directly.

---

## Part E — Gloss Rendering

`gloss` explains a non-literal or culturally-specific target phrase, in the learner's native language.
The migrated data currently contains **no** glosses, so this is about building and verifying the
rendering path now, so it "just works" when glosses are authored later (especially for linguistically
distant languages added down the road).

Requirements:

- In the prompt practice/reveal UI, when the current prompt's target entry has a gloss for the
  learner's native language (via `resolveByNativeLang` on the target entry's `gloss`), display it as a
  distinct, secondary note — visually subordinate to the phrase/response, clearly an explanation
  (e.g. a smaller, muted "ℹ️ what this means" style note on the reveal). It should not compete with
  the primary phrase/response content.
- When there is no gloss (the normal v1 case), render nothing — no empty container, no placeholder.
- **Verification seed:** to prove the path works end to end, temporarily add a `gloss` to ONE existing
  prompt in `prompts.json` (e.g. on an `es-ES` greeting: `"gloss": { "en-US": "TEST GLOSS — remove
  before merge: this explanation confirms gloss rendering works." }`), confirm it renders correctly in
  the reveal UI for the EN-US→ES-ES pair, screenshot/confirm, then **remove the seed** before the PR is
  finalized. Do not leave test data in the committed prompts file. (State clearly in the PR that the
  seed was added, verified, and removed.)
- Keep the gloss styling consistent with the existing dark theme (see the current Home/practice
  styling). Reuse existing tokens/classes rather than introducing new color values.

---

## Part F — Verification Checklist

1. **No short codes remain:** the `Language = 'es' | 'pt'` type and the `LOCALE` bridge map are gone;
   grep for `'es'`/`'pt'` as *identifiers* finds none (locale codes `'es-ES'`/`'pt-PT'` and
   language-name UI strings like `"Spanish"` are fine).
2. **Single source of truth:** `SUPPORTED_TARGETS` (+ `TARGET_META`) drives both the `DATA` build and
   the switcher UI; no hardcoded per-language `buildScenarios` calls or hardcoded switcher buttons.
3. **Switcher still works:** toggling Spanish/Portuguese updates scenarios, counts, and visibility
   exactly as before (panic/pharmacy/cafe/tickets drop for Portuguese; counts recompute). Regression
   check only — behavior unchanged.
4. **Per-pair progress keys:** practicing writes to `yesalittle:progress:en-US::es-ES` /
   `...::pt-PT` and the streak equivalents; verify in devtools → localStorage. Progress for Spanish
   and Portuguese are independent.
5. **Old keys cleaned up:** `trainer-progress-*` / `trainer-streak-*` are removed once; the cleanup
   runs a single time (guarded by a flag) and touches nothing else.
6. **Progress reset acknowledged:** progress starts empty for both pairs (expected).
7. **`resolveByNativeLang` in use:** `context` renders via the helper (not a direct `['en-US']` read);
   gloss resolution uses the same helper. Both fall back to `en-US` correctly.
8. **Gloss rendering verified then cleaned:** the seed gloss rendered correctly in the reveal UI, was
   screenshotted/confirmed, and was removed from `prompts.json` before finalizing. No test data
   committed.
9. **Opaque codes:** no code parses/slices locale codes; a hypothetical `pt-BR` would flow through
   unchanged.
10. **Build & run clean:** app builds, no type errors, audio still plays, no console errors on
    language switch.

Report: the grep result for residual short codes, a localStorage screenshot showing the new pair keys,
confirmation the gloss seed was added-verified-removed, and any surprises from Step 0 inspection.
