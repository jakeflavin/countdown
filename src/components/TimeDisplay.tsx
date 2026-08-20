import type { CSSProperties } from 'react'
import {
  Clock,
  Display,
  Label,
  Prompt,
  Segment,
  SegmentUnit,
  SegmentValue,
  Segments,
} from './TimeDisplay.styled'
import { formatClock, splitParts } from '@/lib/duration'
import type { Theme } from '@/lib/themes'
import type { Mode } from '@/hooks/useSettings'

type TimeDisplayProps = {
  mode: Mode
  /** Time left, or time since, always as a positive span. */
  ms: number
  /** Date mode, with no target chosen yet. A span of zero is not a countdown at zero, and
   *  must not be drawn as one. */
  unset?: boolean
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

export function TimeDisplay({ mode, ms, unset, label, done, theme }: TimeDisplayProps) {
  const font: CSSProperties = {
    fontFamily: theme.displayFont,
    fontWeight: theme.displayWeight,
    letterSpacing: theme.displayTracking,
  }

  return (
    <Display $done={done}>
      {label && <Label>{label}</Label>}

      {mode === 'duration' ? (
        <Clock style={font}>
          {formatClock(ms)}
        </Clock>
      ) : unset ? (
        // Zeroes here would read as a countdown that had finished, which is the one thing
        // this screen does not mean.
        <Prompt style={font}>No date set</Prompt>
      ) : (
        <Segments>
          {segments(ms).map((segment) => (
            <Segment key={segment.unit}>
              {/* Direction is carried by the label above, in a word. A leading "+" was the
                  only difference between a date approaching and one long gone, and it was
                  both too quiet to notice and wide enough to push its own digit off the
                  centre of the unit beneath it. */}
              <SegmentValue style={font}>{segment.value}</SegmentValue>
              <SegmentUnit>{segment.unit}</SegmentUnit>
            </Segment>
          ))}
        </Segments>
      )}
    </Display>
  )
}
