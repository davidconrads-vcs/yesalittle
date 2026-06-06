# Handoff 7 — ES→EN Pair (content + activation + translate-protection)

**Scope:** Activate the first English-as-target pair — Spanish speakers learning English (ES→EN) — by
(1) extending 66 direction-neutral prompts with Spanish `context` + making English drillable, (2) applying
approved English naturalness fixes, (3) three live-product content fixes, (4) activating `es-ES` in
`SUPPORTED_NATIVES`, (5) adding English audio generation, and (6) protecting learning content from browser
auto-translate. Built on Handoff 6's native-picker infrastructure — selecting "I speak Spanish" already
flows through state; this handoff gives it real content.

**CRITICAL — audio boundary (same as Handoff 5):** Audio generation needs the ElevenLabs API key (human-only).
CC does all data/code edits + audio DELETIONS. The human runs generation scripts. CC must NOT call ElevenLabs.

**Branch:** `es-en-pair` from `main`.

**ID policy:** deletions leave permanent gaps; never renumber. **Audio rule:** changed es-ES/pt-PT
phrase/response → regenerate that audio; new English target audio → generate; en-US-only changes to text
that ISN'T yet a generated target → (becomes generated now, see Part 4).


---

## Part 0 — Confirm current state before implementing

Before editing, CC should locate and report:
1. How `context` is rendered and resolved (confirm `resolveByNativeLang` pulls `context[native]` with fallback).
2. The audio generation script structure — how `generate-es.sh`/`generate-pt.sh` and `generate-audio.ts` are
   parameterized by language; what's needed to add an English (`en-US`) target voice + `generate-en.sh`.
3. The component(s) that render the learning content (phrase text, response text) — for the `translate="no"`
   protection in Part 6. Identify every render site (Practice, Summary, Progress per prior handoffs).
4. `SUPPORTED_NATIVES` (from Handoff 6) — confirm adding `es-ES` is the one-line activation.
5. Confirm en-US currently has NO generated audio (English has been native-anchor only) — so adding English
   target audio is all-new generation, not regeneration.
Report, propose plan, then proceed.


---

## Part 1 — Extend 66 prompts to ES→EN

For each of the 66 prompts below: **(a)** add an `es-ES` key to the prompt's `context` object with the
Spanish string given; **(b)** add `"practiceAsTarget": true` to the `en-US` translation entry (so English
becomes drillable); **(c)** if the prompt appears in Part 2, apply the English text fix. Do NOT change the
es-ES phrase/response (those remain the Spanish-target content for EN→ES learners).

The English `phrase`/`response` already present in `en-US` becomes the ES→EN target content. Format below:
`prompt-id` → ES context to add.

