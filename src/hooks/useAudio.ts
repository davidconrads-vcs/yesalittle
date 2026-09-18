import { useState, useRef, useCallback, useEffect } from 'react'
import { Speed, TARGET_META } from '../types'

const SPEECH_RATES: Record<Speed, number> = {
  slow: 0.7,
  normal: 0.85,
  fast: 1.0,
}

function speakWithBrowser(text: string, rate: number, ttsLang: string): Promise<void> {
  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = ttsLang
    utter.rate = rate

    const voices = window.speechSynthesis.getVoices()
    const langPrefix = ttsLang.split('-')[0]
    const voice =
      voices.find(v => v.lang === ttsLang) || voices.find(v => v.lang.startsWith(langPrefix))
    if (voice) utter.voice = voice

    utter.onend = () => resolve()
    utter.onerror = () => reject()
    window.speechSynthesis.speak(utter)
  })
}

/**
 * Did play() reject because the browser blocks autoplay without a user gesture?
 *
 * This is NOT a playback failure: the mp3 is fine, the page just hasn't been tapped
 * yet. It matters because the speech-synthesis fallback is blocked for exactly the
 * same reason — Chrome logs "speechSynthesis.speak() without user activation is
 * deprecated and will be removed" and produces no sound — so there is nothing to fall
 * back TO. The only useful response is to leave the control un-played so the first
 * tap plays the real audio.
 *
 * Hits any autoplay-blocked context, not just deep links: a cold load with no prior
 * gesture is the general case.
 */
export function isAutoplayBlocked(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { name?: unknown }).name === 'NotAllowedError'
  )
}

export function useAudio(promptId: string, speed: Speed, lang: string, text?: string) {
  const [playing, setPlaying] = useState(false)
  // Whether this control has actually produced sound yet — drives "Play" vs "Play
  // Again". Autoplay being blocked leaves it false, which is the point.
  const [hasPlayed, setHasPlayed] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const stoppedRef = useRef(false)

  // Every audio file carries its target language explicitly:
  // `{id}-{lang}-{speed}.mp3` (responses use `{id}-response-{lang}-{speed}.mp3`,
  // the `-response` already baked into promptId by the caller).
  // Keep in sync with generate-audio.ts.
  const audioSrc = `audio/${promptId}-${lang}-${speed}.mp3`

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

    const ttsLang = TARGET_META[lang]?.ttsLang ?? lang

    // mp3 missing, undecodable, or otherwise unplayable — say it with the browser's
    // voice instead. This is what the fallback is FOR.
    const fallBackToSpeech = () => {
      audioRef.current = null
      if (stoppedRef.current) return
      if (!text) {
        setPlaying(false)
        return
      }
      setHasPlayed(true)
      speakWithBrowser(text, SPEECH_RATES[speed], ttsLang)
        .catch(() => {})  // TTS unavailable (e.g. no voices) — nothing more to do
        .finally(() => {
          if (!stoppedRef.current) setPlaying(false)
        })
    }

    audio.onerror = fallBackToSpeech

    audio.play().then(
      () => {
        if (!stoppedRef.current) setHasPlayed(true)
      },
      (err: unknown) => {
        // Autoplay blocked is not a broken file, and speech synthesis would be blocked
        // for the same missing gesture — so fall back to nothing and stay un-played.
        if (isAutoplayBlocked(err)) {
          audioRef.current = null
          setPlaying(false)
          return
        }
        fallBackToSpeech()
      },
    )
  }, [audioSrc, speed, lang, text, stop])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { playing, hasPlayed, play, stop }
}
