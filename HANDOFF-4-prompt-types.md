# Handoff 4 — Prompt Types: Conversation vs. Scenario

**Scope:** Introduce a `type` field on prompts distinguishing **conversation** prompts (something is
said *to* the learner in the target language, they respond) from **scenario** prompts (the learner is
described as being *in* a situation, they produce a target-language utterance). Migrate 12 existing
prompts that are scenarios authored as conversations into the new model — refining their context
strings, removing their target-language pseudo-phrases, deleting orphaned audio, and rendering them
appropriately in the UI.

**Why this matters:** scenarios train pure production (the learner speaks first, prompted by a
situation), while conversations train comprehension-plus-response (the learner hears something, then
replies). They're pedagogically different and the current schema conflates them by forcing
scenarios into the conversation shape — producing target-language "phrases" that aren't things any
real person would say, and audio of those non-phrases that no one should ever hear.

**Branch:** `prompt-types` from `main`.

---

## Part A — Schema addition

Add an optional `type` field to the prompt schema:

```ts
type PromptType = 'conversation' | 'scenario';
// Default: 'conversation' (matches all existing data not migrated below)
```

Rules:

- `type` is **optional**; a missing `type` is treated as `'conversation'`. This keeps the schema
  backward-compatible — every existing prompt that isn't being migrated stays valid.
