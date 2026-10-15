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

// Simplified Chinese. Not selectable yet (zh-CN is not in SUPPORTED_NATIVES); kept
// complete so the follow-up story only has to turn it on.
const ZH: UIStrings = {
  // ── Home ────────────────────────────────────────────────────────────────────
  'home.eyebrow': '旅行情景训练',
  'home.tagline': '听懂当地人说什么——并像当地人一样回应。',
  'home.progress': '📊 进度',
  'home.i_speak': '我的母语',
  'home.im_learning': '我在学',
  'home.playback_speed': '播放速度',
  'home.session_mode': '练习模式',
  'home.mode.full': '完整练习',
  'home.mode.full_desc': '全部句子，根据你的进度安排',
  'home.mode.quick': '快速复习',
  'home.mode.quick_desc': '之前没听懂的，最多 {n} 句',
  'home.mode.new': '新句子',
  'home.mode.new_desc': '只练没见过的句子',
  'home.scenarios': '情景（不选则练全部）',
  'home.start_practice': '开始练习 — {n} {unit}',
  'home.streak': '🔥 {streak} {unit}',

  'unit.phrase.one': '句',
  'unit.phrase.other': '句',
  'unit.day.one': '天',
  'unit.day.other': '天',

  // ── SpeedControl ──────────────────────────────────────────────────────────────
  'speed.slow': '慢速',
  'speed.normal': '正常',
  'speed.fast': '快速',

  // ── Practice ────────────────────────────────────────────────────────────────
  'practice.exit': '← 退出',
  'practice.situation': '情景',
  'practice.what_youd_say': '你可以说',
  'practice.you_could_respond': '你可以这样回答',
  'practice.listen_try': '听一听，试着理解',
  'practice.heres_what': '对方说的是',
  'practice.reveal': '显示答案',
  'practice.didnt_get': '没听懂',
  'practice.understood': '听懂了 ✓',
  'practice.practice_more': '继续练习更多「{category}」情景',

  // ── SpeakButton ───────────────────────────────────────────────────────────────
  'speak.playing': '播放中...',
  'speak.play': '播放',
  'speak.play_again': '再听一遍',
  'speak.listen': '听',

  // ── Summary ─────────────────────────────────────────────────────────────────
  'summary.complete': '练习完成',
  'summary.understood_first': '第一遍就听懂',
  'summary.comprehension': '理解率 {pct}%',
  'summary.review_these': '复习这些（{n}）',
  'summary.retry_missed': '重练没听懂的',
  'summary.new_session': '新的练习',

  // ── Progress ────────────────────────────────────────────────────────────────
  'progress.back': '← 返回',
  'progress.title': '进度',
  'progress.comprehension': '理解率',
  'progress.day_streak': '连续天数',
  'progress.total_attempts': '总练习次数',
  'progress.by_category': '按类别',
  'progress.not_started': '未开始',
  'progress.weakest': '最难的句子',
  'progress.reset': '清除全部进度',
  'progress.reset_confirm': '确定清除全部进度吗？此操作无法撤销。',

  // ── App (browser alerts) ──────────────────────────────────────────────────────
  'app.no_new': '所选范围内没有新句子！',
  'app.no_review': '没有需要复习的句子！',

  // ── Target language names (localized) ─────────────────────────────────────────
  'lang.es-ES': '西班牙语',
  'lang.pt-PT': '葡萄牙语',
  'lang.en-US': '英语',
}

export const UI_STRINGS: Record<string, UIStrings> = {
  'en-US': EN,
  'es-ES': ES,
  'zh-CN': ZH,
}

export const DEFAULT_UI_LANG = 'en-US'
