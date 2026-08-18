import { useCallback, useEffect, useRef, useState } from 'react'
import {
  elapsedOf,
  finishRun,
  idleRun,
  isActive,
  loadRun,
  pauseRun,
  remainingOf,
  resumeRun,
  saveRun,
  startRun,
  type TimerRun,
} from './timer'

type Options = {
  /** The duration a fresh run starts from. */
  durationMs: number
  /** Reached zero on its own. */
  onDone: (run: TimerRun) => void
  /** Stopped partway, with the time it had used. */
  onAbandon: (run: TimerRun, elapsedMs: number) => void
}

export function useTimer({ durationMs, onDone, onAbandon }: Options) {
  const [run, setRun] = useState(loadRun)
  // Held in refs so a callback identity changing on every render does not restart the
  // timer that ends the run.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const onAbandonRef = useRef(onAbandon)
  onAbandonRef.current = onAbandon

  useEffect(() => {
    saveRun(run)
  }, [run])

  // Zero arrives on a timer of its own rather than by watching the display clock: a
  // hidden tab throttles intervals to as little as one a minute, and the end of a run
  // is the one moment that must not wait for the next tick.
  useEffect(() => {
    if (run.status !== 'running') return
    const id = setTimeout(
      () => {
        onDoneRef.current(run)
        setRun(finishRun(run))
      },
      Math.max(0, run.endAt - Date.now()),
    )
    return () => clearTimeout(id)
  }, [run])

  // A finished run is a result, and setting a different duration — here, or by opening
  // someone's shared link — asks a new question. Holding zero on screen until the timer
  // is started again would answer the old one.
  useEffect(() => {
    if (run.status === 'done' && run.durationMs !== durationMs) setRun(idleRun)
  }, [durationMs, run.status, run.durationMs])

  const start = useCallback(() => {
    // Zero has nothing to count, and would finish in the same breath as it started.
    if (durationMs > 0) setRun(startRun(durationMs))
  }, [durationMs])

  const pause = useCallback(() => setRun(pauseRun(run)), [run])
  const resume = useCallback(() => setRun(resumeRun(run)), [run])

  /** Space and the main button both do whatever the run has left to do. */
  const toggle = useCallback(() => {
    if (run.status === 'running') setRun(pauseRun(run))
    else if (run.status === 'paused') setRun(resumeRun(run))
    else start()
  }, [run, start])

  const reset = useCallback(() => {
    // Abandoning a run partway is worth recording — the history is a record of what was
    // actually spent, not only of what ran to the end.
    if (isActive(run)) {
      const elapsed = elapsedOf(run, Date.now())
      if (elapsed > 0) onAbandonRef.current(run, elapsed)
    }
    setRun(idleRun)
  }, [run])

  const remaining = useCallback(
    (now: number) => remainingOf(run, now, durationMs),
    [run, durationMs],
  )

  return { run, start, pause, resume, toggle, reset, remaining }
}
