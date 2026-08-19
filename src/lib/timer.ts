export type TimerStatus = 'idle' | 'running' | 'paused' | 'done'

/**
 * A run of the duration timer. Time is held as the wall clock moment it ends rather
 * than as a decrementing number: an interval that misses ticks — a throttled tab, a
 * sleeping laptop — then costs nothing, because every reading is taken from the clock.
 */
export type TimerRun = {
  status: TimerStatus
  /** When a running timer reaches zero. Meaningless unless running. */
  endAt: number
  /** The frozen remainder. Meaningless unless paused. */
  remainingMs: number
  /** What this run started from, so reset and the history know its length. */
  durationMs: number
}

export const idleRun: TimerRun = {
  status: 'idle',
  endAt: 0,
  remainingMs: 0,
  durationMs: 0,
}

const STORAGE_KEY = 'countdown.timer'

const statuses: TimerStatus[] = ['idle', 'running', 'paused', 'done']

/** A run outlives the tab, so closing the page mid-timer and coming back to it later
 *  picks up exactly where the clock says it should be. */
export function loadRun(): TimerRun {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return idleRun
    const parsed = JSON.parse(raw) as Partial<TimerRun>
    if (!statuses.includes(parsed.status as TimerStatus)) return idleRun
    return {
      status: parsed.status as TimerStatus,
      endAt: Number(parsed.endAt) || 0,
      remainingMs: Number(parsed.remainingMs) || 0,
      durationMs: Number(parsed.durationMs) || 0,
    }
  } catch {
    return idleRun
  }
}

export function saveRun(run: TimerRun) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(run))
  } catch {
    // A full or blocked store should not stop the clock.
  }
}

export function startRun(durationMs: number, now = Date.now()): TimerRun {
  return { status: 'running', endAt: now + durationMs, remainingMs: durationMs, durationMs }
}

export function pauseRun(run: TimerRun, now = Date.now()): TimerRun {
  if (run.status !== 'running') return run
  return { ...run, status: 'paused', remainingMs: Math.max(0, run.endAt - now) }
}

export function resumeRun(run: TimerRun, now = Date.now()): TimerRun {
  if (run.status !== 'paused') return run
  return { ...run, status: 'running', endAt: now + run.remainingMs }
}

export function finishRun(run: TimerRun): TimerRun {
  return { ...run, status: 'done', endAt: 0, remainingMs: 0 }
}

/** What is left to show. An idle timer has no run of its own, so it reports the
 *  duration currently set. */
export function remainingOf(run: TimerRun, now: number, idleMs: number) {
  switch (run.status) {
    case 'running':
      return Math.max(0, run.endAt - now)
    case 'paused':
      return run.remainingMs
    case 'done':
      return 0
    case 'idle':
      return idleMs
  }
}

/** How much of a run has been used, which is what a reset records. */
export function elapsedOf(run: TimerRun, now: number) {
  return Math.max(0, run.durationMs - remainingOf(run, now, run.durationMs))
}

export const isActive = (run: TimerRun) => run.status === 'running' || run.status === 'paused'
