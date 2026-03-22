import { useState, useEffect } from 'react'
import { PromptWithScenario, Speed, Language } from '../types'
import SpeakButton from './SpeakButton'
import SpeedControl from './SpeedControl'

interface Props {
  queue: PromptWithScenario[]
  speed: Speed
  lang: Language
  onSpeedChange: (s: Speed) => void
  onResult: (promptId: string, understood: boolean) => void
  onExit: () => void
}

export default function Practice({ queue, speed, lang, onSpeedChange, onResult, onExit }: Props) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'listen' | 'reveal'>('listen')
  const [key, setKey] = useState(0) // for remounting SpeakButton

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
    // else: App.tsx handles transition to summary when onResult is called for last item
  }

  if (!current) return null

  const pct = queue.length > 0 ? ((index + 1) / queue.length) * 100 : 0

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
          ← Exit
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
            {current.context}
          </span>
        </div>

        {/* Main card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 28,
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              marginBottom: 16,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {phase === 'listen' ? 'Listen & try to understand' : "Here's what they said"}
          </div>

          {phase === 'listen' ? (
            <div style={{ fontSize: 56, marginBottom: 20 }}>👂</div>
          ) : (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 10, lineHeight: 1.4 }}>
                {current.phrase}
              </div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.5 }}>
                {current.english}
              </div>
              <div
                style={{
                  background: 'rgba(76, 175, 80, 0.08)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(76, 175, 80, 0.6)',
                    marginBottom: 4,
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  You could respond
                </div>
                <div style={{ fontSize: 15, color: 'rgba(76, 175, 80, 0.9)', fontWeight: 500 }}>
                  {current.yourResponse}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <SpeakButton key={key} promptId={current.id} phrase={current.phrase} speed={speed} lang={lang} autoPlay={phase === 'listen'} size="large" />
          </div>
        </div>

        {/* Actions */}
        {phase === 'listen' ? (
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
            Reveal Answer
          </button>
        ) : (
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
              Didn't Get It
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
              Understood ✓
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
