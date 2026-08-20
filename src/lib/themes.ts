/**
 * A theme is a calming scene rather than a gradient: a short video that loops behind
 * the time, with the colors the chrome needs to stay legible on top of it.
 *
 * Each clip is rendered so that its last frame is its first frame, which is what makes
 * the loop seamless — see scripts/README.md for how the assets are produced.
 */
export type Theme = {
  id: string
  name: string
  /** One line on what the scene is, shown under its name in settings. */
  description: string
  /** Painted under the video: the scene's average color, so the first paint and any
   *  letterboxed edge match rather than flash. */
  base: string
  /** Washed over the video so the time reads against moving pictures. */
  scrim: string
  /** Text and chrome colors that sit on top of the scrim. */
  text: string
  muted: string
  /** Surface used for the drawers and buttons. */
  surface: string
  border: string
  /** Font stack for the big time. */
  displayFont: string
  displayWeight: number
  displayTracking: string
}

/** The scene files for a theme, by orientation. A phone held upright is served a clip
 *  framed for it rather than the middle of a wide one. */
export type Orientation = 'landscape' | 'portrait'

/** Resolves a public asset against the base path the app is served from. Vite cannot
 *  rewrite runtime-concatenated URLs, so these have to go through BASE_URL by hand. */
const asset = (relativePath: string) => `${import.meta.env.BASE_URL}${relativePath}`

export const sceneVideo = (id: string, orientation: Orientation) =>
  asset(`scenes/${id}-${orientation}.mp4`)

export const scenePoster = (id: string, orientation: Orientation) =>
  asset(`scenes/${id}-${orientation}.jpg`)

