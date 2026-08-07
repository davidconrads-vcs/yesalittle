# Handoff 10 — ES→EN Content Gap (22 prompts)

**Scope:** Close the ES→EN content gap deferred from Handoff 7. Three groups: (1) extend 9 existing
scenarios to English-target, (2) fix 3 prompts whose English was broken as target content, (3) add 12
fresh `en-` prompts authored for a Spanish-native learning English, plus (4) 1 new bidirectional
scenario. No UI/code changes — data + audio only.

**CRITICAL — audio boundary (same as prior handoffs):** CC does all `prompts.json` edits and audio
**deletions**. The human runs generation (needs the ElevenLabs key). CC must NOT call ElevenLabs.

**Branch:** `es-en-gap` from `main`.

---

## Part 0 — Verify current state first

The content below was drafted against a pre-Handoff-5/7 snapshot. Before editing, CONFIRM against
current `prompts.json`:
1. **Highest existing ID per affected category** — the new `en-*` and `es-cafe-016` IDs must not
   collide. Report actual highest for: cafe, greetings, grocery, checkin, tickets, panic. If
   `es-cafe-016` is taken, use the next free number and report it.
2. **The 9 Tier-1 prompt IDs exist** and are `type: "scenario"` with the expected responses.
3. **Nothing keys off the ID prefix** — confirm `es-`/`pt-` prefixes are treated as opaque
   identifiers (no path-building or filtering parses them), since we're introducing an `en-` prefix.
   Flag anything that does.
4. **Audio path scheme for a new `en-` prompt with en-US target** — per Handoff 7, English target
   audio uses the qualified form `{id}-en-US-{speed}.mp3`. Confirm an `en-greet-001` prompt would
   generate `en-greet-001-en-US-{speed}.mp3` cleanly (the doubled "en" is fine if the logic is
   prefix-agnostic). Report the exact filenames it will produce.

Report findings + plan, then proceed.

---

## Part 1 — Tier 1: extend 9 scenarios to English-target

For each: add `es-ES` to `context` (Spanish scenario description below), add
`practiceAsTarget: true` to the `en-US` translation. Existing `es-ES` response untouched.

**es-panic-001** — es-ES context: "Alguien acaba de decirte algo y casi lo has entendido — has pillado la idea general, pero se te han escapado suficientes palabras como para no poder responder con seguridad. Necesitas que te lo repitan."

**es-panic-002** — es-ES context: "Alguien te está hablando demasiado rápido para seguirle. Entiendes las palabras por separado, pero llegan tan seguidas que no te da tiempo a procesarlas. Necesitas que hable más despacio."

**es-panic-004** — es-ES context: "Has seguido casi todo lo que ha dicho alguien, pero hay una palabra concreta que no reconoces y es la clave para entenderlo todo. Necesitas preguntar qué significa solo esa palabra." *(also see Part 2 fix)*

**es-panic-005** — es-ES context: "Alguien intenta decirte algo — un nombre, una dirección, un precio — y no consigues captarlo de oído. Necesitas que te lo escriba para poder verlo."

**es-greet-017** — es-ES context: "Vas por una calle estrecha y hay varias personas bloqueando el paso. Necesitas pasar con educación."

**es-greet-018** — es-ES context: "El metro va lleno y tu parada es la siguiente. Tienes que abrirte paso hasta las puertas entre varias personas."

**es-greet-019** — es-ES context: "En el supermercado, el producto que quieres está en una estantería detrás de otro cliente. Tienes que estirarte por delante de esa persona para alcanzarlo." *(also see Part 2 fix)*

**es-greet-020** — es-ES context: "Llevas un rato esperando en tu mesa y necesitas llamar la atención del camarero sin ser maleducado ni levantar la voz."

**es-greet-021** — es-ES context: "Chocas sin querer con alguien en una calle concurrida. Quieres disculparte rápidamente mientras los dos seguís caminando." *(also see Part 2 fix)*

---

## Part 2 — Fixes to 3 prompts (English broken as target content)

