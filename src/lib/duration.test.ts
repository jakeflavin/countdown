import { describe, it, expect } from 'vitest'
import { MINUTE, HOUR, SECOND, splitParts, partsToMs, formatClock } from './duration'

describe('splitParts', () => {
  it('rounds up, so a countdown never sits on a number it has passed', () => {
    // 4.2s left reads 5, not 4 — otherwise the display holds 0 for a whole second
    expect(splitParts(4.2 * SECOND).seconds).toBe(5)
    expect(splitParts(4.9 * SECOND).seconds).toBe(5)
  })

  it('reaches zero only at zero', () => {
    expect(splitParts(0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    expect(splitParts(1).seconds).toBe(1)
  })

  it('never goes negative once the timer overruns', () => {
    expect(splitParts(-5 * MINUTE)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  })

  it('carries into hours and days', () => {
    expect(splitParts(25 * HOUR + 90 * SECOND)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 30,
    })
  })
})

describe('partsToMs', () => {
  it('round-trips a split', () => {
    const ms = 2 * HOUR + 13 * MINUTE + 7 * SECOND
    expect(partsToMs(splitParts(ms))).toBe(ms)
  })

  it('treats missing units as zero', () => {
    expect(partsToMs({ minutes: 5 })).toBe(5 * MINUTE)
  })
})

describe('formatClock', () => {
  it('drops leading units rather than padding them', () => {
    expect(formatClock(5 * MINUTE)).toBe('5:00')
  })

  it('shows hours only once there are any', () => {
    expect(formatClock(59 * MINUTE + 59 * SECOND)).toBe('59:59')
    expect(formatClock(HOUR)).toBe('1:00:00')
  })

  it('pads the units that follow a larger one', () => {
    expect(formatClock(HOUR + 2 * MINUTE + 3 * SECOND)).toBe('1:02:03')
  })
})
