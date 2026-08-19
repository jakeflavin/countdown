/** Which kind of countdown a row came from. */
export type EntryKind = 'duration' | 'date'

export type SessionEntry = {
  kind: EntryKind
  /** How the row reads: a span like "25m", or the name the target was given. */
  label: string
  /** How long the run was, or had been going when it was stopped. */
  ms: number
  /** Ran to zero, rather than being reset partway. */
  completed: boolean
  at: number
  /**
   * Identity for the runs that can only happen once — a target date is reached a single
   * time, and must not be recorded again on every reload after it passes.
   */
  key?: string
}

export type Session = {
  entries: SessionEntry[]
}

export const emptySession: Session = { entries: [] }

/** Bounded so a long-running session cannot grow without limit. */
const MAX_ENTRIES = 500

const STORAGE_KEY = 'countdown.session'

export function loadSession(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptySession
    const parsed = JSON.parse(raw) as Partial<Session>
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] }
  } catch {
    return emptySession
  }
}

export function saveSession(session: Session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // A full or blocked store should not break the timer.
  }
}

export function addEntry(session: Session, entry: SessionEntry): Session {
  // A keyed entry is a fact that either has or has not happened, so recording it twice
  // is always a mistake rather than two runs that happen to match.
  if (entry.key && session.entries.some((e) => e.key === entry.key)) return session
  return { entries: [...session.entries, entry].slice(-MAX_ENTRIES) }
}

export const hasKey = (session: Session, key: string) => session.entries.some((e) => e.key === key)

const startOfDay = (ms: number) => {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export type SessionDay = {
  label: string
  entries: SessionEntry[]
}

/** Newest first, within newest-first days, which is how the history gets read. */
export function groupByDay(entries: SessionEntry[], now = Date.now()): SessionDay[] {
  const today = startOfDay(now)
  const dayMs = 86_400_000
  const byDay = new Map<number, SessionEntry[]>()

  for (const entry of entries) {
    const day = startOfDay(entry.at)
    const list = byDay.get(day)
    if (list) list.push(entry)
    else byDay.set(day, [entry])
  }

  return [...byDay.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([day, list]) => ({
      label:
        day === today
          ? 'Today'
          : day === today - dayMs
            ? 'Yesterday'
            : new Date(day).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              }),
      entries: [...list].sort((a, b) => b.at - a.at),
    }))
}

/** Time spent on runs that finished, which is the number worth a line at the top. */
export function completedMs(entries: SessionEntry[]) {
  return entries.reduce((total, e) => (e.completed ? total + e.ms : total), 0)
}