export const themes: Theme[] = [
  {
    id: 'drift',
    name: 'Drift',
    description: 'Dawn clouds over a still lake.',
    base: '#e9dfe0',
    // A light scene needs the wash to hold the highlights down, not to darken it.
    scrim:
      'radial-gradient(120% 90% at 50% 30%, rgba(255, 252, 250, 0.34) 0%, rgba(255, 252, 250, 0.1) 60%),' +
      'linear-gradient(180deg, rgba(255, 253, 252, 0.2) 0%, rgba(232, 222, 224, 0.42) 100%)',
    text: '#22323c',
    // Heavier than the dark scenes' 0.62. The same alpha sinks a light ink toward a dark
    // ground but lifts a dark ink toward a light one, so on the only light scene it has
    // to be raised to reach the same contrast — 4.5:1 against the scene itself, where
    // the unit labels sit with no surface under them, and 6.9:1 inside the drawer.
    muted: 'rgba(34, 50, 60, 0.82)',
    surface: 'rgba(255, 255, 255, 0.82)',
    // Same correction, for the same reason: at 0.18 the preset pills were 1.4:1 against
    // the drawer and read as ghosts, where the dark scenes' hairlines land near 1.7:1.
    border: 'rgba(34, 50, 60, 0.28)',
    displayFont: '"Instrument Serif", Georgia, serif',
    displayWeight: 400,
    displayTracking: '-0.02em',
  },
  {
    id: 'tide',
    name: 'Tide',
    description: 'Slow surf on dark sand at dusk.',
    base: '#1d2733',
    scrim:
      'radial-gradient(120% 90% at 50% 35%, rgba(10, 16, 24, 0.24) 0%, rgba(8, 13, 20, 0.48) 65%),' +
      'linear-gradient(180deg, rgba(8, 13, 20, 0.3) 0%, rgba(8, 13, 20, 0.58) 100%)',
    text: '#eef3f8',
    muted: 'rgba(238, 243, 248, 0.62)',
    surface: 'rgba(16, 24, 34, 0.7)',
    border: 'rgba(238, 243, 248, 0.18)',
    displayFont: '"Inter", system-ui, sans-serif',
    displayWeight: 700,
    displayTracking: '-0.04em',
  },
  {
    id: 'grove',
    name: 'Grove',
    description: 'Sunlight moving through a forest canopy.',
    base: '#26331f',
    // Grove is the one scene that is brightest exactly where the time sits — the sun
    // comes down through the canopy into the middle of the frame — so its wash is
    // heaviest at the centre rather than at the edges.
    scrim:
      'radial-gradient(90% 70% at 50% 42%, rgba(10, 17, 9, 0.52) 0%, rgba(10, 17, 9, 0.34) 55%, rgba(10, 17, 9, 0.3) 100%),' +
      'linear-gradient(180deg, rgba(10, 17, 9, 0.3) 0%, rgba(10, 17, 9, 0.5) 100%)',
    text: '#f1f6ea',
    muted: 'rgba(241, 246, 234, 0.62)',
    surface: 'rgba(20, 30, 17, 0.72)',
    border: 'rgba(241, 246, 234, 0.18)',
    displayFont: '"Instrument Serif", Georgia, serif',
    displayWeight: 400,
    displayTracking: '-0.02em',
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'A low fire burning down to coals.',
    base: '#1a0f0a',
    scrim:
      'radial-gradient(120% 90% at 50% 40%, rgba(20, 10, 6, 0.2) 0%, rgba(14, 8, 5, 0.52) 65%),' +
      'linear-gradient(180deg, rgba(14, 8, 5, 0.34) 0%, rgba(14, 8, 5, 0.6) 100%)',
    text: '#ffeade',
    muted: 'rgba(255, 234, 222, 0.6)',
    surface: 'rgba(30, 17, 12, 0.74)',
    border: 'rgba(255, 234, 222, 0.18)',
    displayFont: '"Inter", system-ui, sans-serif',
    displayWeight: 700,
    displayTracking: '-0.045em',
  },
  {
    id: 'rain',
    name: 'Rain',
    description: 'Rain running down a window at night.',
    base: '#111722',
    scrim:
      'radial-gradient(120% 90% at 50% 35%, rgba(8, 12, 20, 0.24) 0%, rgba(6, 10, 17, 0.5) 65%),' +
      'linear-gradient(180deg, rgba(6, 10, 17, 0.32) 0%, rgba(6, 10, 17, 0.58) 100%)',
    text: '#e8edf7',
    muted: 'rgba(232, 237, 247, 0.6)',
    surface: 'rgba(14, 20, 30, 0.74)',
    border: 'rgba(232, 237, 247, 0.18)',
    displayFont: '"JetBrains Mono", ui-monospace, monospace',
    displayWeight: 600,
    displayTracking: '-0.03em',
  },
  {
    id: 'snow',
    name: 'Snow',
    description: 'Snowfall over pines at blue hour.',
    base: '#2a3a52',
    scrim:
      'radial-gradient(120% 90% at 50% 35%, rgba(18, 28, 44, 0.2) 0%, rgba(16, 25, 40, 0.46) 65%),' +
      'linear-gradient(180deg, rgba(16, 25, 40, 0.26) 0%, rgba(16, 25, 40, 0.54) 100%)',
    text: '#eef3fb',
    muted: 'rgba(238, 243, 251, 0.62)',
    surface: 'rgba(22, 33, 50, 0.72)',
    border: 'rgba(238, 243, 251, 0.18)',
    displayFont: '"Inter", system-ui, sans-serif',
    displayWeight: 600,
    displayTracking: '-0.04em',
  },
  {
    id: 'meadow',
    name: 'Meadow',
    description: 'Wind moving through summer grass.',
    base: '#b8894f',
    // The sun sits high and bright near the middle of the frame, exactly where the time
    // does, so this wash is heaviest at the centre rather than at the edges.
    scrim:
      'radial-gradient(90% 70% at 50% 42%, rgba(28, 18, 8, 0.5) 0%, rgba(28, 18, 8, 0.32) 55%, rgba(28, 18, 8, 0.28) 100%),' +
      'linear-gradient(180deg, rgba(28, 18, 8, 0.28) 0%, rgba(28, 18, 8, 0.48) 100%)',
    text: '#fff6ea',
    muted: 'rgba(255, 246, 234, 0.62)',
    surface: 'rgba(46, 30, 18, 0.74)',
    border: 'rgba(255, 246, 234, 0.18)',
    displayFont: '"Inter", system-ui, sans-serif',
    displayWeight: 800,
    displayTracking: '-0.05em',
  },
]