- **es-around-001** → `"es-ES": "Alguien te da indicaciones."`
- **es-around-002** → `"es-ES": "Después de preguntar a qué distancia está algo."`
- **es-around-003** → `"es-ES": "El taxista cuando te subes."`
- **es-around-004** → `"es-ES": "El taxista calcula el tiempo del viaje."`
- **es-around-005** → `"es-ES": "El taxista cerca de tu destino."`
- **es-cafe-002** → `"es-ES": "El barista aclara tu pedido de café."`
- **es-cafe-003** → `"es-ES": "Un barista o empleado de comida rápida."`
- **es-cafe-005** → `"es-ES": "El camarero confirma tu pedido."`
- **es-cafe-007** → `"es-ES": "El barista pregunta por la temperatura de la leche."`
- **es-cafe-008** → `"es-ES": "El barista después de preparar tu bebida."`
- **es-cafe-011** → `"es-ES": "El barista te dice el total."`
- **es-cafe-012** → `"es-ES": "El barista cuando has pedido varias rondas."`
- **es-cafe-013** → `"es-ES": "El camarero te avisa de algo."`
- **es-cafe-014** → `"es-ES": "El camarero en un bar de cervezas artesanales."`
- **es-cafe-015** → `"es-ES": "El camarero pregunta por el tamaño de la cerveza."`
- **es-checkin-001** → `"es-ES": "El anfitrión te recibe a tu llegada."`
- **es-checkin-002** → `"es-ES": "El anfitrión te enseña el piso."`
- **es-checkin-003** → `"es-ES": "El anfitrión te explica el piso."`
- **es-checkin-004** → `"es-ES": "El anfitrión antes de marcharse."`
- **es-checkin-005** → `"es-ES": "El anfitrión explica las normas de la casa."`
- **es-checkin-007** → `"es-ES": "El anfitrión pregunta por la hora de salida."`
- **es-greet-001** → `"es-ES": "Un tendero, camarero o vecino te saluda."`
- **es-greet-002** → `"es-ES": "Un empleado te saluda por la mañana."`
- **es-greet-003** → `"es-ES": "Un local te saluda de manera informal."`
- **es-greet-005** → `"es-ES": "Al conocer a alguien por primera vez."`
- **es-greet-011** → `"es-ES": "Alguien intenta pasar a tu lado en un sitio estrecho."`
- **es-greet-012** → `"es-ES": "Después de que des las gracias por la ayuda."`
- **es-greet-013** → `"es-ES": "Un tendero o local se despide amablemente."`
- **es-greet-014** → `"es-ES": "Un tendero o vecino se despide al final de la semana."`
- **es-greet-015** → `"es-ES": "Un desconocido comenta sobre el tiempo."`
- **es-groc-002** → `"es-ES": "En cualquier mostrador o caja."`
- **es-groc-003** → `"es-ES": "El cajero en la caja."`
- **es-groc-004** → `"es-ES": "El cajero te dice el total."`
- **es-groc-005** → `"es-ES": "El cajero del supermercado."`
- **es-groc-007** → `"es-ES": "En la charcutería, para queso o jamón."`
- **es-groc-008** → `"es-ES": "Cuando preguntas por un producto."`
- **es-groc-011** → `"es-ES": "El cajero después de pagar."`
- **es-groc-013** → `"es-ES": "En la charcutería, para el queso."`
- **es-groc-014** → `"es-ES": "El datáfono en la caja."`
- **es-pharm-001** → `"es-ES": "El farmacéutico te saluda."`
- **es-pharm-002** → `"es-ES": "El farmacéutico pregunta para quién es."`
- **es-pharm-003** → `"es-ES": "El farmacéutico comprueba antes de recomendar."`
- **es-pharm-004** → `"es-ES": "El farmacéutico explica la dosis."`
- **es-pharm-006** → `"es-ES": "El farmacéutico sugiere una alternativa."`
- **es-rest-001** → `"es-ES": "La anfitriona te recibe en la puerta."`
- **es-rest-002** → `"es-ES": "La anfitriona en un restaurante concurrido."`
- **es-rest-003** → `"es-ES": "La anfitriona cuando el restaurante está lleno."`
- **es-rest-005** → `"es-ES": "El camarero toma tu pedido."`
- **es-rest-008** → `"es-ES": "El camarero revisa cómo va tu mesa."`
- **es-rest-009** → `"es-ES": "El camarero al terminar de comer."`
- **es-rest-012** → `"es-ES": "El camarero cuando lo que pediste no está disponible."`
- **es-rest-013** → `"es-ES": "El camarero trae la comida."`
- **es-rest-014** → `"es-ES": "El camarero cuando parece que has terminado."`
- **es-rest-015** → `"es-ES": "El camarero pregunta cómo dividir la cuenta."`
- **es-rest-016** → `"es-ES": "El camarero cuando el datáfono no funciona."`
- **es-rest-017** → `"es-ES": "El camarero pregunta por el pedido de los niños."`
- **es-shop-001** → `"es-ES": "El dependiente te saluda."`
- **es-shop-002** → `"es-ES": "El dependiente de una tienda de ropa."`
- **es-shop-003** → `"es-ES": "El dependiente te indica el camino."`
- **es-shop-004** → `"es-ES": "El dependiente sobre un artículo."`
- **es-shop-006** → `"es-ES": "El dueño de una tienda pequeña."`
- **es-tickets-001** → `"es-ES": "La taquilla de una atracción."`
- **es-tickets-002** → `"es-ES": "El taquillero explica los precios."`
- **es-tickets-004** → `"es-ES": "El guardia de un museo."`
- **es-tickets-005** → `"es-ES": "Un cartel o el personal de una atracción."`
- **es-tickets-006** → `"es-ES": "El personal de una atracción popular."`


---

## Part 2 — English naturalness fixes (target-language quality)

