import { useEffect, useRef, useState } from 'react'
import { DayGroup, DayLabel, RunMeta, RunValue, Runs } from './SessionDialog.styled'
import { Confirm, ConfirmRow, Drawer, DrawerHeader, Hint, LinkButton, OptionsCount } from './drawer.styled'
import { IconButton } from './buttons.styled'
import { X } from 'lucide-react'
import { formatSpan } from '@/lib/duration'
import { completedMs, groupByDay, type Session } from '@/lib/session'

type SessionDialogProps = {
  open: boolean
  onClose: () => void
  session: Session
  onClear: () => void
}

export function SessionDialog({ open, onClose, session, onClear }: SessionDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  // Clearing is irreversible and nothing else keeps a copy, so it asks once. Held here
  // rather than in the button so that closing the drawer disarms it — coming back to a
  // history already primed for deletion would be its own kind of trap.
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
    if (!open) setConfirming(false)
  }, [open])

  // Backdrop clicks are dispatched on the dialog itself, so a hit test against its box
  // is what separates "clicked the backdrop" from "clicked inside the drawer".
  const onDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target !== ref.current) return
    const { top, right, bottom, left } = ref.current.getBoundingClientRect()
    const outside = e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom
    if (outside) onClose()
  }

  const days = groupByDay(session.entries)
  const finished = completedMs(session.entries)

  return (
    <Drawer ref={ref} onClose={onClose} onClick={onDialogClick}>
      <DrawerHeader>
        <h2>History</h2>
        <IconButton onClick={onClose} aria-label="Close history">
          <X size={18} />
        </IconButton>
      </DrawerHeader>

      {days.length === 0 ? (
        <Hint>Nothing counted yet. Timers you run will collect here.</Hint>
      ) : (
        <>
          <OptionsCount>
            {session.entries.length} {session.entries.length === 1 ? 'run' : 'runs'}
            {/* The total is what the history is actually for: how much time went where. */}
            {finished > 0 && ` · ${formatSpan(finished)} finished`}
          </OptionsCount>

          {days.map((day) => (
            <DayGroup key={day.label}>
              <DayLabel>{day.label}</DayLabel>
              <Runs>
                {day.entries.map((entry) => (
                  <li key={`${entry.at}-${entry.label}`}>
                    <RunValue>{entry.label}</RunValue>
                    <RunMeta>
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
                    </RunMeta>
                  </li>
                ))}
              </Runs>
            </DayGroup>
          ))}

          {/* Quiet by default: it destroys the history, so it should not compete with
              reading the list. Quiet, though, is a statement about weight — not a reason
              to let one stray click take a fortnight of runs with nothing to undo. */}
          {confirming ? (
            <ConfirmRow>
              <span>
                Clear {session.entries.length}{' '}
                {session.entries.length === 1 ? 'run' : 'runs'}?
              </span>
              <LinkButton onClick={() => setConfirming(false)}>Keep</LinkButton>
              <Confirm
                onClick={() => {
                  onClear()
                  setConfirming(false)
                }}
              >
                Clear
              </Confirm>
            </ConfirmRow>
          ) : (
            <LinkButton $danger onClick={() => setConfirming(true)}>
              Clear history
            </LinkButton>
          )}
        </>
      )}
    </Drawer>
  )
}
