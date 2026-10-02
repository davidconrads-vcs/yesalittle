# Handoff 9 — Rename "Listening Trainer" → "Travel Situation Trainer"

**Scope:** Replace the eyebrow label "Listening Trainer" with **"Travel Situation Trainer"** (Spanish:
**"Entrenador de situaciones de viaje"**). Small change, but do a codebase sweep FIRST so we catch
every occurrence and decide per-location which to change. The in-app eyebrow definitely changes; the
SEO/meta/JSON-LD occurrences are a human decision after the sweep.

**Branch:** `rename-eyebrow` from `main`.

---

## Part 1 — Sweep first (report, don't change yet)

Grep the entire codebase (and index.html, and prompts.json, and any config) for **"Listening Trainer"**
and the standalone word **"listening"** (case-insensitive). Report EVERY occurrence with its file +
line + surrounding context, grouped by type:

- **In-app chrome** (the string table — `home.eyebrow` in `src/i18n/strings.ts`, en-US value).
- **SEO/share-facing** (index.html: `<title>`, `<meta name="description">`, OG tags, Twitter tags).
- **Structured data** (index.html JSON-LD WebApplication: name, description, any "listening" mention).
- **Anywhere else** (README, comments, component literals the i18n extraction might have missed, alt
  text, etc.).

Do NOT change anything yet — report the full list. The human decides per-location (below).

---

## Part 2 — The definite change: in-app eyebrow

In `src/i18n/strings.ts`:
- `home.eyebrow` en-US: "Listening Trainer" → **"Travel Situation Trainer"**
- `home.eyebrow` es-ES: (currently "Entrenador de escucha" or similar) → **"Entrenador de situaciones de viaje"**

This is the one intentional English string change. Everything else in the en-US table stays verbatim.

---

## Part 3 — Per-location decisions (human decides after Part 1 sweep)

For each NON-chrome occurrence the sweep finds (SEO title, meta description, OG, JSON-LD, etc.), the
human will decide: change to "Travel Situation" framing for consistency, OR keep "listening" (it's a
legit SEO keyword people search). Default posture if unsure: **keep SEO/meta "listening" references**
(crawler-facing, keyword value) unless the human says otherwise. CC applies the human's per-location
calls in this part. Do NOT change SEO/meta without the human's explicit say-so per location.

---

## Part 4 — Regression check (NOTE: baseline shifts)

Handoff 8 established "English pixel-identical, no exceptions." **This handoff deliberately changes ONE
string** (the eyebrow), plus whatever SEO/meta the human approves in Part 3. So the check flips:

- Screenshot-diff English vs. main: the **ONLY** in-app change should be the eyebrow text ("Listening
  Trainer" → "Travel Situation Trainer") on the Home screen. Every other string, every other screen
  (Practice, Summary, Progress) must remain pixel-identical.
- Confirm no unintended changes crept in. The eyebrow is expected to differ; nothing else is.
- Spanish: confirm the Spanish eyebrow now reads "Entrenador de situaciones de viaje" and the rest of
  the Spanish UI is unchanged.

---

## Part 5 — Verification

1. Sweep report delivered (Part 1) and human's per-location decisions applied (Part 3).
2. In-app eyebrow: "Travel Situation Trainer" (en) / "Entrenador de situaciones de viaje" (es).
3. Screenshot-diff: ONLY the eyebrow differs in English; all other screens/strings pixel-identical.
4. Spanish UI: eyebrow updated, rest unchanged.
5. Build clean, no console errors, 176 prompts, no audio/prompt-content changes.
6. The i18n fallback still holds (no missing keys, no raw keys rendered).

Report: the full sweep results, which per-location changes were applied vs. left, the eyebrow
screenshot in both languages, and confirmation that nothing else changed.

---

## Note
This is the rename we deferred during Handoff 8 (kept "Listening Trainer" then to keep that handoff's
regression check clean). Now that i18n exists, the rename is a 2-entry table edit plus the optional
SEO sweep — exactly the "trivial future rename" Handoff 8 was built to enable.
