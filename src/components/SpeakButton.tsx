import { useEffect } from 'react'
import { useAudio } from '../hooks/useAudio'
import { Speed } from '../types'

interface Props {
  promptId: string
  phrase: string
  speed: Speed
  lang: string
  autoPlay?: boolean
  size?: 'large' | 'small'
}

export default function SpeakButton({ promptId, phrase, speed, lang, autoPlay = false, size = 'large' }: Props) {
  const { playing, play } = useAudio(promptId, speed, lang, phrase)
  const isLarge = size === 'large'

  useEffect(() => {
    if (autoPlay) {
      const t = setTimeout(play, 400)
      return () => clearTimeout(t)
    }
  }, [autoPlay, play])

  return (
    <button
      onClick={play}
      style={{
        background: playing ? 'rgba(232, 93, 58, 0.15)' : 'rgba(255,255,255,0.06)',
        border: playing ? '2px solid #E85D3A' : '2px solid rgba(255,255,255,0.12)',
        borderRadius: isLarge ? 20 : 12,
        padding: isLarge ? '18px 32px' : '10px 18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: isLarge ? 14 : 8,
        color: '#fff',
        fontSize: isLarge ? 17 : 14,
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all 0.25s ease',
        width: isLarge ? '100%' : 'auto',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontSize: isLarge ? 28 : 20,
          animation: playing ? 'pulse 1s ease-in-out infinite' : 'none',
        }}
      >
        {playing ? '🔊' : '🔈'}
      </span>
      <span style={{ fontWeight: 500 }}>
        {isLarge ? (playing ? 'Playing...' : 'Play Again') : (playing ? '...' : 'Listen')}
      </span>
    </button>
  )
}
