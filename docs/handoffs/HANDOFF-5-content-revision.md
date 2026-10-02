# Handoff 5 — Content Revision (deletions, edits, `around` redesign)

**Scope:** Apply the reviewed content changes to `prompts.json` — three deletions, ~18 response/phrase
edits, one context expansion, one premise flip, and the `around` section redesign (cuts + 6 new
scenario prompts). Plus the audio bookkeeping: delete audio for removed/changed content, and prepare
for regeneration of new/changed audio.

**CRITICAL — audio boundary (read first):** Audio generation requires the ElevenLabs API key, which
CC does not have and the human will supply. Therefore:
- **CC does:** all `prompts.json` edits; all audio file **deletions** (no API key needed); updates to
  any code/scripts. CC does NOT run the audio generation script.
- **The human does:** runs the generation script afterward to produce new/changed audio (needs the
  ElevenLabs key; the human may need to reactivate a paid ElevenLabs month).

So CC's job ends with: data correct, stale/removed audio deleted, and a clear printed list of exactly
which audio files the human needs to regenerate. CC should NOT attempt to call ElevenLabs.

**Branch:** `content-revision` from `main`.

**ID policy:** Deletions leave permanent ID gaps — never renumber surviving prompts (would break audio
paths + progress data). New prompts get new IDs past the section's highest number, never filling gaps.
Non-contiguous IDs are expected and correct.

**Audio rule:** Any change to a `phrase` or `response` in a generated-audio language (es-ES, pt-PT)
makes that string's audio stale. Changed `response` → `-response-{slow,normal,fast}` stale. Changed
`phrase` → `{slow,normal,fast}` stale. en-US-only text changes → no audio impact. CC deletes stale
audio so it can't be served; the human regenerates.

---

## Part 1 — Deletions

Delete these prompts from `prompts.json` (leave ID gaps):

- **pt-rest-006** (bacalhau special — too advanced)
- **es-shop-005** (gift wrapping — too unlikely)
- **pt-greet-014** (good luck — no clear scenario)

For each deleted prompt, delete ALL its audio files from `public/audio/` (these are conversation
prompts → phrase + response, 3 speeds each = 6 files per prompt, 18 total):
- `pt-rest-006-{slow,normal,fast}.mp3`, `pt-rest-006-response-{slow,normal,fast}.mp3`
- `es-shop-005-{slow,normal,fast}.mp3`, `es-shop-005-response-{slow,normal,fast}.mp3`
- `pt-greet-014-{slow,normal,fast}.mp3`, `pt-greet-014-response-{slow,normal,fast}.mp3`

Pre-flight: confirm each file exists before deleting; report any already-missing. (If some are
already absent, note it and continue — not fatal for deletions.)

---

## Part 2 — Response / phrase / context edits

For each, change the specified field(s). Unless noted "en-US only," the es-ES/pt-PT change makes audio
stale → **CC deletes the now-stale audio file(s); human regenerates** (tracked in Part 4).

### es-ES response changes (response audio becomes stale)
- **es-greet-013** — response → `"Venga, hasta luego."` (en-US: "Alright, see you later.")
- **es-tickets-002** — response → `"Vale, cuatro entradas para nosotros."` (en-US: "Okay, four tickets for us.")
- **es-pharm-004** — response → `"Vale, gracias."` (en-US: "Okay, thanks.")
- **es-cafe-008** — response → `"No, eso es todo."` (en-US: "No, that's all.")
- **es-cafe-013** — response → `"¿Nos puedes traer la carta, por favor?"` (en-US: "Can you bring us the menu, please?")
- **es-checkin-005** — response → `"Perfecto, gracias."` (en-US: "Perfect, thanks.")

### pt-PT response changes (response audio becomes stale)
- **pt-pharm-002** — response → `"Está bem, levo esse."` (en-US: "Okay, I'll take it.")
- **pt-tickets-003** — response → `"Está bem, obrigado."` (en-US: "Okay, thanks.")
- **pt-tickets-004** — response → `"Está bem, então precisamos de quatro bilhetes."` (en-US: "Okay, then we need four tickets.")
- **pt-checkin-003** — response → `"Obrigado."` (en-US: "Thanks.")
- **pt-checkin-005** — response → `"Perfeito, obrigado."` (en-US: "Perfect, thanks.")
- **pt-checkin-006** — response → `"Está bem."` (en-US: "Okay.")
- **pt-shop-002** — response → `"Está bem, obrigado."` (en-US: "Okay, thanks.")
- **pt-shop-003** — response → `"Está bem, obrigado."` (en-US: "Okay, thanks.")
- **pt-shop-005** — response → `"Está bem, obrigado."` (en-US: "Okay, thanks.")