export const defaultTheme = themes.find((t) => t.id === 'drift')!

export function themeById(id: string): Theme {
  return themes.find((t) => t.id === id) ?? defaultTheme
}

/** The custom theme is not a scene, so it has no clip of its own; what sits behind the
 *  time is whatever the user chose. */
export const CUSTOM_THEME_ID = 'custom'

/** How the custom theme's background is supplied. A gradient travels in a shared link;
 *  an uploaded picture cannot, and is kept on the device that chose it. */
export type CustomKind = 'gradient' | 'image'

/** What actually gets painted behind the time. */
export type Backdrop =
  { kind: 'scene'; id: string } | { kind: 'gradient'; css: string } | { kind: 'image'; url: string }

/** Chrome for a user's own picture, where there is no hand-tuned palette to fall back
 *  on — only whether the picture is dark or light overall. */
const imageChrome = {
  dark: {
    scrim:
      'radial-gradient(120% 90% at 50% 38%, rgba(8, 10, 14, 0.26) 0%, rgba(8, 10, 14, 0.5) 65%),' +
      'linear-gradient(180deg, rgba(8, 10, 14, 0.32) 0%, rgba(8, 10, 14, 0.56) 100%)',
    text: '#f4f6fa',
    muted: 'rgba(244, 246, 250, 0.62)',
    surface: 'rgba(14, 17, 22, 0.74)',
    border: 'rgba(244, 246, 250, 0.18)',
  },
  light: {
    scrim:
      'radial-gradient(120% 90% at 50% 38%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 60%),' +
      'linear-gradient(180deg, rgba(255, 255, 255, 0.26) 0%, rgba(245, 245, 247, 0.46) 100%)',
    text: '#1c2126',
    muted: 'rgba(28, 33, 38, 0.62)',
    surface: 'rgba(255, 255, 255, 0.84)',
    border: 'rgba(28, 33, 38, 0.18)',
  },
}

export type CustomSelection = {
  kind: CustomKind
  gradientId: string
  /** Null until a picture has been chosen on this device. */
  image: { dataUrl: string; base: string; dark: boolean } | null
}

/**
 * Resolves what to paint and what colours to paint on top of it. An image chosen on
 * another device cannot arrive through a link, so a custom theme that asks for one and
 * finds none falls back to its gradient rather than showing an empty screen.
 */
export function resolveTheme(
  themeId: string,
  custom: CustomSelection,
  gradient: Omit<Theme, 'id' | 'name' | 'description' | 'scrim'> & { background: string },
): { theme: Theme; backdrop: Backdrop } {
  if (themeId !== CUSTOM_THEME_ID) {
    const theme = themeById(themeId)
    return { theme, backdrop: { kind: 'scene', id: theme.id } }
  }

  const asGradient = {
    theme: {
      id: CUSTOM_THEME_ID,
      name: 'Custom',
      description: 'Your own background.',
      base: gradient.base,
      // A gradient is built to be looked at directly, so it needs no wash over it.
      scrim: 'none',
      text: gradient.text,
      muted: gradient.muted,
      surface: gradient.surface,
      border: gradient.border,
      displayFont: gradient.displayFont,
      displayWeight: gradient.displayWeight,
      displayTracking: gradient.displayTracking,
    },
    backdrop: { kind: 'gradient' as const, css: gradient.background },
  }

  if (custom.kind === 'gradient' || !custom.image) return asGradient

  const chrome = custom.image.dark ? imageChrome.dark : imageChrome.light
  return {
    theme: {
      id: CUSTOM_THEME_ID,
      name: 'Custom',
      description: 'Your own background.',
      base: custom.image.base,
      ...chrome,
      // A photograph was not composed to have a clock over it, so the display font stays
      // the neutral one rather than a face chosen for a particular scene.
      displayFont: '"Inter", system-ui, sans-serif',
      displayWeight: 700,
      displayTracking: '-0.04em',
    },
    backdrop: { kind: 'image', url: custom.image.dataUrl },
  }
}