These en-US strings are corrected for natural American English (they become target content the learner
acquires). Apply to the `en-US` translation. **These become generated English audio in Part 4**, so the
final text must be correct before generation.

- **es-around-005** phrase: "I can't stop here. Shall I drop you at the corner?" → **"I can't stop here. Can I drop you at the corner?"**
- **es-cafe-007** phrase: "The milk hot, warm, or cold?" → **"Hot, warm, or cold milk?"**
- **es-cafe-012** phrase: "Shall I charge you for everything together?" → **"Should I charge everything together?"**
- **es-checkin-003** phrase: "The wifi is this one and the password is on the fridge." → **"The wifi and password are on the fridge."**
- **es-checkin-004** response: "OK, perfect. Many thanks." → **"OK, perfect. Thanks so much."**
- **es-greet-003** phrase: "How's it going? All good?" → **"How's it going?"**
- **es-greet-012** phrase: "You're welcome, that's what we're here for." → **"You're welcome, no problem."**
- **es-greet-014** response: "Likewise! Have a good weekend!" → **"You too! Have a good weekend!"**
- **es-groc-003** response: "Yes, a bag, please." → **"Yes, one bag please."**
- **es-pharm-003** phrase: "Does he/she have any allergies?" → **"Do they have any allergies?"**
- **es-rest-005** phrase: "What will you have?" → **"What can I get you?"**
- **es-rest-012** response: "Yes, we need a moment please" → **"Yes, we need a moment, please."**
- **es-tickets-005** phrase: "It's closed today for a holiday. We open tomorrow at ten." → **"We're closed today for a holiday. We open tomorrow at ten."**
- **es-tickets-006** response: "Yes, I have the booking here." → **"Yes, I have the reservation here."**


---

## Part 3 — Live-product content fixes (apply regardless of EN-target)

These fix existing issues in the ES content and affect ES audio. They are independent of EN-target but
bundled here.

