# Handoff 13 (revised) — Portuguese Content Round

**Supersedes the previous Handoff 13.** If any of that version was applied, revert first — the panic
structure changed (four of the six new prompts became extends of existing prompts).

**Scope:** Close the missing Portuguese panic category (four extends + two new prompts), one
dialogue-logic fix, two placeholder cleanups, and one audio artifact regeneration.

**CRITICAL — audio boundary:** CC does all `prompts.json` edits and audio **deletions**. The human runs
generation (needs the ElevenLabs key). CC must NOT call ElevenLabs.

**Branch:** `pt-content-round` from `main` (fresh, after reverting any prior attempt).

---

## Part 0 — Verify before changing

1. **Confirm panic-001, 002, 004, 005 currently have `es-ES` and `en-US` entries both with
   `practiceAsTarget: true`, and NO `pt-PT` entry.** These are the four being extended.
2. **Confirm the highest existing `panic-` ID** (expected 008, so 009–010 are free for the two new
   prompts). If not, use the next free numbers and report.
3. **Confirm the audio filename for shop-008's artifact** — under the Handoff 11 scheme it should be
   `shop-008-response-pt-PT-normal.mp3`. Verify it exists; report the exact path.
4. **Confirm rest-005 is bidirectional** (`practiceAsTarget: true` on both es-ES and en-US) — this
   determines that BOTH languages' response audio must be regenerated.

Report, then proceed.

---

## Part 1 — Extend four existing panic scenarios to Portuguese

These four panic scenarios are **direction-neutral** — the same speech act regardless of which language
you're learning. They already serve Spanish and English targets. Add Portuguese as a third target
rather than duplicating the prompts.

**For each:** add a `pt-PT` entry to `translations` with the response below and
**`practiceAsTarget: true`**. These are scenarios — **response only, no `phrase` field**. Leave the
existing `es-ES` and `en-US` entries and the `context` untouched (the existing en-US context serves the
English-native learner fine).

- **panic-001** (ask for a repeat) → pt-PT response: **"Pode repetir, por favor?"**
- **panic-002** (slow down) → pt-PT response: **"Pode falar mais devagar, por favor?"**
- **panic-004** (what does that word mean) → pt-PT response: **"Desculpe, o que significa essa palavra?"**
- **panic-005** (write it down) → pt-PT response: **"Pode escrever, por favor?"**