### pt-PT phrase change (phrase audio becomes stale)
- **pt-cafe-004** — phrase → `"São quatro e cinquenta, por favor."` (en-US phrase: "That's four fifty, please.")
  — drops the word "euros." Response unchanged.

### Premise flip (both phrase AND response change → both audios stale)
- **pt-pharm-006** —
  - phrase → `"Tem receita do SNS ou é visitante?"` (en-US: "Do you have an SNS prescription, or are you a visitor?")
  - response → `"Sou visitante, pago o preço normal."` (en-US: "I'm a visitor, I'll pay full price.")

### Context expansion (no audio impact)
- **pt-rest-005** — `context['en-US']` → `"The waiter is ready to take your order, but you haven't decided yet."`

### en-US-only changes (NO audio impact — do not delete/regenerate audio)
- **es-cafe-001** — en-US response only → `"A coffee with milk, please."` (es-ES unchanged; "white coffee" is British)
- **es-greet-005** — en-US response only → `"Nice to meet you too!"` (es-ES "¡Encantado, igualmente!" unchanged)

---

## Part 3 — `around` section redesign

### Cuts (delete prompt + all 6 audio files each; leave ID gaps)
- **es-around-007** (Passeig de Gràcia — place-locked)
- **pt-around-003** (Castelo de São Jorge — Lisbon-locked)
- **pt-around-004** (green-line breakdown — too advanced/specific)
- **pt-around-006** (Avenida da Liberdade — Lisbon-locked)
- **pt-around-007** (elétrico 28 — Lisbon-specific)

### Change (response audio becomes stale)
- **es-around-005** — keep phrase `"No puedo parar aquí. ¿Te dejo en la esquina?"` unchanged;
  response → `"Donde sea está bien."` (en-US: "Anywhere is fine.")

### Keep unchanged
- es-around-001, es-around-002, es-around-003, es-around-004, es-around-006
- pt-around-001, pt-around-002, pt-around-005

### New scenario prompts (type: 'scenario'; new IDs; response audio only — needs generation)

Add these as **scenario-type** prompts (per Handoff 4: `type: 'scenario'`, no `phrase` field, situation
in `context`, response is the practiced utterance, response audio only). Add to the `around` scenario.
Each new prompt also needs `tags` and `difficulty` — use `["directions"]` / difficulty 1 unless a
better fit is obvious.

- **es-around-008** (scenario)
  - context.en-US: "You need to find the nearest metro station and want to ask a passerby."
  - translations.es-ES.response: `"¿Dónde está la estación de metro más cercana?"` (practiceAsTarget: true)
  - translations.en-US.response: "Where is the nearest metro station?"
- **es-around-009** (scenario)
  - context.en-US: "You're at a station or stop and want to know when the next train or bus leaves."
  - translations.es-ES.response: `"¿Cuándo sale el próximo tren?"` (practiceAsTarget: true)
  - translations.en-US.response: "When does the next train leave?"
- **es-around-010** (scenario)
  - context.en-US: "Someone pointed you in a direction and you want to know if it's within walking distance."
  - translations.es-ES.response: `"¿Está lejos? ¿Se puede ir andando?"` (practiceAsTarget: true)
  - translations.en-US.response: "Is it far? Can I walk there?"
- **pt-around-008** (scenario)
  - context.en-US: "You need to find the nearest metro station and want to ask a passerby."
  - translations.pt-PT.response: `"Onde fica a estação de metro mais próxima?"` (practiceAsTarget: true)
  - translations.en-US.response: "Where is the nearest metro station?"
- **pt-around-009** (scenario)
  - context.en-US: "You're at a station or stop and want to know when the next train or bus leaves."
  - translations.pt-PT.response: `"Quando sai o próximo comboio?"` (practiceAsTarget: true)
  - translations.en-US.response: "When does the next train leave?"
- **pt-around-010** (scenario)
  - context.en-US: "Someone pointed you in a direction and you want to know if it's within walking distance."
  - translations.pt-PT.response: `"É longe? Dá para ir a pé?"` (practiceAsTarget: true)
  - translations.en-US.response: "Is it far? Can I walk there?"

