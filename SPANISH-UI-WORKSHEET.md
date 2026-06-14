# Spanish UI String Worksheet (Handoff 8, Part 8)

~60 strings, peninsular Spanish, informal (tú) register, app-idiomatic rather than literal where it
reads better. **Your job:** flag anything stiff or that you'd phrase differently. Format: `key` —
English (verbatim) → **Spanish draft** [note where useful].

---

## Home

- `home.eyebrow` — "Listening Trainer" → **"Entrenador de escucha"** [English stays "Listening Trainer"; this is just its ES value; rename deferred]
- `home.tagline` — "Understand what locals say — and respond like one." → **"Entiende lo que dicen los locales y responde como uno más."** [tagline — see note below]
- `home.progress` — "📊 Progress" → **"📊 Progreso"**
- `home.i_speak` — "I speak" → **"Hablo"**
- `home.im_learning` — "I'm learning" → **"Estoy aprendiendo"**
- `home.playback_speed` — "Playback Speed" → **"Velocidad de reproducción"**
- `home.session_mode` — "Session Mode" → **"Modo de sesión"**
- `home.mode.full` — "Full Practice" → **"Práctica completa"**
- `home.mode.full_desc` — "All phrases, weighted by progress" → **"Todas las frases, según tu progreso"**
- `home.mode.quick` — "Quick Review" → **"Repaso rápido"**
- `home.mode.quick_desc` — "Previously missed, up to {n}" → **"Las que has fallado, hasta {n}"**
- `home.mode.new` — "New Phrases" → **"Frases nuevas"**
- `home.mode.new_desc` — "Only phrases you haven't seen" → **"Solo las frases que no has visto"**
- `home.scenarios` — "Scenarios (or start with all)" → **"Escenarios (o empieza con todos)"**
- `home.start_practice` — "Start Practice — {n} phrase{s}" → **"Empezar práctica — {n} frase{s}"** [plural: una frase / N frases]
- `home.streak` — "🔥 {streak} day{s}" → **"🔥 {streak} día{s}"** [plural: 1 día / N días]

## SpeedControl

- `speed.slow` — "Slow" → **"Lento"**
- `speed.normal` — "Normal" → **"Normal"** [same in ES]
- `speed.fast` — "Fast" → **"Rápido"**

## Practice

- `practice.exit` — "← Exit" → **"← Salir"**
- `practice.situation` — "The Situation" → **"La situación"**
- `practice.what_youd_say` — "What you'd say" → **"Qué dirías"**
- `practice.you_could_respond` — "You could respond" → **"Podrías responder"**
- `practice.listen_try` — "Listen & try to understand" → **"Escucha e intenta entender"**
- `practice.heres_what` — "Here's what they said" → **"Esto es lo que han dicho"**
- `practice.reveal` — "Reveal Answer" → **"Mostrar respuesta"**
- `practice.didnt_get` — "Didn't Get It" → **"No lo he pillado"** [casual/peninsular; alt: "No lo entendí"]
- `practice.understood` — "Understood ✓" → **"Entendido ✓"**

## SpeakButton

- `speak.playing` — "Playing..." → **"Reproduciendo..."**
- `speak.play_again` — "Play Again" → **"Reproducir otra vez"**
- `speak.listen` — "Listen" → **"Escuchar"**
- ("..." stays "..." — no translation)

## Summary

- `summary.complete` — "Session Complete" → **"Sesión completada"**
- `summary.understood_first` — "understood on first listen" → **"entendidas a la primera"**
- `summary.comprehension` — "{pct}% comprehension" → **"{pct}% de comprensión"**
- `summary.review_these` — "Review these ({n})" → **"Repasa estas ({n})"**
- `summary.retry_missed` — "Retry Missed" → **"Reintentar falladas"**
- `summary.new_session` — "New Session" → **"Nueva sesión"**
- (reuses `practice.situation` / `practice.what_youd_say`)

## Progress

