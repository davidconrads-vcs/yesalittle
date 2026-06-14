import { createContext, useContext, useMemo, ReactNode } from 'react'
import { UI_STRINGS, DEFAULT_UI_LANG } from './strings'

export type Vars = Record<string, string | number>

// ── Pluralization ───────────────────────────────────────────────────────────
// A real plural-category function per language, not string concatenation, so
// other rules (CJK = single form, etc.) slot in later. en-US/es-ES share the
// one/other rule; both nouns we pluralize are regular, but the mechanism is general.
export interface PluralForms {
  one?: string
  other: string
}

type PluralCategory = 'one' | 'other'
const PLURAL_RULES: Record<string, (n: number) => PluralCategory> = {
  'en-US': n => (n === 1 ? 'one' : 'other'),
  'es-ES': n => (n === 1 ? 'one' : 'other'),
}

export function pluralize(lang: string, n: number, forms: PluralForms): string {
  const rule = PLURAL_RULES[lang] ?? PLURAL_RULES[DEFAULT_UI_LANG]
  const cat = rule(n)
  return (cat === 'one' ? forms.one : undefined) ?? forms.other
}

// ── Lookup + interpolation ──────────────────────────────────────────────────
function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s
  let out = s
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(String(v))
  }
  return out
}

export function translate(lang: string, key: string, vars?: Vars): string {
  const active = UI_STRINGS[lang]?.[key]
  const fallback = UI_STRINGS[DEFAULT_UI_LANG]?.[key]
  const value = active ?? fallback
  if (value === undefined) {
    // Truly missing (not just an untranslated entry that falls back) — a bug.
    if (import.meta.env.DEV) console.warn(`[i18n] missing key: "${key}"`)
    return interpolate(key, vars)
  }
  return interpolate(value, vars)
}

// ── React context ─────────────────────────────────────────────────────────────
export interface I18n {
  lang: string
  t: (key: string, vars?: Vars) => string
  pluralize: (n: number, forms: PluralForms) => string
}

const I18nContext = createContext<I18n>({
  lang: DEFAULT_UI_LANG,
  t: (key, vars) => translate(DEFAULT_UI_LANG, key, vars),
  pluralize: (n, forms) => pluralize(DEFAULT_UI_LANG, n, forms),
})

export function I18nProvider({ lang, children }: { lang: string; children: ReactNode }) {
  const value = useMemo<I18n>(
    () => ({
      lang,
      t: (key, vars) => translate(lang, key, vars),
      pluralize: (n, forms) => pluralize(lang, n, forms),
    }),
    [lang],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18n {
  return useContext(I18nContext)
}
