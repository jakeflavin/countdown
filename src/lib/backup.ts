import { clampDuration } from './duration'
import { defaultGradient, gradients } from './gradients'
import { emptySession, type Session, type SessionEntry } from './session'
import { CUSTOM_THEME_ID, themes } from './themes'
import type { Settings } from '@/hooks/useSettings'

/** Bumped only if the shape changes in a way an older file cannot satisfy. */
export const BACKUP_VERSION = 1

export type Backup = {
  app: 'countdown'
  version: number
  exportedAt: string
  settings: Settings
  session: Session
}

export function buildBackup(settings: Settings, session: Session): Backup {
  return {
    app: 'countdown',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    session,
  }
}

export function backupFilename(now = new Date()) {
  const date = now.toISOString().slice(0, 10)
  return `countdown-${date}.json`
}

type Raw = Record<string, unknown>

const asBool = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback

const asFiniteNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

/** Every field is checked against what this build knows, so an edited or older file
 *  degrades to defaults rather than putting the app into a state it cannot render. */
function coerceSettings(raw: unknown, base: Settings): Settings {
  const r = (raw ?? {}) as Raw
  const duration = asFiniteNumber(r.durationMs)

  return {
    mode: r.mode === 'date' ? 'date' : r.mode === 'duration' ? 'duration' : base.mode,
    durationMs: duration === null ? base.durationMs : clampDuration(duration),
    targetAt: asFiniteNumber(r.targetAt),
    eventName: typeof r.eventName === 'string' ? r.eventName : base.eventName,
    sound: asBool(r.sound, base.sound),
    themeId:
      r.themeId === CUSTOM_THEME_ID || themes.some((t) => t.id === r.themeId)
        ? (r.themeId as string)
        : base.themeId,
    customKind: r.customKind === 'image' ? 'image' : 'gradient',
    customGradientId: gradients.some((g) => g.id === r.customGradientId)
      ? (r.customGradientId as string)
      : defaultGradient.id,
  }
}

function isEntry(value: unknown): value is SessionEntry {
  const e = (value ?? {}) as Raw
  return (
    (e.kind === 'duration' || e.kind === 'date') &&
    typeof e.label === 'string' &&
    typeof e.ms === 'number' &&
    Number.isFinite(e.ms) &&
    typeof e.completed === 'boolean' &&
    typeof e.at === 'number' &&
    Number.isFinite(e.at) &&
    (e.key === undefined || typeof e.key === 'string')
  )
}

/** Unreadable entries are dropped rather than failing the whole import — one bad row
 *  should not cost someone the rest of their history. */
function coerceSession(raw: unknown): Session {
  const r = (raw ?? {}) as Raw
  return { entries: Array.isArray(r.entries) ? r.entries.filter(isEntry) : [] }
}

export type ParsedBackup = {
  settings: Settings
  session: Session
}

export class BackupError extends Error {}

export function parseBackup(text: string, base: Settings): ParsedBackup {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new BackupError("That file isn't valid JSON.")
  }

  const data = (raw ?? {}) as Raw
  if (data.app !== 'countdown') throw new BackupError("That file isn't a Countdown export.")
  if (typeof data.version !== 'number' || data.version > BACKUP_VERSION) {
    throw new BackupError('That export came from a newer version of Countdown.')
  }

  return {
    settings: coerceSettings(data.settings, base),
    session: data.session ? coerceSession(data.session) : emptySession,
  }
}

export function downloadBackup(backup: Backup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = backupFilename()
  link.click()
  // Revoking immediately can cancel the download in some browsers, so it waits a tick.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
