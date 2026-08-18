import { clampDuration, DAY, partsToMs, splitParts } from '../duration'
import { presets } from '../presets'

type Props = {
  ms: number
  onChange: (ms: number) => void
}

type Unit = 'hours' | 'minutes' | 'seconds'

const fields: Array<{ unit: Unit; label: string; max: number }> = [
  { unit: 'hours', label: 'Hours', max: 99 },
  { unit: 'minutes', label: 'Minutes', max: 59 },
  { unit: 'seconds', label: 'Seconds', max: 59 },
]

export function DurationField({ ms, onChange }: Props) {
  const parts = splitParts(ms)
  // Days are not offered as a field — a duration timer that long is a date — so any
  // that exist are shown as the hours they are.
  const shown = { ...parts, hours: parts.days * 24 + parts.hours, days: 0 }

  const set = (unit: Unit, raw: string) => {
    // An emptied field is a zero being typed through, not a reason to reject the edit.
    const value = raw === '' ? 0 : Number(raw)
    if (!Number.isFinite(value) || value < 0) return
    onChange(clampDuration(partsToMs({ ...shown, [unit]: Math.trunc(value) })))
  }

  return (
    <>
      <div className="group-field">
        {fields.map((field) => (
          <label key={field.unit}>
            {field.label}
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={field.max}
              value={shown[field.unit]}
              onChange={(e) => set(field.unit, e.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="group-field is-presets">
        {presets.map((preset) => (
          <button
            key={preset.label}
            className={`chip${preset.ms === ms ? ' is-active' : ''}`}
            onClick={() => onChange(preset.ms)}
            aria-pressed={preset.ms === ms}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {ms >= DAY && (
        <p className="settings-hint">
          Over a day. Date mode may read better at this length — it counts to a moment on
          the calendar rather than to the end of a run you start.
        </p>
      )}
    </>
  )
}
