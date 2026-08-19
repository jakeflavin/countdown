import { clampDuration } from './duration'
import { defaultGradient, gradients } from './gradients'
import { CUSTOM_THEME_ID, themes } from './themes'
// Type-only, so this module and useSettings do not form a runtime import cycle.
import type { Mode, Settings } from '@/hooks/useSettings'

/**
 * A link carries the setup, not the progress: the point of sharing a duration is "here
 * is a 25 minute timer", and the point of sharing a date is the date itself. Only the
 * options that apply to the chosen mode are written, so a shared date link does not
 * carry a duration that has no effect on it.
 */
export function settingsToParams(settings: Settings) {
  const params = new URLSearchParams()
  params.set('mode', settings.mode)
  if (settings.mode === 'duration') {
    params.set('dur', String(settings.durationMs))
  } else {
    if (settings.targetAt !== null) params.set('target', String(settings.targetAt))
    if (settings.eventName) params.set('name', settings.eventName)
  }
  // Written as an explicit 1/0 rather than omitted when off: an absent flag falls back
  // to the recipient's own default, which would flip a shared "off" back on.
  params.set('sound', settings.sound ? '1' : '0')
  params.set('theme', settings.themeId)
  // Only the custom theme has these, and only its gradient can travel: a picture lives
  // on the device that chose it, so a link asking for one arrives with none and the
  // recipient sees the gradient instead.
  if (settings.themeId === CUSTOM_THEME_ID) {
    params.set('bg', settings.customKind)
    params.set('grad', settings.customGradientId)
  }
  return params
}

function readInt(raw: string | null, fallback: number) {
  // An empty param is absent, not zero — Number('') is 0, which would silently rewrite
  // the duration.
  if (raw === null || raw.trim() === '') return fallback
  const value = Number(raw)
  return Number.isFinite(value) ? Math.trunc(value) : fallback
}

/** Anything unrecognized falls back, so a hand-edited link can never break the app. */
export function settingsFromParams(params: URLSearchParams, base: Settings): Settings {
  const mode = params.get('mode')
  const theme = params.get('theme')
  const target = params.get('target')
  const grad = params.get('grad')
  const bg = params.get('bg')

  return {
    mode: mode === 'duration' || mode === 'date' ? (mode as Mode) : base.mode,
    durationMs: clampDuration(readInt(params.get('dur'), base.durationMs)),
    targetAt: target === null ? base.targetAt : readInt(target, base.targetAt ?? 0) || null,
    eventName: params.get('name') ?? base.eventName,
    sound: params.has('sound') ? params.get('sound') === '1' : base.sound,
    themeId:
      theme === CUSTOM_THEME_ID || themes.some((t) => t.id === theme) ? theme! : base.themeId,
    customKind: bg === 'image' || bg === 'gradient' ? bg : base.customKind,
    customGradientId: gradients.some((g) => g.id === grad)
      ? grad!
      : base.customGradientId || defaultGradient.id,
  }
}

export function hasShareParams(params: URLSearchParams) {
  return ['mode', 'dur', 'target', 'name', 'sound', 'theme', 'bg', 'grad'].some((key) =>
    params.has(key),
  )
}

export function readInitialSettings(stored: Settings): Settings {
  const params = new URLSearchParams(window.location.search)
  return hasShareParams(params) ? settingsFromParams(params, stored) : stored
}

export function buildShareUrl(settings: Settings) {
  const url = new URL(window.location.href)
  url.search = settingsToParams(settings).toString()
  url.hash = ''
  return url.toString()
}