- For `type: 'scenario'` prompts:
  - The target-language entry in `translations` must have a `response` (the utterance the learner
    practices saying) but must **NOT** have a `phrase` field. The situation is described in
    `context`; there is no target-language thing being said *to* the learner.
  - The native-language entry (`en-US` for v1) likewise must have a `response` but no `phrase`. The
    native-language `response` is the translation of the target-language `response`, used as
    the native-side reference when revealed.
  - `practiceAsTarget` on the target language stays `true` (the response is what's drilled).
- For `type: 'conversation'` prompts (the default): no change. `translations[lang]` continues to have
  both `phrase` and `response`.

Add a JSON-schema or TS-level validation that enforces these rules (whatever the codebase already uses
for prompt validation; if there's no formal validator, a runtime check in `buildScenarios` that throws
a clear error on malformed prompts is sufficient).

---

## Part B — Data migration (12 prompts)

Twelve existing prompts need to flip to `type: 'scenario'`, have their `phrase` content removed from
both languages, and have their `context['en-US']` rewritten to the approved refined strings. List
below — exact prompt IDs, exact new context strings.

Migration steps per prompt:
1. Add `"type": "scenario"`.
2. Remove the `phrase` field from each entry in `translations` (both `es-ES`/`pt-PT` and `en-US`).
3. Replace `context['en-US']` with the approved refined string below.
4. Keep `response`, `tags`, `difficulty`, `id`, `practiceAsTarget` unchanged.

### Greetings scenarios (5)

**es-greet-017**
```
context.en-US: "You're walking down a narrow street and a few people are blocking the way. You need to get past politely."
```

**es-greet-018**
```
context.en-US: "The metro is packed and your stop is next. You need to work your way to the doors past several people."
```

**es-greet-019**
```
context.en-US: "At a supermarket, the item you want is on a shelf behind another shopper. You need to lean past them to reach it."
```

**es-greet-020**
```
context.en-US: "You've been waiting at your table and need to catch the server's attention without being rude or loud."
```

**es-greet-021**
```
context.en-US: "You accidentally bump into someone on a busy street. You want to apologize quickly as you both keep moving."
```

### Panic scenarios (6)

**es-panic-001**
```
context.en-US: "Someone has just said something to you and you almost understood — you got the gist but missed enough that you can't confidently respond. You need them to say it again."
```

**es-panic-002**
```
context.en-US: "Someone is speaking to you and the speed is too fast to follow. You understand the words individually but they're coming too quickly to process. You need them to slow down."
```

**es-panic-003**
```
context.en-US: "You started a conversation in Spanish and it's gotten beyond your level — you're now lost and need to gracefully signal that your Spanish isn't strong enough to keep up."
```

**es-panic-004**
```
context.en-US: "You followed almost all of what someone said, but there's one specific word you didn't recognize and it's the key to understanding the whole thing. You need to ask what just that word means."
```

**es-panic-005**
```
context.en-US: "Someone is trying to tell you something — a name, an address, a price — and you can't catch it by ear. You need them to write it down so you can see it."
```

**es-panic-006**
```
context.en-US: "Someone has just spoken to you in Spanish and you understood nothing — not a single word landed. You need to acknowledge the situation and ask if they can switch to English."
```

### Restaurant scenario (1)

**pt-rest-009**
```
context.en-US: "You've finished eating and are ready to leave, but the bill hasn't come. In Portugal, waiters generally won't bring the check unsolicited — you have to ask for it."
```

Special case: this prompt currently has the same target-language string in both `phrase` and
`response` (a previous workaround for the missing scenario type). After migration, the `phrase`
fields are removed and only the `response` ("Pode trazer a conta, por favor?" / "Can you bring the
bill, please?") remains. The duplication problem self-resolves.

### Migration script

Write `scripts/migrate-prompt-types.ts` (or extend an existing migration pattern from prior
handoffs). It should:

1. Refuse to run if any of the 12 IDs already has `type: 'scenario'` (idempotency — like prior
   migrations).
2. For each of the 12 IDs, apply the three changes above (add type, strip phrase fields, set new
   context.en-US).
3. Validate every modified prompt against the Part A rules; abort with a clear error if any prompt
   fails validation (e.g. forgot to strip a phrase field).
4. Validate that the count of scenarios after migration is exactly 12; abort if not.
5. Write the updated `prompts.json`.
6. Pre-flight and execute the audio cleanup in Part C (or run it as a separate, clearly-marked step
   immediately after).

Same defensive shape as the original migration script from Handoff 1: validate everything first,
write nothing until all checks pass, abort cleanly with actionable error messages on any
inconsistency.

---

## Part C — Audio cleanup

Scenario prompts must not have target-language **phrase** audio (there's no phrase). Only their
**response** audio remains.

For each of the 12 migrated prompts, delete these files from `public/audio/`:

For each scenario prompt with ID `<id>`, delete:
- `<id>-slow.mp3`
- `<id>-normal.mp3`
- `<id>-fast.mp3`

**Preserve** these (response audio stays):
- `<id>-response-slow.mp3`
- `<id>-response-normal.mp3`
- `<id>-response-fast.mp3`

That's 12 prompts × 3 speeds = **36 phrase audio files to delete**. Total response audio (36 files)
remains untouched.

The migration script should:
- Pre-flight: confirm all 72 expected files exist (36 phrase to delete, 36 response to keep) before
  doing anything. Report missing files and abort if any are missing.
- Then delete the 36 phrase files.
- Report: "Deleted 36 phrase audio files for 12 scenario prompts; 36 response audio files preserved."

The audio generation script (`scripts/generate-audio.ts`) also needs a small update: when iterating
prompts to generate phrase audio for a target language, **skip scenario-type prompts**. The
availability rule becomes: "prompt is drillable for target T if `translations[T]` exists and
`practiceAsTarget !== false`; phrase audio is generated only if `type !== 'scenario'`; response audio
is always generated for drillable prompts (regardless of type)." This ensures the next audio
regeneration doesn't accidentally re-create the deleted phrase files.

---

## Part D — UI rendering branch

Scenario prompts should render differently from conversation prompts. The existing UI is built
around the conversation pattern; scenarios need a focused variant.

### Conversation prompt rendering (unchanged — current behavior)

- "Here's what they said" label
- Target-language phrase (large)
- Native-language phrase (smaller)
- Listen button
- Response card with target-language response, native-language response, and a Listen button for the
  response
- Play Again, Understood / Didn't Get It actions

### Scenario prompt rendering (new)

The scenario UI should look and feel like a distinctly different mode of practice from a conversation
prompt — not a conversation prompt with bits hidden. Reuse none of the audio-related visual vocabulary
of conversation prompts; replace the ear iconography with a scenario-appropriate marker; and remove
the audio-action affordances that don't apply.

**Section header for the situation:**
- Label: **"THE SITUATION"** (replacing "Here's what they said") — same typographic style as the
  conversation header so the visual rhythm of the screen is preserved.
- **Icon: 🎬 clapperboard** (replacing the ear/headphones icon used for the listening label).
  Placed next to the label as part of the section header, treated as pure signage — *not* a button,
  not interactive. It signals "this is a scene being set" with deliberate contrast against the ear
  iconography that signals "you're receiving audio" elsewhere. The icon should appear nowhere else in
  the scenario UI.

**The situation content:**
- The `context` text (resolved via `resolveByNativeLang`) displayed prominently as the primary
  content, where the target-language phrase would have been in conversation mode.
- Style it as narration — italic, slightly softer color than the primary text, or both. Pick a
  treatment consistent with the existing dark theme; don't introduce new color tokens. The goal:
  reading the screen for half a second should tell the learner "this is a situation, not a spoken
  phrase."
- **No Listen button** on the situation. There is no audio for the situation.
- **No icon, no button, no placeholder** in the slot where the conversation prompt's Listen button
  sits. Leave the space empty (or let the layout collapse naturally). Do NOT add a passive visual
  here — it would invite clicks and add no information, since the clapperboard label, the narration
  styling, and the absent Listen affordance already signal the scenario nature redundantly.

**The response card:**
- Label: **"WHAT YOU'D SAY"** (replacing "You could respond"), emphasizing that the response is
  *what's being practiced*, not a reaction.
- Target-language response, native-language response, Listen button on the response — all unchanged
  from conversation mode. (The response *does* have audio, and the learner will use the Listen
  button to hear the model utterance.)
- Gloss rendering on the response (if a gloss exists) — same as conversation mode (existing treatment
  from Handoff 2).

**Action buttons at the bottom:**
- **Hide the "Play Again" button entirely** for scenarios. There is no phrase audio to replay, and a
  Play Again button in its usual location is a muscle-memory trap — learners will click it expecting
  to hear the situation again, get the response audio instead, and be briefly confused. Better to
  remove the button entirely than to leave it doing something unexpected.
- Do NOT replace Play Again with a passive icon or placeholder. The slot should be empty; let the
  layout collapse. (See same reasoning as the empty Listen-slot above.)
- **Keep "Understood" / "Didn't Get It"** unchanged — these still apply (the learner can self-assess
  whether they would have produced the right response).

**Auto-play behavior:**
- Conversation prompts: phrase audio auto-plays on reveal (current behavior, unchanged).
- Scenario prompts: **nothing auto-plays**. The learner reads the situation, formulates a guess in
  their head, and presses Listen on the response when they're ready to hear the model. This
  preserves the production-first nature of scenario practice — the learner doesn't passively receive
  audio, they actively produce a guess first.

Implementation guidance:

- Use two clearly-separated render branches in the practice component based on
  `prompt.type === 'scenario'`, reading from the same data shape. Avoid threading lots of conditionals
  through a single render path — the branches diverge enough (different label, different icon, no
  Listen slot on situation, no Play Again button, different auto-play behavior) that a clean split is
  more readable than nested conditionals.
- Match the existing dark theme tokens and typography; introduce no new color values. The clapperboard
  emoji renders cleanly across platforms; no custom icon asset is needed.

---

## Part E — Verification checklist

Before merging, confirm:

1. **Schema validation passes:** every scenario prompt has no `phrase` field in any `translations`
   entry; every conversation prompt is unchanged.
2. **Count integrity:** exactly 12 prompts have `type: 'scenario'` after migration; total prompt
   count is still 179 (no prompts lost).
3. **The 12 IDs match the spec:** `es-greet-017` through `es-greet-021`, `es-panic-001` through
   `es-panic-006`, `pt-rest-009`. No more, no less.
4. **Context strings match exactly:** spot-check 2–3 migrated context strings against the spec to
   confirm verbatim match.
5. **Audio cleanup correct:** 36 phrase files deleted (12 prompts × 3 speeds); 36 response files
   preserved; no other audio touched. Spot-check by trying to play a deleted file's URL and
   confirming 404, then playing a response file and confirming 200.
6. **Conversation prompts still render and play correctly** — regression check. Pick one from each
   scenario category (restaurant, grocery, etc.) and confirm the existing flow is unchanged.
7. **Scenario prompts render with the new layout:** open one (e.g. es-panic-001), confirm:
   - **"THE SITUATION"** label at the top with a **🎬 clapperboard icon** (not the ear/headphones
     icon used on conversation prompts)
   - The full refined context text is displayed prominently, styled as narration
   - **No Listen button** on the situation, and no passive icon/placeholder in its slot — the space
     is empty
   - Response card displays with target + native + Listen button, labeled **"WHAT YOU'D SAY"**
   - Pressing Listen plays the response audio cleanly
   - **No "Play Again" button** appears anywhere on the scenario reveal — the button slot is empty
   - **Nothing auto-plays** on scenario reveal (regression-check: on a conversation prompt, the
     phrase audio still auto-plays as before)
8. **Audio script regression:** run `generate-es.sh` and `generate-pt.sh` in dry-run mode (or
   inspect their selection logic via a log) — confirm scenario prompts are skipped for phrase
   generation but included for response generation. Don't actually regenerate; just verify the
   selection.
9. **No console errors** on language switch, scenario practice, or conversation practice.

Report: count of scenarios after migration (should be 12), confirmation of the 36 deleted + 36
preserved audio files, and a screenshot of one scenario rendering in the practice UI showing the
clapperboard icon, narrated situation, empty Listen slot, response card with Listen, and absent
Play Again.

---

## Out of scope / future considerations

- A separate "acting prompt" sub-type within scenarios (e.g. distinguishing the meta-panic scenarios
  from situational courtesy scenarios). Both are `type: 'scenario'` for now; if a distinction becomes
  useful later, it can be added as a second-level field. No need to pre-design.
- Cross-direction support for scenarios (e.g. an ES→EN learner version of `es-panic-003`). When EN
  becomes a drillable target, those will be authored as fresh, separate scenario prompts in the
  `en-*` ID series — not derived from existing ES scenarios. The schema already supports this.
- A "your turn to speak" voice-input grading mechanic for scenario responses. Aspirational future
  feature; out of scope here.
