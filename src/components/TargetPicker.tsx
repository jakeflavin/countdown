import { useState } from 'react'
import {
  Calendar,
  CalendarHead,
  CalendarNav,
  Colon,
  Day,
  Grid,
  Month,
  TimeRow,
  TimeSelect,
  Weekday,
} from './TargetPicker.styled'
import { GroupField } from './drawer.styled'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  firstDayOfWeek,
  monthCells,
  monthLabel,
  prefers12Hour,
  sameDay,
  weekdayLabels,
} from '@/lib/calendar'

type TargetPickerProps = {
  /** The chosen moment, or null while nothing has been picked yet. */
  value: number | null
  onChange: (at: number) => void
}

/** Where a target with no time of day lands: the start of the working morning reads as
 *  a deliberate choice, where midnight reads like a bug. */
const DEFAULT_HOUR = 9

export function TargetPicker({ value, onChange }: TargetPickerProps) {
  const selected = value === null ? null : new Date(value)
  const today = new Date()

  // The month on show is its own state: paging through the calendar to look at
  // September should not move a target that is set in March.
  const [view, setView] = useState(() => {
    const from = selected ?? today
    return { year: from.getFullYear(), month: from.getMonth() }
  })

  const first = firstDayOfWeek()
  const cells = monthCells(view.year, view.month, first)
  const hour12 = prefers12Hour()

  // Time edits need a date to belong to, so an unset target starts from today rather
  // than refusing the edit.
  const base =
    selected ??
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), DEFAULT_HOUR, 0, 0, 0)

  const step = (by: number) => {
    const next = new Date(view.year, view.month + by, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() })
  }

  const pickDay = (day: number) => {
    // Picking a date keeps the time already chosen; only a first pick needs a default.
    const at = new Date(view.year, view.month, day, base.getHours(), base.getMinutes(), 0, 0)
    onChange(at.getTime())
  }

  const setTime = (hours: number, minutes: number) => {
    const at = new Date(base)
    at.setHours(hours, minutes, 0, 0)
    onChange(at.getTime())
  }

  const hours = base.getHours()
  const displayHour = hour12 ? hours % 12 || 12 : hours
  const hourOptions = hour12
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : Array.from({ length: 24 }, (_, i) => i)

  return (
    <>
      <Calendar>
        <CalendarHead>
          <CalendarNav onClick={() => step(-1)} aria-label="Previous month">
            <ChevronLeft size={16} />
          </CalendarNav>
          {/* Polite rather than assertive: paging months should not interrupt whatever
              a screen reader is in the middle of. */}
          <Month aria-live="polite">
            {monthLabel(view.year, view.month)}
          </Month>
          <CalendarNav onClick={() => step(1)} aria-label="Next month">
            <ChevronRight size={16} />
          </CalendarNav>
        </CalendarHead>

        <Grid role="grid">
          {weekdayLabels(first).map((label) => (
            <Weekday key={label} role="columnheader">
              {label}
            </Weekday>
          ))}

          {cells.map((cell) => {
            if (cell.day === null) return <span key={cell.key} />

            const date = new Date(view.year, view.month, cell.day)
            const isSelected = selected !== null && sameDay(date, selected)
            const isToday = sameDay(date, today)

            return (
              <Day
                key={cell.key}
                $selected={isSelected}
                $today={isToday}
                onClick={() => pickDay(cell.day!)}
                aria-pressed={isSelected}
                aria-label={date.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              >
                {cell.day}
              </Day>
            )
          })}
        </Grid>
      </Calendar>

      <GroupField $between>
        <label htmlFor="target-hour">Time</label>
        <TimeRow>
          <TimeSelect
            id="target-hour"
            value={displayHour}
            onChange={(e) => {
              const picked = Number(e.target.value)
              // In a 12-hour clock the hour and the meridiem are two halves of one
              // number, so the half that is not being edited has to be carried over.
              const next = hour12 ? (picked % 12) + (hours >= 12 ? 12 : 0) : picked
              setTime(next, base.getMinutes())
            }}
            aria-label="Hour"
          >
            {hourOptions.map((h) => (
              <option key={h} value={h}>
                {hour12 ? h : String(h).padStart(2, '0')}
              </option>
            ))}
          </TimeSelect>

          <Colon>:</Colon>

          <TimeSelect
            value={base.getMinutes()}
            onChange={(e) => setTime(hours, Number(e.target.value))}
            aria-label="Minute"
          >
            {Array.from({ length: 60 }, (_, m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </TimeSelect>

          {hour12 && (
            <TimeSelect
              value={hours >= 12 ? 'pm' : 'am'}
              onChange={(e) =>
                setTime((hours % 12) + (e.target.value === 'pm' ? 12 : 0), base.getMinutes())
              }
              aria-label="AM or PM"
            >
              <option value="am">AM</option>
              <option value="pm">PM</option>
            </TimeSelect>
          )}
        </TimeRow>
      </GroupField>
    </>
  )
}
