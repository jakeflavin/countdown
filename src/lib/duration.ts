export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

/** The largest duration the app will hold, so a stray paste cannot produce a timer
 *  measured in centuries. */
export const MAX_DURATION = 99 * HOUR + 59 * MINUTE + 59 * SECOND

export type Parts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Whole units, rounded up rather than down: with 4.2s left a display showing "4" would
 * sit on 0 for a full second before anything happened, so a countdown reads 5 → 4 → …
 * → 1 → 0, and 0 means zero.
 */
export function splitParts(ms: number): Parts {
  const total = Math.max(0, Math.ceil(ms / SECOND))
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

export function partsToMs({ days = 0, hours = 0, minutes = 0, seconds = 0 }: Partial<Parts>) {
  return days * DAY + hours * HOUR + minutes * MINUTE + seconds * SECOND
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Clock face for a set duration: mm:ss until an hour is involved, and only then h:mm:ss.
 * Leading units are dropped rather than padded so a five minute timer reads "5:00"
 * instead of "00:05:00".
 */
export function formatClock(ms: number) {
  const { days, hours, minutes, seconds } = splitParts(ms)
  const allHours = days * 24 + hours
  return allHours > 0 ? `${allHours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

/** How long a run was, for a history row: "25m", "1h 30m", "45s". */
export function formatSpan(ms: number) {
  const { days, hours, minutes, seconds } = splitParts(ms)
  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  // Seconds are noise beside a span measured in hours, but they are the whole story
  // for a short one.
  if (seconds && !days && !hours) parts.push(`${seconds}s`)
  return parts.length ? parts.join(' ') : '0s'
}

/** The target moment, written out for the button that opens its setting. */
export function formatTarget(at: number) {
  return new Date(at).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const clampDuration = (ms: number) => Math.min(MAX_DURATION, Math.max(0, Math.trunc(ms)))