- `progress.back` — "← Back" → **"← Volver"**
- `progress.title` — "Progress" → **"Progreso"**
- `progress.comprehension` — "Comprehension" → **"Comprensión"**
- `progress.day_streak` — "Day Streak" → **"Racha de días"**
- `progress.total_attempts` — "Total Attempts" → **"Intentos totales"**
- `progress.by_category` — "By Category" → **"Por categoría"**
- `progress.not_started` — "Not started" → **"Sin empezar"**
- `progress.weakest` — "Weakest Phrases" → **"Frases más difíciles"** [lit. "weakest" = "más débiles" sounds odd; "más difíciles" (hardest) reads better]
- `progress.reset` — "Reset All Progress" → **"Borrar todo el progreso"**
- `progress.reset_confirm` — "Reset all progress? This cannot be undone." → **"¿Borrar todo el progreso? Esto no se puede deshacer."**

## App (alerts)

- `app.no_new` — "No new phrases in this selection!" → **"¡No hay frases nuevas en esta selección!"**
- `app.no_review` — "No phrases to review!" → **"¡No hay frases para repasar!"**

## Target language names (the "I'm learning" buttons — localized per UI lang)

When UI is Spanish:
- `lang.es-ES` → **"Español"**
- `lang.pt-PT` → **"Portugués"**
- `lang.en-US` → **"Inglés"**

(When UI is English these are "Spanish"/"Portuguese"/"English" — the current values.)

## Native autonyms (the "I speak" buttons — FIXED, not per-UI-language)

- en-US autonym → "English"
- es-ES autonym → "Español"
- (pt-PT autonym → "Português", for when PT-native is added)

## Category names (data-side, localized)

- `restaurant` — "Restaurant" → **"Restaurante"**
- `panic` — "Panic Button" → **"Botón de pánico"**
- `greetings` — "Greetings & Pleasantries" → **"Saludos y cortesías"**
- `grocery` — "Grocery Store" → **"Supermercado"**
- `around` — "Getting Around" → **"Moverse por la ciudad"** [lit. "getting around"; this is the natural ES]
- `checkin` — "Airbnb / Check-in" → **"Airbnb / Llegada"** ["Check-in" is also widely understood in ES; alt: keep "Check-in"]
- `shopping` — "Shopping" → **"Compras"**
- `tickets` — "Activities & Tickets" → **"Actividades y entradas"**
- `pharmacy` — "Pharmacy" → **"Farmacia"**
- `cafe` — "Café & Bar" → **"Café y bar"**

---

## Notes / choices flagged for your review

1. **Tagline** — "Understand what locals say — and respond like one." → "Entiende lo que dicen los
   locales y responde como uno más." I dropped the em-dash for a cleaner ES flow and used "como uno
   más" (like one more of them / like a local) which is idiomatic. Alt more literal: "...y responde
   como uno de ellos." Your ear — does "como uno más" land, or prefer "como un local"?

2. **"No lo he pillado"** (Didn't Get It) — "pillar" is very common peninsular casual for "catch/get
   it," fits the app's friendly tone. If you find it too colloquial, "No lo he entendido" is the
   neutral option. Your call.

3. **"Weakest Phrases"** → "Frases más difíciles" (hardest) rather than literal "más débiles"
   (weakest), which sounds odd applied to phrases in Spanish. Reframes from the phrase's weakness to
   the learner's difficulty — reads more naturally. OK?

4. **"Getting Around"** → "Moverse por la ciudad" (getting around the city). Literal "getting around"
   has no clean ES equivalent; this is the natural phrasing. Alt: "Transporte" (narrower).

5. **"Check-in"** — kept the English "Check-in" alongside "Llegada" since "check-in" is widely used
   in Spanish hospitality. Could also just be "Llegada" or keep "Check-in" fully. Your preference.

6. **"Empezar" vs "Comenzar" vs "Iniciar"** for Start Practice — I used "Empezar" (most common,
   natural, slightly informal). "Comenzar" is a touch more formal; "Iniciar" is more techie. Empezar
   fits the friendly register. OK?

7. **Plurals** — "frase/frases" and "día/días" are both regular +s, so the binary rule works. The
   `pluralize` helper handles these.
