# Handoff 12 — ES→EN Native Reference Translations (11 prompts)

**Scope:** Add `es-ES` translation blocks to the 11 prompts that are drillable in English but have no
Spanish text — so a Spanish-native learner sees the native-language reference line beneath the English
target. Plus one gloss. **No audio, no code changes, no new prompts.**

**Why this exists:** Handoff 10 authored these prompts English-first with bilingual `context` but only
an `en-US` translation block. The reasoning at the time — "not drillable as Spanish-target, so no
Spanish needed" — conflated two jobs the `es-ES` block does: (1) target content with audio, and (2)
**native reference**, the translation shown beneath the target line. These need (2), not (1). The gap
was invisible until Handoff 11's render fix, because the rendering bug blanked the native line for
*every* ES→EN prompt.

**Branch:** `es-en-reference` from `main`.

---

## The operation (per prompt)

Add an `es-ES` entry to `translations` with the Spanish text below.

**Critically:**
- **Do NOT add `practiceAsTarget`** to these `es-ES` entries. They are reference-only. Adding the flag
  would make them drillable as Spanish-target content and trigger audio generation — neither is wanted.
- **Do NOT generate or delete any audio.** This handoff has zero audio impact.
- `context` already exists in both languages on all 11 — leave it alone.
- The 2 scenarios (`panic-007`, `panic-008`) have no `phrase` field. Their `es-ES` entry gets a
  `response` only, matching the scenario schema.

---

## Part 1 — Scenarios (response only)

**panic-007**
```json
"es-ES": { "response": "Perdona, mi inglés todavía no es muy bueno." }
```

**panic-008**
```json
"es-ES": { "response": "Perdona, no entiendo. ¿Hay alguien que hable español?" }
```

---

## Part 2 — Conversations (phrase + response)

**greet-037**
```json
"es-ES": {
  "phrase": "¡Bienvenidos! ¿Es su primera vez aquí?",
  "response": "Sí, la primera vez. Estamos encantados de estar aquí."
}
```

**greet-038**
```json
"es-ES": {
  "phrase": "¿De dónde son?",
  "response": "Somos de España, de Barcelona. ¿Usted es de aquí?"
}
```

**greet-039**
```json
"es-ES": {
  "phrase": "¿Habla inglés?",
  "response": "Un poco, sí. Estoy aprendiendo."
}
```

**greet-040**
```json
"es-ES": {
  "phrase": "Lo siento, no hablo español.",
  "response": "No pasa nada, lo intento en inglés."
}
```

**greet-041**
```json
"es-ES": {
  "phrase": "Perdone, ¿me puede ayudar un momento?",
  "response": "Claro, aunque no hablo mucho inglés."
}
```

**groc-025**
```json
"es-ES": {
  "phrase": "¡Buenos días! ¿Qué le pongo?",
  "response": "¿Me pone media libra de jamón?"
}
```

**checkin-015**
```json
"es-ES": {
  "phrase": "A partir de las diez hay que guardar silencio, así que no hagan ruido por la noche.",
  "response": "Claro, no hay problema."
}
```

**tickets-013**
```json
"es-ES": {
  "phrase": "La próxima visita guiada empieza a las cuatro.",
  "response": "¿Hay visitas en español?"
}
```

**cafe-020**
```json
"es-ES": {
  "phrase": "¿Qué le preparo?",
  "response": "Un latte, por favor."
}
```

---

## Part 3 — One gloss (groc-025)

`groc-025`'s English uses a US measure ("half a pound") unfamiliar to a Spanish learner. Add a gloss
explaining it.

**Placement:** inside the **`en-US`** translation entry (the entry holds the content being explained;
the gloss key is the native language of the reader who needs it). This matches the existing pattern —
check the cortado prompt (`cafe-006`), whose gloss sits in its `es-ES` entry keyed `en-US`. Match that
structure exactly.

```json
"gloss": {
  "es-ES": "Media libra son unos 225 gramos. En Estados Unidos se pide la charcutería por libras, no por gramos."
}
```

**Spanish-only, deliberately.** No `en-US` gloss entry — it would be unreachable, since seeing it would
require an English native learning English, which the app will never support.

---

## Part 4 — Verification

1. **All 11 have an `es-ES` translation block** with the exact text above (spot-check 3 verbatim).
2. **None of the new `es-ES` entries has `practiceAsTarget`.** Confirm programmatically — this is the
   check that matters most, since adding it would silently create 11 undrillable-but-flagged prompts
   expecting audio that doesn't exist.
3. **Drillable counts unchanged:** es-ES and pt-PT counts identical to before; en-US unchanged at 87.
   Total prompts still 188. (This handoff adds no drillable content — only reference text.)
4. **Zero audio changes:** file count in `public/audio/` identical before and after; no files added,
   deleted, or renamed.
5. **`groc-025` gloss** present, in the `en-US` entry, keyed `es-ES`, matching the `cafe-006` pattern.
6. **Experiential check (required — not just structural):** run an ES→EN session and confirm the
   Spanish reference line now appears beneath the English phrase and response for these 11 prompts.
   Previously they rendered blank. Confirm at least 3 of the 11 visually, including one scenario
   (`panic-007` or `panic-008`, which show a response line only) and `groc-025` (confirm the gloss
   renders).
7. **Regression:** EN→ES and EN→PT unchanged.
8. **Build clean, no console errors.**

Report: confirmation of the 11 blocks, the `practiceAsTarget` check result, audio file count
before/after, and a screenshot of one of the previously-blank prompts now showing its Spanish line.