- **es-groc-009** — **CUT** (redundant with es-groc-003, which is already "¿Quieres bolsa?"/"Do you want a
  bag?"). Delete the prompt (leave ID gap) and its 6 audio files (es-ES phrase+response, 3 speeds). *Note:
  since es-groc-009 is being cut, it is NOT in the Part 1 extend set.*
- **es-groc-012** — **FIX ES BUG.** Current es-ES phrase "Son tres euros la bolsa." → **"Son quince céntimos
  la bolsa."**; en-US phrase "The bag is three euros." → **"The bag is fifteen cents."** (3 euros implausible).
  Regenerate es-ES phrase audio. *Excluded from EN-target this release (currency); not in Part 1 set.*
- **es-groc-014** — **FIX stage-direction response.** Current response (both langs) is "— (just enter PIN) —",
  a non-utterance that doesn't scale. Change es-ES response → **"Vale."**, en-US response → **"Okay."**
  Regenerate es-ES response audio. *(es-groc-014 IS in the Part 1 extend set — it gets ES context + English
  target too.)*


---

## Part 4 — Activate es-ES native + English target audio

**4a — Activate Spanish native:** add `es-ES` to `SUPPORTED_NATIVES` (+ `NATIVE_META` label/flag, mirroring
Handoff 6's en-US entry). This makes "I speak Spanish" selectable with real content behind it. With es-ES
native + en-US target, the pair is `es-ES::en-US`; `resolveByNativeLang` pulls the Spanish `context` authored
in Part 1.

**4b — English target audio generation (CC adds support; HUMAN runs):**
- Add an English voice to the generation config (CC picks/wires an appropriate ElevenLabs English voice id;
  human can override).
- Add `generate-en.sh` mirroring `generate-es.sh`/`generate-pt.sh`, targeting `en-US`.
- Update `generate-audio.ts` so en-US is a generable target: generate phrase+response audio for every prompt
  where `translations['en-US']` exists and `practiceAsTarget === true` and (for phrase) type !== 'scenario'.
- **CC does NOT run it.** CC prints the manifest: English audio needed for all 66 Part-1 prompts (phrase +
  response, 3 speeds each, conversation prompts) — the human runs `generate-en.sh` with the key.
- Naming: English audio follows the same per-id scheme as es/pt (the audio path derives from prompt id +
  target lang; confirm the path scheme accommodates a third target without collision).


---

## Part 5 — Audio bookkeeping

**CC deletes (es-ES, stale/removed):**
- es-groc-009: all 6 files (cut).
- es-groc-012: es-ES phrase audio (3) — bug fix regeneration.
- es-groc-014: es-ES response audio (3) — fix regeneration.

**Human regenerates (ES) after CC:** es-groc-012 phrase, es-groc-014 response (run generate-es.sh).

**Human generates (EN, all new):** English phrase+response for the 66 Part-1 prompts (run generate-en.sh).
CC prints the full English manifest. Until generation runs, English-target prompts have no audio — expected.


---

## Part 6 — Protect learning content from browser auto-translate

Browser auto-translate (Chrome/Safari "always translate to <lang>") operates on rendered DOM and cannot
tell UI chrome from study content. A Spanish speaker with always-translate-to-Spanish on would have the
English they're studying silently translated to Spanish — destroying the learning purpose. The reverse harms
EN→ES learners too. Protect the learning content regardless of direction.

- Add `translate="no"` (and/or `class="notranslate"`) to every element that renders **learning content**:
  the target `phrase` text and the `response` text (and the scenario response). Apply at every render site
  identified in Part 0 (Practice, Summary, Progress).
- Do NOT add it to UI chrome (labels, buttons) — that stays translatable (full chrome i18n is a future
  handoff). The point is to protect ONLY the study material.
- This protects the common case (Chrome/Safari auto-translate). It's the widely-honored standard; note in the
  PR that it's not a hard guarantee against every translation tool, but covers the real risk (a learner with
  browser auto-translate enabled).


---

## Part 7 — CONTENT-NOTES update (deferred items)

Append to CONTENT-NOTES.md (the EN-target authoring doc) the items deferred from this release, for the
fresh-authoring round:
- **FRESH-author for EN** (direction-sensitive, author separate en-* content later): es-groc-001 (units:
  grams→half pound), es-groc-006 (currency: euros→dollars), es-checkin-006 (noise-rule framing: neighbors→
  time-based), es-cafe-009 (wifi premise: US shops have wifi).
- **NA for EN** (stay ES-only, no EN equivalent): es-groc-010 (weigh-produce), es-groc-015 (contactless-or-
  chip), es-around-006 (validate-ticket), es-pharm-005 (find-a-doctor via pharmacist).
- Plus the original (b)/NA lists already in CONTENT-NOTES.


---

## Part 8 — Verification checklist

1. **66 prompts extended:** each has `context.es-ES` added and `en-US.practiceAsTarget: true`. Spot-check 4–5.
2. **English fixes applied:** the 14 Part-2 corrections present verbatim. Spot-check 3.
3. **Live fixes:** es-groc-009 cut (ID gap, 6 audio deleted); es-groc-012 ES+EN phrase fixed; es-groc-014
   response fixed both langs.
4. **es-ES native active:** `SUPPORTED_NATIVES` includes es-ES; "I speak Spanish" selectable; selecting it
   shows Spanish `context` on the 66 prompts and English phrase/response as the drill target.
5. **English audio support:** `generate-en.sh` exists, `generate-audio.ts` handles en-US target, path scheme
   accommodates English without collision. (Do NOT run — verify wiring only.)
6. **Audio deletions correct:** es-groc-009 (6), es-groc-012 phrase (3), es-groc-014 response (3) deleted;
   nothing else touched. English manifest printed for human.
7. **Translate-protection:** learning-content elements (phrase/response) carry translate="no"/notranslate at
   all render sites; UI chrome does NOT. Verify by enabling browser auto-translate on a test load — study
   content stays English, chrome may translate.
8. **Regression — EN→ES and EN→PT unchanged:** existing English-native learners see no change; their progress
   intact; es-ES/pt-PT content and audio unchanged (except the 3 live fixes).
9. **Build clean; no console errors** on native switch, target switch, practice, progress.
10. **Count:** 177 − 1 (es-groc-009 cut) = **176 prompts**.

Report: Part-0 summary, confirmation of 66 extends + 14 fixes + 3 live fixes + es-ES activation, deleted-audio
list, the English generation manifest for the human, and a screenshot of an ES→EN prompt (Spanish context,
English target, translate-protected).
