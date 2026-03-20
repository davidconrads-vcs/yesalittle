import { useState } from 'react'
import promptsData from '../data/prompts.json'
import { Scenario, SessionMode, Speed } from '../types'
import SpeedControl from './SpeedControl'

const scenarios = promptsData.scenarios as Scenario[]

interface Props {
  onStart: (categories: Set<string>, mode: SessionMode) => void
  streak: number
  speed: Speed
  onSpeedChange: (s: Speed) => void
  onProgressClick: () => void
}

export default function Home({ onStart, streak, speed, onSpeedChange, onProgressClick }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<SessionMode>('full')

  const totalPrompts = selected.size === 0
    ? scenarios.reduce((sum, s) => sum + s.prompts.length, 0)
    : scenarios.filter(s => selected.has(s.category)).reduce((sum, s) => sum + s.prompts.length, 0)

  const toggleCategory = (category: string) => {
    const next = new Set(selected)
    next.has(category) ? next.delete(category) : next.add(category)
    setSelected(next)
  }

  const SESSION_MODES: { value: SessionMode; label: string; desc: string }[] = [
    { value: 'full', label: 'Full Practice', desc: 'All phrases, weighted by progress' },
    { value: 'review', label: 'Quick Review', desc: 'Previously missed, up to 15' },
    { value: 'new', label: 'New Phrases', desc: "Only phrases you haven't seen" },
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
            Listening Trainer
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
            ¿Qué te han dicho?
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginTop: 8, lineHeight: 1.5, margin: '8px 0 0' }}>
            Listen to what locals say in real situations.
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
              🔥 {streak} day{streak !== 1 ? 's' : ''}
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
            📊 Progress
          </button>
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
          Playback Speed
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
          Session Mode
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
          Scenarios (or start with all)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {scenarios.map(s => {
            const isSelected = selected.has(s.category)
            return (
              <button
                key={s.category}
                onClick={() => toggleCategory(s.category)}
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
        Start Practice — {totalPrompts} phrase{totalPrompts !== 1 ? 's' : ''}
      </button>
    </div>
  )
}
