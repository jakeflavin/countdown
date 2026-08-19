/**
 * Writes the app icons as PNGs.
 *
 * Home-screen icons have to be PNG — iOS ignores an SVG apple-touch-icon — so they are
 * generated here rather than hand-drawn, and committed. Run `npm run icons` after
 * changing the mark. PNG is written directly: the alternative was a build-time image
 * dependency for three small files.
 *
 * The mark is the one in public/favicon.svg, redrawn: a dim full ring, a bright quarter
 * arc running from the top, and the two hands. Rasterised rather than converted, because
 * the SVG is transparent and an icon has to be opaque.
 */
import { lerp, clamp01, writeIcons } from './icon-png.mjs'

const OUT = new URL('../public/', import.meta.url)

/** Noir, the default theme — the same ground the app opens on. */
const BACKDROP = [
  { stop: 0, rgb: [13, 13, 17] },
  { stop: 1, rgb: [8, 8, 11] },
]

const GLOWS = [
  { x: 0.5, y: 0.12, r: 0.66, rgb: [42, 42, 53] },
  { x: 0.14, y: 0.9, r: 0.6, rgb: [29, 43, 58] },
  { x: 0.9, y: 0.82, r: 0.6, rgb: [51, 32, 58] },
]

/** The accent from the favicon, at the two weights the mark uses. */
const ACCENT = [134, 59, 255]
const TRACK_MIX = 0.28

/* Geometry as fractions of the icon, matching the 48px viewBox the favicon is drawn in. */
const CENTRE = 0.5
const RADIUS = 20 / 48
const STROKE = 5 / 48 / 2

/** Distance to the ring itself, so both the track and the arc can be cut from it. */
const ringDistance = (u, v) => Math.abs(Math.hypot(u - CENTRE, v - CENTRE) - RADIUS) - STROKE

/** Distance to a line segment, for the two hands. */
function segment(u, v, [x1, y1, x2, y2], half) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = clamp01(((u - x1) * dx + (v - y1) * dy) / (dx * dx + dy * dy))
  return Math.hypot(u - (x1 + t * dx), v - (y1 + t * dy)) - half
}

/** 12 o'clock to 3, the quarter the favicon draws at full strength. */
function onArc(u, v) {
  const angle = Math.atan2(v - CENTRE, u - CENTRE)
  return angle >= -Math.PI / 2 && angle <= 0
}

const HOUR = [CENTRE, 13 / 48, CENTRE, 24 / 48]
const MINUTE = [CENTRE, 24 / 48, 31 / 48, 29 / 48]

function render(size) {
  const pixels = new Array(size * size)
  const edge = 1.2 / size

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1)
      const v = y / (size - 1)

      let rgb = BACKDROP[0].rgb.map((c, i) => lerp(c, BACKDROP[1].rgb[i], v))
      for (const glow of GLOWS) {
        const d = Math.hypot(u - glow.x, v - glow.y) / glow.r
        const strength = clamp01(1 - d) ** 2
        rgb = rgb.map((c, i) => lerp(c, glow.rgb[i], strength))
      }

      // The ring, dim all the way round and bright over the first quarter.
      const ring = clamp01(-ringDistance(u, v) / edge)
      if (ring > 0) {
        const weight = onArc(u, v) ? 1 : TRACK_MIX
        rgb = rgb.map((c, i) => lerp(c, ACCENT[i], ring * weight))
      }

      // The hands, drawn over it at full strength.
      const hands = Math.min(segment(u, v, HOUR, STROKE), segment(u, v, MINUTE, STROKE))
      const cover = clamp01(-hands / edge)
      if (cover > 0) rgb = rgb.map((c, i) => lerp(c, ACCENT[i], cover))

      pixels[y * size + x] = rgb.map((c) => Math.round(clamp01(c / 255) * 255))
    }
  }

  return pixels
}

// 180 is what iOS asks for; 192 and 512 are what a manifest wants.
for (const size of writeIcons(OUT, [180, 192, 512], render)) {
  console.log(`wrote public/icon-${size}.png`)
}