(Confirm the exact scenario schema shape against an existing scenario prompt — e.g. es-panic-001 — so
these match the structure Handoff 4 established, including the `type` field and no-`phrase` rule.)

---

## Part 4 — Audio bookkeeping (CC produces the list; human regenerates)

CC deletes all **stale** and **removed** audio (no API key needed). CC then prints a precise
**regeneration manifest** for the human — the exact files the human must generate by running the
generation script with the ElevenLabs key.

**CC deletes (stale audio from changed content):**
- Response audio (`-response-{slow,normal,fast}`) for every es-ES/pt-PT response change in Part 2 and
  es-around-005: es-greet-013, es-tickets-002, es-pharm-004, es-cafe-008, es-cafe-013, es-checkin-005,
  pt-pharm-002, pt-tickets-003, pt-tickets-004, pt-checkin-003, pt-checkin-005, pt-checkin-006,
  pt-shop-002, pt-shop-003, pt-shop-005, es-around-005.
- Phrase audio (`{slow,normal,fast}`) for pt-cafe-004 and pt-pharm-006.
- Response audio for pt-pharm-006.
- All audio for deleted prompts (Part 1 + Part 3 cuts) — already covered above.

**CC does NOT delete** any audio for the en-US-only changes (es-cafe-001, es-greet-005) or for unchanged
prompts.

**Regeneration manifest (CC prints this for the human):** the list of prompt IDs (and whether phrase,
response, or both) that need fresh audio:
- Response audio: es-greet-013, es-tickets-002, es-pharm-004, es-cafe-008, es-cafe-013, es-checkin-005,
  pt-pharm-002, pt-tickets-003, pt-tickets-004, pt-checkin-003, pt-checkin-005, pt-checkin-006,
  pt-shop-002, pt-shop-003, pt-shop-005, es-around-005, pt-cafe-004
- Phrase audio: pt-cafe-004, pt-pharm-006
- Response audio (new scenario prompts): es-around-008, es-around-009, es-around-010, pt-around-008,
  pt-around-009, pt-around-010
- Response audio: pt-pharm-006

CC should confirm whether the existing generation script regenerates by detecting
missing-but-expected audio (i.e., generates audio for any drillable string that lacks a file). If so,
the human's regeneration is simply running `generate-es.sh` / `generate-pt.sh` after CC's deletions —
the script will see the deleted files as missing and regenerate exactly those, plus generate the new
scenario prompts' response audio. **CC should verify this is how the script behaves and state it
clearly in the PR**, so the human knows the regeneration is just "run the two scripts."

If the script instead regenerates everything unconditionally, note that too (it's fine, just slower
and uses more ElevenLabs credits).

---

## Part 5 — Verification checklist

CC confirms before handing back:
1. **Three Part-1 deletions** gone from `prompts.json`; their 18 audio files deleted; IDs not renumbered.
2. **All Part-2 edits** applied with exact text from spec; spot-check 3–4 verbatim.
3. **Context expansion** (pt-rest-005) applied.
4. **Premise flip** (pt-pharm-006) applied to both phrase and response.
5. **en-US-only changes** (es-cafe-001, es-greet-005) applied with NO audio deleted.
6. **`around` cuts** (5 prompts) gone + audio deleted; **es-around-005** response changed; **6 new
   scenario prompts** added with correct scenario schema (type, no phrase, response audio only).
7. **Stale audio deleted** per Part 4; en-US-only and unchanged audio untouched.
8. **Regeneration manifest printed** clearly for the human.
9. **App builds and runs**; scenario prompts (including new around ones) render correctly per Handoff
   4's scenario UI; changed prompts show new text.
10. **Prompt count**: started at 179, minus 3 (Part 1) minus 5 (around cuts) plus 6 (new around) =
    **177**. Confirm final count is 177.

**Important:** because audio for changed/new prompts is deleted-but-not-yet-regenerated when CC
finishes, those prompts will have missing audio until the human runs the generation script. This is
expected. CC should note in the PR which prompts will have missing audio pending regeneration, so the
app isn't mistakenly thought broken. The human runs `generate-es.sh` / `generate-pt.sh` (with the
ElevenLabs key) after merging or before final verification.

Report: final prompt count (177), confirmation of deletions + edits + new scenarios, the list of
deleted audio files, and the regeneration manifest for the human to run.
