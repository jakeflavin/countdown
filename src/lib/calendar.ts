/** Which day a week starts on here — Monday in most of the world, Sunday in some of
 *  it. Expressed as a `getDay()` index, so 0 is Sunday. */
export function firstDayOfWeek(): number {
  type WithWeekInfo = Intl.Locale & {
    weekInfo?: { firstDay?: number }
    getWeekInfo?: () => { firstDay: number }
  }

  try {
    const locale = new Intl.Locale(navigator.language) as WithWeekInfo
    // Two spellings of the same thing: a getter in newer engines, a property in older
    // ones, and absent in the rest.
    const info = locale.getWeekInfo?.() ?? locale.weekInfo
    // The standard numbers Monday 1 … Sunday 7, while getDay() numbers Sunday 0.
    return (info?.firstDay ?? 7) % 7
  } catch {
    return 0
  }
}

/** Short weekday names in the order this locale lays a week out. */
export function weekdayLabels(first = firstDayOfWeek()): string[] {
  const format = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
  // Any week will do; this one starts on a Sunday. Built in local time rather than UTC,
  // because the formatter reads it in local time: a UTC midnight is the previous day
  // everywhere west of Greenwich, which shifted every label back by one.
  return Array.from({ length: 7 }, (_, i) =>
    format.format(new Date(2024, 0, 7 + ((first + i) % 7))),
  )
}

export type MonthCell = {
  /** The day of the month, or null for the padding before the first of it. */
  day: number | null
  key: string
}

/** A month as the cells of a seven-column grid, padded at the front so the first lands
 *  under its own weekday. */
export function monthCells(year: number, month: number, first = firstDayOfWeek()): MonthCell[] {
  const leading = (new Date(year, month, 1).getDay() - first + 7) % 7
  const days = new Date(year, month + 1, 0).getDate()

  return [
    ...Array.from({ length: leading }, (_, i) => ({ day: null, key: `pad-${i}` })),
    ...Array.from({ length: days }, (_, i) => ({ day: i + 1, key: `day-${i + 1}` })),
  ]
}

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

/** Whether the clock here is written 1–12 with AM/PM, or 0–23. */
export function prefers12Hour() {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hour12 ?? false
}
