import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { clampDuration, MINUTE } from '@/lib/duration'
import { defaultGradient, gradients } from '@/lib/gradients'
import { defaultTheme, type CustomKind } from '@/lib/themes'
import { hasShareParams, readInitialSettings } from '@/lib/shareUrl'

/** What the app is counting: a duration you start, or a moment on the calendar. */
export type Mode = 'duration' | 'date'

export type Settings = {
  mode: Mode
  /** The duration a fresh run starts from. */
  durationMs: number
  /** The moment date mode counts to, or null until one is picked. */
  targetAt: number | null
  /** What the target is, shown above the digits. Optional; the date speaks for itself. */
  eventName: string
  /** Sound a chime on reaching zero. */
  sound: boolean
  themeId: string
  /** Custom theme only: whether its background is a gradient or an uploaded picture.
   *  The picture itself is stored apart from the settings, because it is far too large
   *  to ride in a URL and has no business being written to one. */
  customKind: CustomKind
  customGradientId: string
}

const STORAGE_KEY = 'countdown.settings'

export const defaultSettings: Settings = {
  mode: 'duration',
  durationMs: 5 * MINUTE,
  targetAt: null,
  eventName: '',
  sound: true,
  themeId: defaultTheme.id,
  customKind: 'gradient',
  customGradientId: defaultGradient.id,
}

export const modes: Array<{ id: Mode; name: string }> = [
  { id: 'duration', name: 'Duration' },
  { id: 'date', name: 'Date' },
]

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    return migrate(JSON.parse(raw))
  } catch {
    return defaultSettings
  }
}

/** Fills in anything missing, so a stored object written by an older build cannot put
 *  the app into a state it has no control for. */
export function migrate(stored: Partial<Settings>): Settings {
  return {
    ...defaultSettings,
    ...stored,
    mode: stored.mode === 'date' ? 'date' : 'duration',
    durationMs: clampDuration(stored.durationMs ?? defaultSettings.durationMs),
    targetAt:
      typeof stored.targetAt === 'number' && Number.isFinite(stored.targetAt)
        ? stored.targetAt
        : null,
    customKind: stored.customKind === 'image' ? 'image' : 'gradient',
    customGradientId: gradients.some((g) => g.id === stored.customGradientId)
      ? stored.customGradientId!
      : defaultGradient.id,
  }
}

export function useSettings() {
  // A shared link's options win over what this browser had stored, for this visit.
  const [settings, setSettings] = useState<Settings>(() => readInitialSettings(load()))

  /*
   * A link describes someone else's countdown, so following one is a visit rather than a
   * change of mind. Writing its options straight to storage overwrote whatever this
   * browser already had and never gave it back: a link carrying `sound=0` left the
   * recipient's chime off on every later visit, silently and with nothing to undo.
   *
   * So a link-borne state is held in memory only. The first setting the visitor actually
   * changes is the point they made it theirs, and from there it saves as it always did.
   */
  const [borrowed, setBorrowed] = useState(
    () => hasShareParams(new URLSearchParams(window.location.search)),
  )

  useEffect(() => {
    if (borrowed) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings, borrowed])

  const change: Dispatch<SetStateAction<Settings>> = useCallback((next) => {
    setBorrowed(false)
    setSettings(next)
  }, [])

  return [settings, change] as const
}
