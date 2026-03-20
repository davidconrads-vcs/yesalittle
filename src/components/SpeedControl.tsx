import { Speed } from '../types'

interface Props {
  speed: Speed
  onChange: (speed: Speed) => void
}

const SPEEDS: { value: Speed; label: string }[] = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
]

export default function SpeedControl({ speed, onChange }: Props) {
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
          {s.label}
        </button>
      ))}
    </div>
  )
}
