import type { CSSProperties } from 'react'
import { formatClock, splitParts } from '../duration'
import type { Theme } from '../themes'
import type { Mode } from '../useSettings'

type Props = {
  mode: Mode
  /** Time left, or time since, always as a positive span. */
  ms: number
  /** Date mode, past its target: the same span, now counting up. */
  past?: boolean
  /** The event's name, or nothing when it has none. */
  label?: string
  /** At zero, which the display says louder than the digits alone can. */
  done?: boolean
  theme: Theme
}

/**
 * Units are dropped from the front as they empty, so a five minute timer is not made to
 * read "0d 0h 5m 00s". Seconds always stay: a countdown that does not visibly move is
 * indistinguishable from one that has stopped.
 */
function segments(ms: number) {
  const { days, hours, minutes, seconds } = splitParts(ms)
  const all = [
    { value: days, unit: days === 1 ? 'day' : 'days' },
    { value: hours, unit: 'hrs' },
    { value: minutes, unit: 'min' },
    { value: seconds, unit: 'sec' },
  ]
  const first = all.findIndex((s) => s.value > 0)
  // Everything at zero still needs a face; seconds and minutes are it.
  return all.slice(first === -1 ? 2 : Math.min(first, 2))
}

export function TimeDisplay({ mode, ms, past, label, done, theme }: Props) {
  const font: CSSProperties = {
    fontFamily: theme.displayFont,
    fontWeight: theme.displayWeight,
    letterSpacing: theme.displayTracking,
  }

  return (
    <div className={`display${done ? ' is-done' : ''}`}>
      {label && <p className="display-label">{label}</p>}

      {mode === 'duration' ? (
        <p className="display-clock" style={font}>
          {formatClock(ms)}
        </p>
      ) : (
        <div className="display-segments">
          {segments(ms).map((segment, i) => (
            <div className="segment" key={segment.unit}>
              <span className="segment-value" style={font}>
                {/* The sign belongs to the whole span, not to each unit, so only the
                    leading segment carries it. */}
                {past && i === 0 ? '+' : ''}
                {segment.value}
              </span>
              <span className="segment-unit">{segment.unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
