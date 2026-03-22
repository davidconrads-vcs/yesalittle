import { PromptWithScenario, ProgressData, Scenario } from '../types'

interface Props {
  scenarios: Scenario[]
  progress: ProgressData
  streak: number
  allPrompts: PromptWithScenario[]
  onBack: () => void
  onReset: () => void
}

export default function Progress({ scenarios, progress, streak, allPrompts, onBack, onReset }: Props) {
  const totalAttempts = Object.values(progress).reduce((sum, s) => sum + s.timesShown, 0)
  const totalUnderstood = Object.values(progress).reduce((sum, s) => sum + s.timesUnderstood, 0)
  const overallRate = totalAttempts > 0 ? Math.round((totalUnderstood / totalAttempts) * 100) : 0

  const weakest = allPrompts
    .filter(p => (progress[p.id]?.timesShown ?? 0) >= 3)
    .map(p => ({
      prompt: p,
      rate: progress[p.id].timesUnderstood / progress[p.id].timesShown,
    }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 10)

  const categoryStats = scenarios.map(s => {
    const prompts = s.prompts
    const attempts = prompts.reduce((sum, p) => sum + (progress[p.id]?.timesShown ?? 0), 0)
    const understood = prompts.reduce((sum, p) => sum + (progress[p.id]?.timesUnderstood ?? 0), 0)
    return {
      category: s.category,
      icon: s.icon,
      color: s.color,
      rate: attempts > 0 ? understood / attempts : null,
      attempts,
    }
  })

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '8px 14px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Progress</h2>
      </div>

      {/* Overall stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Comprehension', value: `${overallRate}%`, color: '#4CAF50' },
          { label: 'Day Streak', value: streak > 0 ? `🔥 ${streak}` : '—', color: '#FF9800' },
          { label: 'Total Attempts', value: String(totalAttempts), color: '#2196F3' },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '14px 12px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            marginBottom: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          By Category
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categoryStats.map(cat => (
            <div
              key={cat.category}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{cat.icon}</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                    {cat.category}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: cat.rate !== null ? cat.color : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {cat.rate !== null ? `${Math.round(cat.rate * 100)}%` : 'Not started'}
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: cat.rate !== null ? `${Math.round(cat.rate * 100)}%` : '0%',
                    height: '100%',
                    borderRadius: 2,
                    background: cat.color,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weakest phrases */}
      {weakest.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              marginBottom: 12,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Weakest Phrases
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weakest.map(({ prompt, rate }) => (
              <div
                key={prompt.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {prompt.phrase}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{prompt.english}</div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: rate < 0.5 ? '#F44336' : '#FF9800',
                    fontFamily: "'JetBrains Mono', monospace",
                    flexShrink: 0,
                  }}
                >
                  {Math.round(rate * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm('Reset all progress? This cannot be undone.')) onReset()
        }}
        style={{
          width: '100%',
          padding: '14px',
          background: 'rgba(244, 67, 54, 0.06)',
          border: '1px solid rgba(244, 67, 54, 0.2)',
          borderRadius: 12,
          color: 'rgba(244, 67, 54, 0.7)',
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
        }}
      >
        Reset All Progress
      </button>
    </div>
  )
}
