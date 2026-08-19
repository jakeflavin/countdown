import { useEffect, useState } from 'react'

/** Fast enough that the bar slides and a second never lands visibly late, slow enough
 *  that the whole tree is not re-rendered at frame rate. */
const TICK_MS = 100

/**
 * A clock that advances while something on screen depends on it. Every consumer reads
 * the real time from it, so the display can never drift — the tick only decides how
 * often the answer is refreshed.
 */
export function useNow(active = true) {
  const [now, setNow] = useState(() => Date.now())
  const [wasActive, setWasActive] = useState(active)

  // The clock stands still while nothing needs it, so by the time it is wanted again it
  // is however stale that idle spell left it. Catching up here rather than in an effect
  // is what stops a started timer from being painted once as the time since the page
  // was loaded.
  if (active !== wasActive) {
    setWasActive(active)
    if (active) setNow(Date.now())
  }

  useEffect(() => {
    if (!active) return

    const id = setInterval(() => setNow(Date.now()), TICK_MS)
    // A hidden tab has its timers throttled hard, so the first thing to do on coming
    // back is read the clock rather than wait out the rest of an interval.
    const onVisible = () => setNow(Date.now())
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [active])

  return now
}
