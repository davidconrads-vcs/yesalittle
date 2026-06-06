
## Part 3 — Deferred: EN-target authoring notes (do NOT act now)

When EN becomes a drillable target, the work is a **sort**, not a wholesale re-authoring. Go through
each existing prompt and decide:

- **(a) Extend the existing prompt** — add an `en-US` target entry (with `practiceAsTarget: true` and
  generated en-US audio) to the existing prompt. Do this when the content is **direction-neutral** —
  the same speech act in the same situation regardless of who's learning, and it translates naturally.
  Most transactional content qualifies: "¿Quieres bolsa?" / "Do you want a bag?", "¿Para beber?" /
  "To drink?", checkout/grocery/restaurant basics. These do NOT need new prompts — they extend cleanly.
  *(Caveat: extending still requires a naturalness check on the added en-US text — see the audit below.
  It's "add the translation, confirm it's natural," not zero work, but far less than fresh authoring,
  and it keeps related content unified in one record.)*

- **(b) Author a fresh `en-*` prompt** — only when the content is **direction-sensitive**: it mentions
  the target language ("my Spanish is bad"), references a location ("Welcome to Barcelona"), or is
  culturally locked to one direction. These can't be reused by inverting; the EN-target version is a
  different phrase for a different situation, written from the new learner's perspective.

The lists below identify the **(b)** cases (need fresh authoring) and the **NA** cases (no EN
equivalent needed). Everything NOT listed below is presumed an **(a)** case — direction-neutral,
extend the existing prompt with an en-US target. This is the bulk of the content.

### (b) Need fresh EN-target prompt (language/country/place mention, or no clean US mapping)
- es-panic-003 (mentions Spanish), es-panic-006 (mentions English)
- es-greet-004 (Welcome to Barcelona — location), es-greet-006 (US/Colorado mention),
  es-greet-007/008/009/010 (language mentions)
- pt-greet-003 (Portugal), pt-greet-009/010/012/016 (language mentions)
- es-tickets-003 (tours in English), es-cafe-001 (café con leche → no single US equivalent)
- pt-cafe-001 (PT-specific items: meia de leite, pastel de nata, tosta mista)
- pt-checkin-001 ("Check-in is from..." reads awkward in EN; needs native EN phrasing)
- pt-groc-003 (NIF — Portugal-specific tax ID)

### NA for EN target (no equivalent needed — leave as ES/PT-only)
- es-greet-016 (Catalan-specific)
- es-rest-004 (terrace seating — US says inside/outside), es-rest-006 (tap water assumed in US),
  es-rest-007 (olives/bread starter uncommon in US), es-rest-010/011 (set menu / courses uncommon
  in US), es-rest-018 (terrace surcharge)
- pt-rest-004 (still water assumed in US)
- es-cafe-004 (tapas), es-cafe-006 (cortado clarification), es-cafe-010 (pay at bar uncommon in US)
- pt-tickets-002 (tourist-pass pricing — uncommon in US; marginal for ES too)

### (a) Everything else — extend with en-US target
Not enumerated (it's the majority). When building EN target, walk every prompt NOT in the (b) or NA
lists and add an `en-US` target entry to the existing prompt record, with a naturalness check on the
text. These stay as single prompts carrying multiple targets — the schema's multi-target capability
used as intended.

### EN-target naturalness audit (systematic, when building EN target)
- Audit ALL en-US text that becomes a drilled target for American naturalness — the stiff-literal
  "likewise/igualmente" pattern appears in es-greet-005, es-greet-013, es-greet-014, pt-greet-015 and
  likely others. When EN is a target, every English string being promoted to target (not just flagged
  ones) needs a naturalness pass before its audio is generated.

### The principle (for reference)
- **Share one prompt across multiple targets** when the content is direction-neutral and translates
  naturally (the (a) case — most transactional content). This is the multi-target schema capability
  used as designed; leverage it.
- **Author separate prompts** when the content is direction-sensitive (the (b) case). The test, per
  prompt: "Is this the same speech act in the same situation regardless of who's learning, and does it
  translate cleanly?" Yes → extend. No → author fresh.

---

## Handoff 7 — deferred items (logged when the ES→EN pair shipped)

Handoff 7 activated the ES→EN pair by extending 66 direction-neutral prompts (the (a) set) with
Spanish `context` + a drillable `en-US` target. The items below were **excluded from that release**
and are logged here for the fresh-authoring round (per the (b)/NA distinction above).

### FRESH-author for EN (direction-sensitive — author separate en-* content later)
- **es-groc-001** — units: grams → half pound (US customary)
- **es-groc-006** — currency: euros → dollars
- **es-checkin-006** — noise-rule framing: neighbors → time-based (US "quiet hours")
- **es-cafe-009** — wifi premise: assumes US shops have wifi

### NA for EN target (stay ES-only — no clean EN equivalent)
- **es-groc-010** — weigh-produce (self-weigh stations uncommon in US)
- **es-groc-015** — contactless-or-chip prompt
- **es-around-006** — validate-ticket (ticket validation uncommon in US transit)
- **es-pharm-005** — find-a-doctor via pharmacist (role differs in US)

These are in addition to the original (b)/NA lists above.
