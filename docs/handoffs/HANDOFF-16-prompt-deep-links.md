# Handoff 16 — Prompt Deep Links

**Scope:** Support `?prompt=<id>&target=<locale>` on the SPA, landing the visitor directly on that one
prompt in the practice UI. Small, self-contained, no new screens, no router.

**Why:** two purposes. (1) A verification shortcut — reaching one specific prompt currently means
starting a session and clicking through a weighted-random queue. (2) A shareable entry point for a
single phrase, and a natural landing target for future content-page links.

**Branch:** `prompt-deep-links` from `main`.

**No content changes, no audio, no new prompts.** Code only.

---

## Part 0 — Verify before building

1. **Confirm the existing param handling** added in the Handoff 15 addendum: `readEntryParams()` in
   `src/utils.ts` parses and validates `scenario` and `target`, and `App.tsx` reads it once at module
   scope. Report its current shape — this handoff **extends** that function rather than adding a
   parallel mechanism.
2. **Confirm how a practice queue is constructed** (`useSpacedQueue`), so a one-item queue is built
   the same way a normal session's queue is, rather than by a special path.
3. **Confirm where progress is recorded** — specifically whether anything is written on *reveal*
   (e.g. a `timesShown` increment) as opposed to only on the grade buttons. This determines what has
   to be suppressed in Part 3.
4. **Confirm how the localized category name is resolved** for display (the `categoryName` map
   resolved per-native, from Handoff 8), since Part 3's button text uses it.

Report findings and approach, then proceed.

---

## Part 1 — Param parsing

Extend `readEntryParams()` to also read `prompt`.

**Validation rules:**
- `target` is **required** when `prompt` is present. If `prompt` is given without `target`, ignore the
  `prompt` param entirely and fall through to normal behavior.
- `target` must be in `SUPPORTED_TARGETS` **and** available for the resolved native — the same
  `getAvailableTargets(native)` gate the existing code applies.
- `prompt` must be an id that exists **and** is drillable in that target
  (`translations[target].practiceAsTarget === true`).
- Any failure → ignore the `prompt` param silently. No error state, no alert; fall through to the
  normal Home screen. Consistent with how invalid `scenario`/`target` already behave.
- Matching stays **case-sensitive**, consistent with existing behavior.

If both `prompt` and `scenario` are supplied and both valid, **`prompt` wins** — a single-prompt
landing is the more specific intent.

---

## Part 2 — Landing behavior

When a valid `prompt` + `target` pair is present, the app opens **directly on the practice screen**
with a **queue of exactly one prompt** — not on Home.

- Use the normal practice rendering. Conversation prompts show the listen phase then reveal; scenario
  prompts render per the Handoff 4 scenario UI (🎬 situation, no Listen on the situation, response
  card, no Play Again).
- **Auto-play matches existing app behavior**: conversation phrase audio auto-plays on the listen
  phase; scenarios do not auto-play.
- The **← Exit** control behaves as it does today (returns to Home).
- **No Summary screen.** A single-prompt landing is not a session; finishing it must not route to
  Summary.

---

## Part 3 — Replace the grade buttons

On a deep-linked single prompt, the **"Didn't Get It" / "Understood ✓"** pair is replaced by a single
button:

> **Practice more &lt;scenario&gt; situations**

- `<scenario>` is the **localized category name** of the prompt's scenario, resolved for the active
  native language — the same value the app displays elsewhere. E.g. "Practice more Restaurant
  situations"; in a Spanish UI, "Practica más situaciones de Restaurante" (CC should phrase the
  Spanish string naturally via the i18n table rather than concatenating — add a key with the category
  name as an interpolated var).
- The button navigates to `/?scenario=<scenarioId>&target=<target>`, reusing the Handoff 15 addendum
  preselection so the visitor lands on Home with that category and target already selected.
- The grade buttons must **not** appear at all in this mode.

**No progress is recorded for a deep-linked prompt.** This is a preview/verification surface, not
practice. If Part 0 finds anything is written on reveal, suppress it in this mode. Confirm explicitly
that a deep-link visit leaves stored progress byte-identical.

---

## Part 4 — Scope boundaries

- Do **not** add a Summary variant, a new route, or a router.
- Do **not** change the normal session flow in any way.
- Do **not** modify `prompts.json` or any audio.
- Do **not** emit these links from the content pages in this handoff — that's a follow-on once the
  behavior is confirmed.

---

## Part 5 — Verification

1. **Part 0 findings reported** before changes were applied.
2. **Valid deep link works:** `/?prompt=cafe-006&target=es-ES` opens directly on that prompt in the
   practice UI; phrase audio auto-plays as normal.
3. **Scenario-type deep link works:** pick a scenario prompt (e.g. `panic-001` or `panic-009`) and
   confirm it renders with the scenario UI and does **not** auto-play.
4. **Grade buttons replaced:** "Practice more &lt;scenario&gt; situations" appears in place of
   Didn't Get It / Understood; clicking it lands on Home with that scenario and target preselected.
5. **No Summary:** completing the single prompt never routes to Summary.
6. **No progress written:** capture the relevant `localStorage` progress value before and after a
   deep-link visit (including revealing the answer) and confirm it is unchanged.
7. **Invalid inputs fall through silently**, each landing on the normal Home screen with no error:
   - `?prompt=cafe-006` (no target)
   - `?prompt=nonsense&target=es-ES`
   - `?prompt=cafe-006&target=xx`
   - a prompt id that exists but is **not** drillable in the given target
   - a target not available for the persisted native
8. **Precedence:** `?prompt=cafe-006&scenario=restaurant&target=es-ES` honors `prompt`.
9. **Regression:** normal sessions in EN→ES, ES→EN and EN→PT are unchanged — queue, grading, Summary
   and progress all behave as before. The Handoff 15 `?scenario=&target=` preselection still works.
10. **Build clean, tsc clean, no console errors.**

Report: Part 0 findings, the before/after `localStorage` comparison proving no progress is written,
the button text as rendered in both UI languages, and confirmation that the normal session flow is
untouched.

---

## Note for the PR
This is the first handoff intended to run through `greploop` after the PR is opened. Open the PR as
usual; the Greptile review loop runs against it afterward.
