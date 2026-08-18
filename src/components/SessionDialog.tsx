import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { formatSpan } from '../duration'
import { completedMs, groupByDay, type Session } from '../session'

type Props = {
  open: boolean
  onClose: () => void
  session: Session
  onClear: () => void
}

export function SessionDialog({ open, onClose, session, onClear }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  // Backdrop clicks are dispatched on the dialog itself, so a hit test against its box
  // is what separates "clicked the backdrop" from "clicked inside the drawer".
  const onDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target !== ref.current) return
    const { top, right, bottom, left } = ref.current.getBoundingClientRect()
    const outside =
      e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom
    if (outside) onClose()
  }

  const days = groupByDay(session.entries)
  const finished = completedMs(session.entries)

  return (
    <dialog
      ref={ref}
      className="drawer drawer-session"
      onClose={onClose}
      onClick={onDialogClick}
    >
      <div className="settings-header">
        <h2>History</h2>
        <button className="icon-button" onClick={onClose} aria-label="Close history">
          <X size={18} />
        </button>
      </div>

      {days.length === 0 ? (
        <p className="settings-hint">
          Nothing counted yet. Timers you run will collect here.
        </p>
      ) : (
        <>
          <p className="options-count">
            {session.entries.length} {session.entries.length === 1 ? 'run' : 'runs'}
            {/* The total is what the history is actually for: how much time went where. */}
            {finished > 0 && ` · ${formatSpan(finished)} finished`}
          </p>

          {days.map((day) => (
            <section key={day.label} className="session-day">
              <h3 className="session-day-label">{day.label}</h3>
              <ul className="session-list">
                {day.entries.map((entry) => (
                  <li key={`${entry.at}-${entry.label}`}>
                    <span className="session-value">{entry.label}</span>
                    <span className="session-meta">
                      {/* A run that was cut short is a different fact from one that
                          finished, and the list is misleading if it says otherwise. */}
                      <span>
                        {entry.completed
                          ? entry.kind === 'date'
                            ? 'Arrived'
                            : 'Finished'
                          : `Stopped at ${formatSpan(entry.ms)}`}
                      </span>
                      <time dateTime={new Date(entry.at).toISOString()}>
                        {new Date(entry.at).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </time>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Quiet by default: it destroys the history, so it should not compete with
              reading the list. */}
          <button className="link-button is-danger" onClick={onClear}>
            Clear history
          </button>
        </>
      )}
    </dialog>
  )
}
