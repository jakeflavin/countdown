import { describe, expect, it } from 'vitest'
import { documentTitle } from './title'

describe('documentTitle', () => {
  it('reports a running timer', () => {
    expect(documentTitle({ mode: 'duration', status: 'running', clock: '4:57' })).toBe(
      '4:57 · Countdown',
    )
  })

  it('says a paused timer is paused rather than going quiet', () => {
    expect(documentTitle({ mode: 'duration', status: 'paused', clock: '4:57' })).toBe(
      '4:57 paused · Countdown',
    )
  })

  // The state the title matters most in: a backgrounded tab with the chime off.
  it('announces a finished timer', () => {
    expect(documentTitle({ mode: 'duration', status: 'done', clock: '0:00' })).toBe(
      "Time's up · Countdown",
    )
  })

  it('says nothing for a timer that has not been started', () => {
    expect(documentTitle({ mode: 'duration', status: 'idle', clock: '5:00' })).toBe('Countdown')
  })

  it('counts down to a target', () => {
    expect(documentTitle({ mode: 'date', targetAt: 1, past: false, span: '20h 46m' })).toBe(
      '20h 46m · Countdown',
    )
  })

  it('distinguishes a target that has passed with a word, not a sign', () => {
    expect(documentTitle({ mode: 'date', targetAt: 1, past: true, span: '3h' })).toBe(
      '3h ago · Countdown',
    )
  })

  it('says nothing when no target has been picked', () => {
    expect(documentTitle({ mode: 'date', targetAt: null, past: false, span: '0s' })).toBe(
      'Countdown',
    )
  })
})
