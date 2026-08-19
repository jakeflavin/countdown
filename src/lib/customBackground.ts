/** A background the user supplied, reduced to something a browser can hold onto. */
export type CustomImage = {
  dataUrl: string
  /** The image's average colour, painted under it so any edge matches rather than
   *  flashes white. */
  base: string
  /** The image is dark overall, so the chrome on top of it should be light. */
  dark: boolean
}

const STORAGE_KEY = 'countdown.customImage'

/** A phone camera photo is far larger than a background ever needs to be, and it has to
 *  fit in a storage bucket measured in a few megabytes. */
const MAX_EDGE = 1920
/** Tried in order until the encoded image is small enough to store. */
const ATTEMPTS = [
  { edge: MAX_EDGE, quality: 0.82 },
  { edge: MAX_EDGE, quality: 0.7 },
  { edge: 1440, quality: 0.6 },
  { edge: 1080, quality: 0.5 },
]
/** Comfortably inside a 5MB localStorage budget, with room for history beside it. */
const MAX_BYTES = 3_000_000

export class ImageError extends Error {}

function loadElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ImageError("That file couldn't be read as an image."))
    }
    image.src = url
  })
}

/** Averaged from a thumbnail rather than the full image: the answer is the same to the
 *  eye, and it is a thousand times less work. */
function averageColour(image: HTMLImageElement) {
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return { base: '#111111', dark: true }

  ctx.drawImage(image, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  let r = 0
  let g = 0
  let b = 0
  for (let i = 0; i < data.length; i += 4) {
    // getImageData always returns RGBA, so the stride keeps every read in range; the
    // fallbacks are what the checker wants to see, not a behaviour change.
    r += data[i] ?? 0
    g += data[i + 1] ?? 0
    b += data[i + 2] ?? 0
  }
  const pixels = data.length / 4
  r = Math.round(r / pixels)
  g = Math.round(g / pixels)
  b = Math.round(b / pixels)

  // Perceived brightness, so a saturated blue is not treated as light the way a plain
  // average of the channels would treat it.
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return { base: `rgb(${r}, ${g}, ${b})`, dark: luminance < 0.5 }
}

function encode(image: HTMLImageElement, edge: number, quality: number) {
  const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageError("That image couldn't be processed.")
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  // JPEG rather than PNG: a photograph as PNG is many times the size for no visible
  // gain behind a scrim.
  return canvas.toDataURL('image/jpeg', quality)
}

export async function processImage(file: File): Promise<CustomImage> {
  if (!file.type.startsWith('image/')) throw new ImageError('That file is not an image.')

  const image = await loadElement(file)
  const { base, dark } = averageColour(image)

  for (const attempt of ATTEMPTS) {
    const dataUrl = encode(image, attempt.edge, attempt.quality)
    if (dataUrl.length <= MAX_BYTES) return { dataUrl, base, dark }
  }

  throw new ImageError('That image is too large to store. Try a smaller one.')
}

export function loadCustomImage(): CustomImage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CustomImage>
    if (typeof parsed.dataUrl !== 'string' || !parsed.dataUrl) return null
    return {
      dataUrl: parsed.dataUrl,
      base: typeof parsed.base === 'string' ? parsed.base : '#111111',
      dark: parsed.dark !== false,
    }
  } catch {
    return null
  }
}

export function saveCustomImage(image: CustomImage | null) {
  try {
    if (image) localStorage.setItem(STORAGE_KEY, JSON.stringify(image))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storing the picture is a convenience; failing to should not take the app down.
  }
}
