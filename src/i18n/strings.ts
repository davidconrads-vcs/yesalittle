// UI string tables, keyed by UI language (= the selected native language).
//
// REGRESSION-CRITICAL: the 'en-US' values are verbatim copies of the literals that
// were previously hardcoded in the components. Do NOT normalize punctuation — the
// em-dash (—), straight apostrophes ('), the checkmark (✓), literal "..." and emoji
// prefixes are all intentional and must render pixel-identically for EN users.
//
// 'es-ES' is intentionally empty for now: t() falls back to en-US, so the system is
// fully testable before the reviewed Spanish worksheet is populated (Handoff 8 Part 8).

export type UIStrings = Record<string, string>

const EN: UIStrings = {
  // ── Home ────────────────────────────────────────────────────────────────────
  'home.eyebrow': 'Travel Situation Trainer',
  'home.tagline': 'Understand what locals say — and respond like one.',
  'home.progress': '📊 Progress',
  'home.i_speak': 'I speak',
  'home.im_learning': "I'm learning",
  'home.playback_speed': 'Playback Speed',
  'home.session_mode': 'Session Mode',
  'home.mode.full': 'Full Practice',
  'home.mode.full_desc': 'All phrases, weighted by progress',
  'home.mode.quick': 'Quick Review',
  'home.mode.quick_desc': 'Previously missed, up to {n}',
  'home.mode.new': 'New Phrases',
  'home.mode.new_desc': "Only phrases you haven't seen",
  'home.scenarios': 'Scenarios (or start with all)',
  'home.start_practice': 'Start Practice — {n} {unit}',
  'home.streak': '🔥 {streak} {unit}',

  // Pluralizable units (resolved via pluralize(), then interpolated as {unit})
  'unit.phrase.one': 'phrase',
  'unit.phrase.other': 'phrases',
  'unit.day.one': 'day',
  'unit.day.other': 'days',

  // ── SpeedControl ──────────────────────────────────────────────────────────────
  'speed.slow': 'Slow',
  'speed.normal': 'Normal',
  'speed.fast': 'Fast',

  // ── Practice ────────────────────────────────────────────────────────────────
  'practice.exit': '← Exit',
  'practice.situation': 'The Situation',
  'practice.what_youd_say': "What you'd say",
  'practice.you_could_respond': 'You could respond',
  'practice.listen_try': 'Listen & try to understand',
  'practice.heres_what': "Here's what they said",
  'practice.reveal': 'Reveal Answer',
  'practice.didnt_get': "Didn't Get It",
  'practice.understood': 'Understood ✓',
  // Deep-linked single prompt only, in place of the two grade buttons above.
  // {category} is the scenario's localized display name (e.g. "Restaurant").
  'practice.practice_more': 'Practice more {category} situations',

  // ── SpeakButton ───────────────────────────────────────────────────────────────
  'speak.playing': 'Playing...',
  // Shown until the audio has actually played once; 'speak.play_again' after.
  'speak.play': 'Play',
  'speak.play_again': 'Play Again',
  'speak.listen': 'Listen',

  // ── Summary ─────────────────────────────────────────────────────────────────
  'summary.complete': 'Session Complete',
  'summary.understood_first': 'understood on first listen',
  'summary.comprehension': '{pct}% comprehension',
  'summary.review_these': 'Review these ({n})',
  'summary.retry_missed': 'Retry Missed',
  'summary.new_session': 'New Session',

  // ── Progress ────────────────────────────────────────────────────────────────
  'progress.back': '← Back',
  'progress.title': 'Progress',
  'progress.comprehension': 'Comprehension',
  'progress.day_streak': 'Day Streak',
  'progress.total_attempts': 'Total Attempts',
  'progress.by_category': 'By Category',
  'progress.not_started': 'Not started',
  'progress.weakest': 'Weakest Phrases',
  'progress.reset': 'Reset All Progress',
  'progress.reset_confirm': 'Reset all progress? This cannot be undone.',

  // ── App (browser alerts) ──────────────────────────────────────────────────────
  'app.no_new': 'No new phrases in this selection!',
  'app.no_review': 'No phrases to review!',

  // ── Target language names ("I'm learning" buttons — localized per UI language) ──
  'lang.es-ES': 'Spanish',
  'lang.pt-PT': 'Portuguese',
  'lang.en-US': 'English',
}

