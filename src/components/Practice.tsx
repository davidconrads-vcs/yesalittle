import { useState, useEffect } from 'react'
import { PromptWithScenario, Speed } from '../types'
import SpeakButton from './SpeakButton'
import SpeedControl from './SpeedControl'
import { useI18n } from '../i18n'

interface Props {
  queue: PromptWithScenario[]
  speed: Speed
  lang: string
  onSpeedChange: (s: Speed) => void
  onResult: (promptId: string, understood: boolean) => void
  onExit: () => void
  // Set only for a `?prompt=` deep link, where the queue is one prompt and the visit
  // is a preview, not practice. Replaces the grade buttons, so `onResult` is never
  // called in this mode — which is exactly what keeps stored progress untouched.
  deepLinkAction?: { label: string; onClick: () => void }
}

export default function Practice({ queue, speed, lang, onSpeedChange, onResult, onExit, deepLinkAction }: Props) {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'listen' | 'reveal'>('listen')
  const [key, setKey] = useState(0) // for remounting SpeakButton on new prompt

  const current = queue[index]

  useEffect(() => {
    setPhase('listen')
    setKey(k => k + 1)
  }, [index])

  const handleResult = (understood: boolean) => {
    onResult(current.id, understood)
    if (index + 1 < queue.length) {
      setIndex(i => i + 1)
    }
  }

  if (!current) return null

  const isScenario = current.type === 'scenario'
  const pct = queue.length > 0 ? ((index + 1) / queue.length) * 100 : 0

  const sharedCardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    textAlign: 'center' as const,
  }

  const labelStyle = {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 16,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  }

  const responseCardStyle = {
    background: 'rgba(76, 175, 80, 0.08)',
    border: '1px solid rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    padding: '12px 16px',
    textAlign: 'left' as const,
  }

  const responseLabelStyle = {
    fontSize: 11,
    color: 'rgba(76, 175, 80, 0.6)',
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  }

  const resultActions = (
    <div style={{ display: 'flex', gap: 10, animation: 'fadeUp 0.3s ease' }}>
      <button
        onClick={() => handleResult(false)}
        style={{
          flex: 1,
          padding: '18px 20px',
          background: 'rgba(244, 67, 54, 0.1)',
          border: '1.5px solid rgba(244, 67, 54, 0.3)',
          borderRadius: 14,
          color: '#F44336',
          fontSize: 16,
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
          minHeight: 56,
        }}
      >
        {t('practice.didnt_get')}
      </button>
      <button
        onClick={() => handleResult(true)}
        style={{
          flex: 1,
          padding: '18px 20px',
          background: 'rgba(76, 175, 80, 0.1)',
          border: '1.5px solid rgba(76, 175, 80, 0.3)',
          borderRadius: 14,
          color: '#4CAF50',
          fontSize: 16,
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
          minHeight: 56,
        }}
      >
        {t('practice.understood')}
      </button>
    </div>
  )

  const practiceMoreButton = deepLinkAction && (
    <button
      onClick={deepLinkAction.onClick}
      style={{
        width: '100%',
        padding: '18px 20px',
        background: 'rgba(232, 93, 58, 0.1)',
        border: '1.5px solid rgba(232, 93, 58, 0.35)',
        borderRadius: 14,
        color: '#E85D3A',
        fontSize: 16,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        cursor: 'pointer',
        minHeight: 56,
        animation: 'fadeUp 0.3s ease',
      }}
    >
      {deepLinkAction.label}
    </button>
  )

  // What sits below the card once the answer is revealed. A deep link gets the
  // single call to action instead of the grade pair — never both.
  const revealedActions = practiceMoreButton ?? resultActions

  const revealButton = (
    <button
      onClick={() => setPhase('reveal')}
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
        boxShadow: '0 4px 24px rgba(232, 93, 58, 0.3)',
        minHeight: 56,
      }}
    >
      {t('practice.reveal')}
    </button>
  )

  // ── Scenario render branch ────────────────────────────────────────────────────

  const scenarioBranch = (
    <>
      <div style={sharedCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18, lineHeight: 1, userSelect: 'none' }}>🎬</span>
          <span style={labelStyle}>{t('practice.situation')}</span>
        </div>

        <div style={{ animation: phase === 'reveal' ? 'none' : undefined }}>
          <p style={{
            fontSize: 17,
            lineHeight: 1.6,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.65)',
            margin: '0 0 20px',
          }}>
            {current.context}
          </p>

          {phase === 'reveal' && (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              <div style={responseCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={responseLabelStyle}>{t('practice.what_youd_say')}</div>
                  <SpeakButton promptId={`${current.id}-response`} phrase={current.yourResponse} speed={speed} lang={lang} size="small" />
                </div>
                <div translate="no" className="notranslate" style={{ fontSize: 15, color: 'rgba(76, 175, 80, 0.9)', fontWeight: 500 }}>
                  {current.yourResponse}
                </div>
                {current.nativeResponse && (
                  <div style={{ fontSize: 13, color: 'rgba(76, 175, 80, 0.5)', marginTop: 4 }}>
                    {current.nativeResponse}
                  </div>
                )}
              </div>
              {current.gloss && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1.5,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ marginRight: 6 }}>ℹ️</span>{current.gloss}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {phase === 'listen' ? revealButton : revealedActions}
    </>
  )

  // ── Conversation render branch ────────────────────────────────────────────────

  const conversationBranch = (
    <>
      <div style={sharedCardStyle}>
        <div style={labelStyle}>
          {phase === 'listen' ? t('practice.listen_try') : t('practice.heres_what')}
        </div>

        {phase === 'listen' ? (
          <div style={{ fontSize: 56, marginBottom: 20 }}>👂</div>
        ) : (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div translate="no" className="notranslate" style={{ fontSize: 22, fontWeight: 600, marginBottom: 10, lineHeight: 1.4 }}>
              {current.phrase}
            </div>
            {current.nativePhrase && (
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.5 }}>
                {current.nativePhrase}
              </div>
            )}
            <div style={responseCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={responseLabelStyle}>{t('practice.you_could_respond')}</div>
                <SpeakButton promptId={`${current.id}-response`} phrase={current.yourResponse} speed={speed} lang={lang} size="small" />
              </div>
              <div translate="no" className="notranslate" style={{ fontSize: 15, color: 'rgba(76, 175, 80, 0.9)', fontWeight: 500 }}>
                {current.yourResponse}
              </div>
              {current.nativeResponse && (
                <div style={{ fontSize: 13, color: 'rgba(76, 175, 80, 0.5)', marginTop: 4 }}>
                  {current.nativeResponse}
                </div>
              )}
            </div>
            {current.gloss && (
              <div
                style={{
                  marginTop: 12,
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.5,
                  textAlign: 'left',
                }}
              >
                <span style={{ marginRight: 6 }}>ℹ️</span>{current.gloss}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <SpeakButton key={key} promptId={current.id} phrase={current.phrase ?? ''} speed={speed} lang={lang} autoPlay={phase === 'listen'} size="large" />
        </div>
      </div>

      {phase === 'listen' ? revealButton : revealedActions}
    </>
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0D0D0F',
        color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
        padding: '24px 20px 40px',
        maxWidth: 520,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={onExit}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '8px 14px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            minHeight: 36,
          }}
        >
          {t('practice.exit')}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SpeedControl speed={speed} onChange={onSpeedChange} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <div
              style={{
                width: 80,
                height: 4,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #E85D3A, #FF9800)',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <span>
              {index + 1}/{queue.length}
            </span>
          </div>
        </div>
      </div>

      <div key={index} style={{ animation: 'fadeUp 0.4s ease' }}>
        {/* Context pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: `${current.color}15`,
            border: `1px solid ${current.color}30`,
            borderRadius: 10,
            padding: '8px 14px',
            marginBottom: 20,
          }}
        >
          <span>{current.icon}</span>
          <span style={{ fontSize: 13, color: current.color, fontWeight: 500 }}>
            {isScenario ? current.category : current.context}
          </span>
        </div>

        {isScenario ? scenarioBranch : conversationBranch}
      </div>
    </div>
  )
}