*(panic-003 and panic-006 are NOT extended — they mention the target language ("mi español", "¿Hablas
inglés?") and so are direction-sensitive. Their Portuguese equivalents are the two new prompts below.)*

---

## Part 2 — Two new Portuguese panic scenarios

These are direction-sensitive (they name the language), so they can't share a prompt with their Spanish
counterparts — they're authored fresh.

**Structure for both:**
- New IDs **panic-009** and **panic-010** (confirm free in Part 0), in the existing `panic` scenario
- `type: "scenario"` — **NO `phrase` field**
- `practiceAsTarget: true` on **`pt-PT` only**
- `context` in `en-US` (the learner is English-native learning Portuguese)
- `en-US` translation entry with a `response` (native reference line), **no `practiceAsTarget`**
- `tags`/`difficulty`: mirror panic-003 and panic-006 respectively

**panic-009** *(Portuguese counterpart of panic-003 — "my Portuguese isn't good")*
- context en-US: "You started a conversation in Portuguese and it's gotten beyond your level — you're now lost and need to gracefully signal that your Portuguese isn't strong enough to keep up."
- pt-PT response: **"Desculpe, o meu português ainda não é muito bom."**
- en-US response: "Sorry, my Portuguese isn't very good yet."

**panic-010** *(Portuguese counterpart of panic-006 — understood nothing)*
- context en-US: "Someone has just spoken to you in Portuguese and you understood nothing — not a single word landed. You need to acknowledge the situation and ask if they can switch to English."
- pt-PT response: **"Desculpe, não percebi nada. Fala inglês?"**
- en-US response: "Sorry, I didn't understand. Do you speak English?"

*(Portuguese notes: "Desculpe" throughout matches the register of existing pt-PT content. "não percebi"
is the European Portuguese form — deliberate, consistent with the rest of the pt-PT set.)*

---

## Part 3 — Placeholder cleanups

Bracketed/underscore placeholders produce TTS artifacts (the synthesizer reads brackets or underscores
aloud). Replace with an ellipsis, which TTS renders as a natural trailing pause.

**rest-005** — **bidirectional; both languages' response audio becomes stale.**
- es-ES response: `"Para mí, el/la ___."` → **`"Para mí, el..."`**
  *(also drops the `el/la` gender-choice construct, which TTS reads as "el barra la")*
- en-US response: `"For me, the ___."` → **`"For me, the..."`**

**rest-020** — pt-PT target only.
- pt-PT response: `"Está em nome de [nome]."` → **`"Está em nome de..."`**
- en-US response: `"It's under the name [name]."` → **`"It's under the name..."`**
  *(en-US not drillable here — no audio impact, but keep the text consistent)*

---

## Part 4 — Dialogue-logic fix (tickets-008)

The current phrase is a **statement**, but the response answers an unasked question. Fix by making the
phrase a question so the existing response becomes coherent.

- pt-PT phrase: `"Com o passe turístico tem desconto de vinte por cento."`
  → **`"Tem passe turístico? Tem vinte por cento de desconto."`**
- en-US phrase: `"With the tourist pass you get a twenty percent discount."`
  → **`"Do you have a tourist pass? There's a twenty percent discount."`**
- pt-PT response: `"Tenho sim. Aqui está."` — **unchanged** (now coherent)
- en-US response: `"Yes, I do. Here it is."` — **unchanged**
- context en-US: `"Ticket vendor about tourist pass benefits"`
  → **`"Ticket vendor asking whether you have a tourist pass"`**

**Audio:** pt-PT **phrase** audio becomes stale (3 files). Response audio unchanged — do NOT delete it.

---

## Part 5 — Audio artifact (shop-008)

A TTS generation artifact (audible garbled fragment) is present in shop-008's Portuguese response at
**normal** speed. **No text changes.** Delete the single affected file so it regenerates:

- `shop-008-response-pt-PT-normal.mp3` (confirm exact path in Part 0)

Slow and fast are unaffected — do NOT delete them.

*(Note for the human: TTS artifacts are stochastic, so regeneration should clear it. Listen to the
regenerated file to confirm. If it recurs, something in the text may be triggering it.)*

---

## Part 6 — Audio bookkeeping

**CC deletes (stale):**
- rest-005: es-ES response (3) **and** en-US response (3) — bidirectional
- rest-020: pt-PT response (3)
- tickets-008: pt-PT **phrase** (3) — response untouched
- shop-008: pt-PT response **normal only** (1) — slow/fast untouched

**Total deletions: 13 files.**

**CC prints the generation manifest.** Expected:
- Regenerate: rest-005 (es-ES + en-US response), rest-020 (pt-PT response), tickets-008 (pt-PT phrase),
  shop-008 (pt-PT response normal) — 13 files
- Generate new: pt-PT response audio for the four extended prompts (panic-001, 002, 004, 005) and the
  two new prompts (panic-009, 010) — 6 prompts × 3 speeds = **18 files**
- **Expected total: 31 files** (13 regenerated + 18 new)

CC should compute exact counts from the data rather than trusting this estimate, and print the precise
manifest (prompt, language, phrase vs response, speeds).

**Human runs:** `generate-es.sh`, `generate-pt.sh`, `generate-en.sh` — scripts generate only missing
audio, so this is just running all three.

---

## Part 7 — Verification

1. **Part 0 findings reported** (the four extend targets confirmed, free panic IDs, shop-008 path,
   rest-005 bidirectionality).
2. **Four extends:** panic-001, 002, 004, 005 each have a `pt-PT` entry with `practiceAsTarget: true`,
   response only, no `phrase`. Their existing es-ES/en-US entries and context are unchanged.
3. **Two new prompts:** panic-009, 010 created with correct structure — scenario type, no `phrase`,
   `practiceAsTarget` on pt-PT ONLY, en-US entry present with response and NO `practiceAsTarget`.
4. **Placeholder fixes applied** verbatim. Grep the whole file for remaining `[...]` or `___` patterns
   and **report any others found — do not fix without asking.**
5. **tickets-008:** phrase changed in both languages, response unchanged, context updated.
6. **Audio deletions:** exactly 13 files, matching the list. Confirm shop-008's slow/fast and
   tickets-008's response audio are still present.
7. **Counts:** total prompts 188 → **190**. pt-PT drillable 69 → **75** (4 extends + 2 new).
   es-ES 108 unchanged, en-US 87 unchanged.
8. **EN→PT now shows 10 categories** (was 9) — the panic category appears.
9. **Regression:** EN→ES and ES→EN unaffected except rest-005's response text. Confirm panic-001/002/
   004/005 still work correctly in EN→ES and ES→EN (they gained a target but shouldn't have changed
   behavior in existing directions).
10. **Build clean, no console errors.**

**Note:** after CC finishes, affected prompts have missing audio until the human generates. Expected,
not broken. CC should list which prompts will be silent pending generation.

Report: Part 0 findings, the exact generation manifest, deleted-file list, new counts, and confirmation
that EN→PT now shows 10 categories.