// Peninsular Spanish, informal (tú) register. Values are the reviewed worksheet
// primaries (SPANISH-UI-WORKSHEET.md). Any key omitted here falls back to en-US.
const ES: UIStrings = {
  // ── Home ────────────────────────────────────────────────────────────────────
  'home.eyebrow': 'Entrenador de situaciones de viaje',
  'home.tagline': 'Entiende lo que dicen los locales y responde como uno más.',
  'home.progress': '📊 Progreso',
  'home.i_speak': 'Hablo',
  'home.im_learning': 'Estoy aprendiendo',
  'home.playback_speed': 'Velocidad de reproducción',
  'home.session_mode': 'Modo de sesión',
  'home.mode.full': 'Práctica completa',
  'home.mode.full_desc': 'Todas las frases, según tu progreso',
  'home.mode.quick': 'Repaso rápido',
  'home.mode.quick_desc': 'Las que has fallado, hasta {n}',
  'home.mode.new': 'Frases nuevas',
  'home.mode.new_desc': 'Solo las frases que no has visto',
  'home.scenarios': 'Escenarios (o empieza con todos)',
  'home.start_practice': 'Empezar práctica — {n} {unit}',
  'home.streak': '🔥 {streak} {unit}',

  'unit.phrase.one': 'frase',
  'unit.phrase.other': 'frases',
  'unit.day.one': 'día',
  'unit.day.other': 'días',

  // ── SpeedControl ──────────────────────────────────────────────────────────────
  'speed.slow': 'Lento',
  'speed.normal': 'Normal',
  'speed.fast': 'Rápido',

  // ── Practice ────────────────────────────────────────────────────────────────
  'practice.exit': '← Salir',
  'practice.situation': 'La situación',
  'practice.what_youd_say': 'Qué dirías',
  'practice.you_could_respond': 'Podrías responder',
  'practice.listen_try': 'Escucha e intenta entender',
  'practice.heres_what': 'Esto es lo que han dicho',
  'practice.reveal': 'Mostrar respuesta',
  'practice.didnt_get': 'No lo he pillado',
  'practice.understood': 'Entendido ✓',
  'practice.practice_more': 'Practica más situaciones de {category}',

  // ── SpeakButton ───────────────────────────────────────────────────────────────
  'speak.playing': 'Reproduciendo...',
  'speak.play': 'Reproducir',
  'speak.play_again': 'Reproducir otra vez',
  'speak.listen': 'Escuchar',

  // ── Summary ─────────────────────────────────────────────────────────────────
  'summary.complete': 'Sesión completada',
  'summary.understood_first': 'entendidas a la primera',
  'summary.comprehension': '{pct}% de comprensión',
  'summary.review_these': 'Repasa estas ({n})',
  'summary.retry_missed': 'Reintentar falladas',
  'summary.new_session': 'Nueva sesión',

  // ── Progress ────────────────────────────────────────────────────────────────
  'progress.back': '← Volver',
  'progress.title': 'Progreso',
  'progress.comprehension': 'Comprensión',
  'progress.day_streak': 'Racha de días',
  'progress.total_attempts': 'Intentos totales',
  'progress.by_category': 'Por categoría',
  'progress.not_started': 'Sin empezar',
  'progress.weakest': 'Frases más difíciles',
  'progress.reset': 'Borrar todo el progreso',
  'progress.reset_confirm': '¿Borrar todo el progreso? Esto no se puede deshacer.',

  // ── App (browser alerts) ──────────────────────────────────────────────────────
  'app.no_new': '¡No hay frases nuevas en esta selección!',
  'app.no_review': '¡No hay frases para repasar!',

  // ── Target language names (localized) ─────────────────────────────────────────
  'lang.es-ES': 'Español',
  'lang.pt-PT': 'Portugués',
  'lang.en-US': 'Inglés',
}

export const UI_STRINGS: Record<string, UIStrings> = {
  'en-US': EN,
  'es-ES': ES,
}

export const DEFAULT_UI_LANG = 'en-US'
