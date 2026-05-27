import { PromptWithScenario, Speed } from '../types'
import SpeakButton from './SpeakButton'

interface SessionResult {
  prompt: PromptWithScenario
  understood: boolean
}

interface Props {
  results: SessionResult[]
  speed: Speed
  lang: string
  onRetryMissed: (missed: PromptWithScenario[]) => void
  onNewSession: () => void
}

export default function Summary({ results, speed, lang, onRetryMissed, onNewSession }: Props) {
  const correct = results.filter(r => r.understood).length
  const missed = results.filter(r => !r.understood)
  const pct = results.length > 0 ? Math.round((correct / results.length) * 100) : 0

  const emoji = correct === results.length ? '🎉' : correct > results.length * 0.7 ? '💪' : '📚'

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
      <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeUp 0.5s ease' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>{emoji}</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>Session Complete</h2>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}
        >
          {correct}/{results.length}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 }}>
          understood on first listen
        </div>
        <div
          style={{
            marginTop: 12,
            display: 'inline-block',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '4px 12px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          {pct}% comprehension
        </div>
      </div>

      {missed.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              marginBottom: 14,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Review these ({missed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {missed.map((r, i) => (
              <div
                key={r.prompt.id}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: 16,
                  animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
                }}
              >
                {r.prompt.type === 'scenario' ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, lineHeight: 1, userSelect: 'none' }}>🎬</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, textTransform: 'uppercase' }}>The Situation</span>
                    </div>
                    <p style={{ fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,0.6)', margin: '0 0 10px', lineHeight: 1.5 }}>
                      {r.prompt.context}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'rgba(76, 175, 80, 0.6)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, textTransform: 'uppercase' }}>What you'd say</span>
                      <SpeakButton promptId={`${r.prompt.id}-response`} phrase={r.prompt.yourResponse} speed={speed} lang={lang} size="small" />
                    </div>
                    <div style={{ fontSize: 15, color: 'rgba(76, 175, 80, 0.9)', fontWeight: 500 }}>{r.prompt.yourResponse}</div>
                    <div style={{ fontSize: 13, color: 'rgba(76, 175, 80, 0.5)', marginTop: 2 }}>{r.prompt.yourResponseEnglish}</div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                        {r.prompt.icon} {r.prompt.context}
                      </div>
                      <SpeakButton promptId={r.prompt.id} phrase={r.prompt.phrase ?? ''} speed={speed} lang={lang} size="small" />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{r.prompt.phrase}</div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{r.prompt.english}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {missed.length > 0 && (
          <button
            onClick={() => onRetryMissed(missed.map(r => r.prompt))}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: 'rgba(232, 93, 58, 0.12)',
              border: '1.5px solid #E85D3A',
              borderRadius: 14,
              color: '#E85D3A',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              minHeight: 52,
            }}
          >
            Retry Missed
          </button>
        )}
        <button
          onClick={onNewSession}
          style={{
            flex: 1,
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            minHeight: 52,
          }}
        >
          New Session
        </button>
      </div>
    </div>
  )
}
