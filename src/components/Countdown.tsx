import { useEffect, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { isDrawerOpen, isTypingTarget, targetElement } from '../lib/shortcuts'
import type { Theme } from '../lib/themes'
import type { TimerStatus } from '../lib/timer'
import type { Mode } from '../hooks/useSettings'
import { TimeDisplay } from './TimeDisplay'

type CountdownProps = {
  mode: Mode
  /** Time left, or time since a target that has passed. */
  ms: number
  past?: boolean
  label?: string
  done?: boolean
  theme: Theme
  status: TimerStatus
  /** Duration mode: start, pause, or resume, whichever the run has left to do. */
  onToggle: () => void
  onReset: () => void
  /** Date mode: the target's own button, which opens the setting that changes it. */
  targetLabel: string
  onEditTarget: () => void
  /** Secondary controls, grouped opposite the primary button. */
  tools?: ReactNode
}

/** The button says what pressing it does, which is a different thing at each stage of
 *  a run. */
function actionLabel(status: TimerStatus) {
  switch (status) {
    case 'running':
      return 'Pause'
    case 'paused':
      return 'Resume'
    case 'done':
      return 'Start again'
    case 'idle':
      return 'Start'
  }
}

export function Countdown({
  mode,
  ms,
  past,
  label,
  done,
  theme,
  status,
  onToggle,
  onReset,
  targetLabel,
  onEditTarget,
  tools,
}: CountdownProps) {
  const isDuration = mode === 'duration'

  useEffect(() => {
    if (!isDuration) return

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isDrawerOpen() || isTypingTarget(e.target)) return

      if (e.key === ' ' || e.key === 'Enter') {
        // A focused button already activates on Space and Enter; handling it here as
        // well would start and pause in one press.
        if (targetElement(e.target)?.closest('button')) return
        e.preventDefault()
        onToggle()
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault()
        onReset()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isDuration, onToggle, onReset])

  return (
    <div className="stage">
      <div className="stage-display">
        <TimeDisplay
          mode={mode}
          ms={ms}
          past={past}
          label={label}
          done={done}
          theme={theme}
        />
      </div>

      {/* Opposite corners: the secondary controls to one side, the primary button to
          the other. Neither is centred, and the button is sized to its label rather
          than to the window — a full-width one became a target the width of a
          paragraph on a desktop. */}
      <div className="stage-actions">
        <div className="stage-tools">{tools}</div>

        {/* Reset is an action on the run, not a tool for looking things up, so it
            travels with the button it undoes rather than with share and history.
            Nothing to undo from a timer that has not started, so it stays out of the
            way until there is. */}
        <div className="stage-primary">
          {isDuration && status !== 'idle' && (
            <button className="icon-button" onClick={onReset} aria-label="Reset the timer">
              <RotateCcw size={18} />
            </button>
          )}

          {isDuration ? (
            <button className="primary-button" onClick={onToggle}>
              {actionLabel(status)}
            </button>
          ) : (
            <button className="primary-button" onClick={onEditTarget}>
              {targetLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