**es-panic-004** — the `[word]` placeholder produces a TTS artifact. Change BOTH languages:
- es-ES response: "¿Qué quiere decir [palabra]?" → **"Perdona, ¿qué significa esa palabra?"**
- en-US response: "What does [word] mean?" → **"Sorry, what does that word mean?"**
- ⚠️ **The es-ES change makes its existing response audio stale** → CC deletes it, human regenerates.

**es-greet-019** — English response is a translation gloss, not an utterance:
- en-US response: "With your permission / Excuse me." → **"Excuse me, can I reach past you?"**
- *(es-ES "Con permiso." unchanged — no ES audio impact.)*

**es-greet-021** — English response mirrors Spanish doubling unnaturally:
- en-US response: "Sorry, I'm sorry." → **"Sorry about that!"**
- *(es-ES "Perdón, lo siento." unchanged — no ES audio impact.)*

---

## Part 3 — 12 fresh `en-` prompts (Spanish-native learning English)

**Structure for ALL of these:**
- New `en-`-prefixed ID, placed in the **existing scenario object** named
- `practiceAsTarget: true` on **`en-US` only** (NOT drillable as Spanish-target)
- `context` authored in **`es-ES`** (Spanish scaffolding). Also include an `en-US` context (English
  translation given) for completeness/fallback.
- `tags` and `difficulty`: mirror the source prompt's where sensible; CC picks reasonable values.

### Panic scenario (`panic`) — `type: "scenario"`, NO phrase field

**en-panic-001**
- es-ES context: "Has empezado una conversación en inglés y se te ha ido de las manos — ahora estás perdido y necesitas indicar con educación que tu inglés no da para tanto."
- en-US context: "You started a conversation in English and it's gotten beyond your level — you're lost and need to gracefully signal your English isn't strong enough."
- en-US response: **"Sorry, my English isn't very good yet."**

**en-panic-002**
- es-ES context: "Alguien te acaba de hablar en inglés y no has entendido nada — ni una sola palabra. Necesitas reconocerlo y preguntar si hay alguien que hable español."
- en-US context: "Someone just spoke to you in English and you understood nothing. You need to acknowledge it and ask if anyone there speaks Spanish."
- en-US response: **"Sorry, I don't understand. Is there someone who speaks Spanish?"**

### Greetings (`greetings`) — `type: "conversation"`

**en-greet-001**
- es-ES context: "El anfitrión o el personal del hotel te da la bienvenida al llegar."
- en-US context: "Host or hotel staff welcoming you on arrival."
- en-US phrase: **"Welcome! Is this your first time here?"**
- en-US response: **"Yes, first time. We're excited to be here."**

**en-greet-002**
- es-ES context: "Un local entabla conversación."
- en-US context: "A local making small talk."
- en-US phrase: **"Where are you from?"**
- en-US response: **"We're from Spain, from Barcelona. Are you from around here?"**

**en-greet-003**
- es-ES context: "Un local comprueba antes de seguir hablando."
- en-US context: "A local checking before continuing."
- en-US phrase: **"Do you speak English?"**
- en-US response: **"A little, yes. I'm learning."**

**en-greet-004**
- es-ES context: "Un local te dice que no puede cambiar de idioma."
- en-US context: "A local telling you they can't switch languages."
- en-US phrase: **"Sorry, I don't speak Spanish."**
- en-US response: **"That's okay, I'll try in English."**

**en-greet-005**
- es-ES context: "Alguien se te acerca en la calle para pedirte ayuda."
- en-US context: "Someone approaching you on the street for help."
- en-US phrase: **"Excuse me, can you help me for a second?"**
- en-US response: **"Sure, though I don't speak much English."**

### Grocery (`grocery`) — `type: "conversation"`

**en-groc-001**
- es-ES context: "El empleado de la charcutería."
- en-US context: "Deli counter worker."
- en-US phrase: **"Morning! What can I get you?"**
- en-US response: **"Can I get half a pound of ham?"**

### Check-in (`checkin`) — `type: "conversation"`

**en-checkin-001**
- es-ES context: "El anfitrión te explica las normas del edificio."
- en-US context: "Host explaining building rules."
- en-US phrase: **"Quiet hours are after ten, so keep it down at night."**
- en-US response: **"Of course, no problem."**

### Tickets (`tickets`) — `type: "conversation"`

