import { clampDuration, DAY, partsToMs, splitParts } from '@/lib/duration'
import { Chip, GroupField, Hint, Presets } from './drawer.styled'
import { presets } from '@/lib/presets'

type DurationFieldProps = {
  ms: number
  onChange: (ms: number) => void
}

type Unit = 'hours' | 'minutes' | 'seconds'

const fields: Array<{ unit: Unit; label: string; max: number }> = [
  { unit: 'hours', label: 'Hours', max: 99 },
  { unit: 'minutes', label: 'Minutes', max: 59 },
  { unit: 'seconds', label: 'Seconds', max: 59 },
]

export function DurationField({ ms, onChange }: DurationFieldProps) {
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
      <GroupField>
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
      </GroupField>

      <GroupField>
        <Presets>
          {presets.map((preset) => (
            <Chip
              key={preset.label}
              $active={preset.ms === ms}
              onClick={() => onChange(preset.ms)}
              aria-pressed={preset.ms === ms}
            >
              {preset.label}
            </Chip>
          ))}
        </Presets>
      </GroupField>

      {ms >= DAY && (
        <Hint>
          Over a day. Date mode may read better at this length — it counts to a moment on the
          calendar rather than to the end of a run you start.
        </Hint>
      )}
    </>
  )
}
