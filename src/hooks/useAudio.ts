import { useState, useRef, useCallback, useEffect } from 'react'
import { Speed } from '../types'

const SPEECH_RATES: Record<Speed, number> = {
  slow: 0.7,
  normal: 0.85,
  fast: 1.0,
}

function speakWithBrowser(text: string, rate: number): Promise<void> {
  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'es-ES'
    utter.rate = rate

    const voices = window.speechSynthesis.getVoices()
    const spanishVoice =
      voices.find(v => v.lang === 'es-ES') || voices.find(v => v.lang.startsWith('es'))
    if (spanishVoice) utter.voice = spanishVoice

    utter.onend = () => resolve()
    utter.onerror = () => reject()
    window.speechSynthesis.speak(utter)
  })
}

export function useAudio(promptId: string, speed: Speed, text?: string) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stoppedRef = useRef(false)

  const audioSrc = `/audio/${promptId}-${speed}.mp3`

  const stop = useCallback(() => {
    stoppedRef.current = true
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    window.speechSynthesis.cancel()
    setPlaying(false)
  }, [])

  const play = useCallback(() => {
    stop()
    stoppedRef.current = false
    setPlaying(true)

    const audio = new Audio(audioSrc)
    audioRef.current = audio

    audio.onended = () => {
      if (!stoppedRef.current) setPlaying(false)
    }

    audio.onerror = () => {
      // mp3 not found — fall back to browser speech synthesis
      audioRef.current = null
      if (stoppedRef.current) return
      if (!text) {
        setPlaying(false)
        return
      }
      speakWithBrowser(text, SPEECH_RATES[speed])
        .finally(() => {
          if (!stoppedRef.current) setPlaying(false)
        })
    }

    audio.play().catch(() => {
      // play() rejected (e.g. not loaded yet) — also fall back
      audioRef.current = null
      if (stoppedRef.current || !text) {
        setPlaying(false)
        return
      }
      speakWithBrowser(text, SPEECH_RATES[speed]).finally(() => {
        if (!stoppedRef.current) setPlaying(false)
      })
    })
  }, [audioSrc, speed, text, stop])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { playing, play, stop }
}