**en-tickets-001**
- es-ES context: "El mostrador de información de un museo."
- en-US context: "Museum information desk."
- en-US phrase: **"The next guided tour starts at four."**
- en-US response: **"Are there any tours in Spanish?"**

### Café (`cafe`) — `type: "conversation"`

**en-cafe-001**
- es-ES context: "El barista te toma el pedido."
- en-US context: "Barista taking your order."
- en-US phrase: **"What can I get started for you?"**
- en-US response: **"A latte, please."**

---

## Part 4 — New bidirectional scenario

**es-cafe-016** (or next free number — confirm in Part 0) — in the `cafe` scenario,
`type: "scenario"`, NO phrase field. **Bidirectional: `practiceAsTarget: true` on BOTH languages.**

- en-US context: "You're at a café and want to get online. You need to ask whether they have wifi and get the password."
- es-ES context: "Estás en una cafetería y quieres conectarte a internet. Necesitas preguntar si hay wifi y conseguir la contraseña."
- es-ES response: **"¿Hay wifi? ¿Cuál es la contraseña?"** — `practiceAsTarget: true`
- en-US response: **"Do you have wifi? What's the password?"** — `practiceAsTarget: true`

*(Note: each language uses its own idiomatic form — Spanish "hay", English "do you have" — deliberately
not mirrored.)*

---

## Part 5 — Audio

**CC deletes (stale):**
- es-panic-004 es-ES **response** audio (3 files) — its Spanish text changed in Part 2.
- Nothing else. (es-greet-019 and es-greet-021 changed only `en-US` text, which has no existing audio
  for these prompts — they were never English-target before.)

**CC computes and prints the generation manifest for the human.** Expected shape:
- **English response audio** for the 9 Tier-1 scenarios (scenarios = response only): 9 × 3 = 27
- **English phrase + response** for the 10 fresh conversation prompts (en-greet-001–005, en-groc-001,
  en-checkin-001, en-tickets-001, en-cafe-001): 9 prompts × 2 × 3 = 54
  *(CC: verify the count — 5 greetings + 1 grocery + 1 checkin + 1 tickets + 1 cafe = 9 conversation
  prompts, plus 2 panic scenarios below.)*
- **English response audio** for the 2 fresh panic scenarios: 2 × 3 = 6
- **es-cafe-016**: response audio in BOTH languages: 2 × 3 = 6
- **Regenerate** es-panic-004 es-ES response: 3

CC should compute exact totals from the actual data rather than trusting these estimates, and print
the precise manifest (which prompt, which language, phrase vs response).

**Human runs:** `generate-es.sh` (regenerates es-panic-004, generates es-cafe-016 ES response) and
`generate-en.sh` (all English). Scripts generate only missing audio, so this is just running both.

---

## Part 6 — Verification

1. **Part 0 findings reported** — actual highest IDs confirmed, no prefix-parsing logic, English audio
   path scheme verified for `en-` prompts.
2. **9 Tier-1 extends:** each has `context.es-ES` and `en-US.practiceAsTarget: true`.
3. **3 fixes applied** verbatim (es-panic-004 both languages, es-greet-019 EN, es-greet-021 EN).
4. **12 fresh `en-` prompts** created with correct IDs, in the correct scenario objects, with
   `practiceAsTarget` on en-US ONLY, `context` in both es-ES and en-US, correct type (scenario vs
   conversation), and NO `phrase` field on the 2 scenarios.
5. **es-cafe-016** created, bidirectional (`practiceAsTarget: true` on both languages), scenario type.
6. **Audio:** es-panic-004 ES response deleted; manifest printed.
7. **Regression:** EN→ES and EN→PT learners unaffected — existing es-/pt- content and audio unchanged
   except es-panic-004's intended change. Existing progress intact.
8. **ES→EN learner check:** selecting "I speak Español / I'm learning Inglés" now surfaces the new
   content (the 9 extends + 12 fresh + es-cafe-016) alongside the 66 from Handoff 7.
9. **Build clean, no console errors.** Report new total prompt count.

Report: Part 0 findings, the exact audio manifest, new prompt count, and a screenshot of one fresh
`en-` prompt rendering for an ES→EN learner.
