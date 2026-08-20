import type { TimerStatus } from './timer'

const NAME = 'Countdown'

/**
 * What the tab strip says. Reading it should be enough to know where a countdown has got
 * to, which means every state worth leaving in a background tab — not only a running one.
 *
 * A finished timer is the state that most needs this and the one a title is easiest to
 * forget: the chime can be off, the tab can be muted, and then the title is the only
 * channel left.
 */
export type TitleState =
  | { mode: 'duration'; status: TimerStatus; clock: string }
  | { mode: 'date'; targetAt: number | null; past: boolean; span: string }

export function documentTitle(state: TitleState): string {
  if (state.mode === 'duration') {
    switch (state.status) {
      case 'running':
        return `${state.clock} · ${NAME}`
      case 'paused':
        return `${state.clock} paused · ${NAME}`
      case 'done':
        return `Time's up · ${NAME}`
      // An idle timer has not been asked to count anything yet, so it has nothing to report.
      case 'idle':
        return NAME
    }
  }
  // Likewise a date mode with no target: the span to nothing is not news.
  if (state.targetAt === null) return NAME
  // "ago" rather than a leading "+", for the same reason the display carries the word:
  // a sign is not legible at a glance in a tab strip a centimetre wide.
  return state.past ? `${state.span} ago · ${NAME}` : `${state.span} · ${NAME}`
}
