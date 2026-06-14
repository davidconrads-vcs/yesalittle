import { Speed } from '../types'
import { useI18n } from '../i18n'

interface Props {
  speed: Speed
  onChange: (speed: Speed) => void
}

// Labels resolved via t() inside render (was a module-level constant — would not
// have reacted to a language switch).
const SPEEDS: { value: Speed }[] = [
  { value: 'slow' },
  { value: 'normal' },
  { value: 'fast' },
]

export default function SpeedControl({ speed, onChange }: Props) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
      {SPEEDS.map(s => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: speed === s.value ? 'rgba(232, 93, 58, 0.2)' : 'transparent',
            color: speed === s.value ? '#E85D3A' : 'rgba(255,255,255,0.4)',
            border: speed === s.value ? '1px solid rgba(232, 93, 58, 0.4)' : '1px solid transparent',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
          }}
        >
          {t(`speed.${s.value}`)}
        </button>
      ))}
    </div>
  )
}
