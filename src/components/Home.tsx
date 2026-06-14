import { useState } from 'react'
import { Scenario, SessionMode, Speed, getAvailableTargets, TARGET_META, SUPPORTED_NATIVES, NATIVE_META } from '../types'
import { REVIEW_LIMIT } from '../hooks/useSpacedQueue'
import { useI18n } from '../i18n'
import SpeedControl from './SpeedControl'

interface Props {
  scenarios: Scenario[]
  language: string
  onLanguageChange: (l: string) => void
  native: string
  onNativeChange: (n: string) => void
  onStart: (categories: Set<string>, mode: SessionMode) => void
  streak: number
  speed: Speed
  onSpeedChange: (s: Speed) => void
  onProgressClick: () => void
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1.5,
  color: 'rgba(255,255,255,0.3)',
  textTransform: 'uppercase',
  marginBottom: 10,
  fontFamily: "'JetBrains Mono', monospace",
}

export default function Home({ scenarios, language, onLanguageChange, native, onNativeChange, onStart, streak, speed, onSpeedChange, onProgressClick }: Props) {
  const { t, pluralize } = useI18n()
  // `selected` holds stable scenario ids, never the (localizable) display name.
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<SessionMode>('full')

  const totalPrompts = selected.size === 0
    ? scenarios.reduce((sum, s) => sum + s.prompts.length, 0)
    : scenarios.filter(s => selected.has(s.id)).reduce((sum, s) => sum + s.prompts.length, 0)

  const toggleCategory = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const SESSION_MODES: { value: SessionMode; label: string; desc: string }[] = [
    { value: 'full', label: t('home.mode.full'), desc: t('home.mode.full_desc') },
    { value: 'review', label: t('home.mode.quick'), desc: t('home.mode.quick_desc', { n: REVIEW_LIMIT }) },
    { value: 'new', label: t('home.mode.new'), desc: t('home.mode.new_desc') },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0D0D0F',
        color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
        padding: '32px 20px 40px',
        maxWidth: 520,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 2,
              color: '#E85D3A',
              textTransform: 'uppercase',
              marginBottom: 8,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {t('home.eyebrow')}
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.65) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            yesalittle
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginTop: 8, lineHeight: 1.5, margin: '8px 0 0' }}>
            {t('home.tagline')}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {streak > 0 && (
            <div
              style={{
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.25)',
                borderRadius: 10,
                padding: '6px 12px',
                fontSize: 13,
                color: 'rgba(255, 152, 0, 0.9)',
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: 'nowrap',
              }}
            >
              {t('home.streak', { streak, unit: pluralize(streak, { one: t('unit.day.one'), other: t('unit.day.other') }) })}
            </div>
          )}
          <button
            onClick={onProgressClick}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '6px 12px',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
            }}
          >
            {t('home.progress')}
          </button>
        </div>
      </div>

      {/* Native-language selector — "I speak" */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabelStyle}>{t('home.i_speak')}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SUPPORTED_NATIVES.map(locale => (
            <button
              key={locale}
              onClick={() => onNativeChange(locale)}
              style={{
                flex: 1,
                background: native === locale ? 'rgba(232, 93, 58, 0.08)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${native === locale ? 'rgba(232, 93, 58, 0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12,
                padding: '10px 16px',
                color: native === locale ? '#E85D3A' : 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>{NATIVE_META[locale].flag}</span>
              <span>{NATIVE_META[locale].autonym}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target-language selector — "I'm learning" */}
      <div style={{ marginBottom: 24 }}>
        <div style={sectionLabelStyle}>{t('home.im_learning')}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {getAvailableTargets(native).map(locale => (
            <button
              key={locale}
              onClick={() => onLanguageChange(locale)}
              style={{
                flex: 1,
                background: language === locale ? 'rgba(232, 93, 58, 0.08)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${language === locale ? 'rgba(232, 93, 58, 0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12,
                padding: '10px 16px',
                color: language === locale ? '#E85D3A' : 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>{TARGET_META[locale].flag}</span>
              <span>{t(`lang.${locale}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Speed control */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            marginBottom: 10,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {t('home.playback_speed')}
        </div>
        <SpeedControl speed={speed} onChange={onSpeedChange} />
      </div>

      {/* Session mode */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            marginBottom: 10,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {t('home.session_mode')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SESSION_MODES.map(m => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              style={{
                background: mode === m.value ? 'rgba(232, 93, 58, 0.08)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${mode === m.value ? 'rgba(232, 93, 58, 0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ color: mode === m.value ? '#E85D3A' : 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  {m.label}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>
                  {m.desc}
                </div>
              </div>
              {mode === m.value && (
                <div style={{ color: '#E85D3A', fontSize: 16 }}>✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category selector */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            marginBottom: 10,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {t('home.scenarios')}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {scenarios.map(s => {
            const isSelected = selected.has(s.id)
            return (
              <button
                key={s.id}
                onClick={() => toggleCategory(s.id)}
                style={{
                  background: isSelected ? `${s.color}20` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isSelected ? s.color : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12,
                  padding: '10px 16px',
                  color: isSelected ? s.color : 'rgba(255,255,255,0.55)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  minHeight: 48,
                }}
              >
                <span>{s.icon}</span>
                <span>{s.category}</span>
                <span
                  style={{
                    fontSize: 11,
                    opacity: 0.5,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {s.prompts.length}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={() => onStart(selected, mode)}
        style={{
          width: '100%',
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #E85D3A, #D4472A)',
          border: 'none',
          borderRadius: 16,
          color: '#fff',
          fontSize: 17,
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 24px rgba(232, 93, 58, 0.3)',
          minHeight: 56,
        }}
      >
        {t('home.start_practice', { n: totalPrompts, unit: pluralize(totalPrompts, { one: t('unit.phrase.one'), other: t('unit.phrase.other') }) })}
      </button>
    </div>
  )
}
