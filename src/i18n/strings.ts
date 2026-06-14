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
  'home.eyebrow': 'Listening Trainer',
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

  // ── SpeakButton ───────────────────────────────────────────────────────────────
  'speak.playing': 'Playing...',
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

// Populated in Part 8 from the reviewed Spanish worksheet. Empty → falls back to EN.
const ES: UIStrings = {}

export const UI_STRINGS: Record<string, UIStrings> = {
  'en-US': EN,
  'es-ES': ES,
}

export const DEFAULT_UI_LANG = 'en-US'
