import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { gradients } from '../gradients'
import { ImageError, processImage, type CustomImage } from '../customBackground'
import type { CustomKind } from '../themes'
import type { Settings } from '../useSettings'

type Props = {
  settings: Settings
  onChange: (next: Settings) => void
  image: CustomImage | null
  onImage: (image: CustomImage | null) => void
}

const kinds: Array<{ id: CustomKind; name: string }> = [
  { id: 'gradient', name: 'Gradient' },
  { id: 'image', name: 'Image' },
]

export function CustomThemeControls({ settings, onChange, image, onImage }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null)
  const [working, setWorking] = useState(false)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setWorking(true)
    setStatus(null)
    try {
      const next = await processImage(file)
      onImage(next)
      // Choosing a picture is also choosing to use it; leaving the gradient on screen
      // would make the upload look as though it had failed.
      onChange({ ...settings, customKind: 'image' })
    } catch (error) {
      setStatus({
        text: error instanceof ImageError ? error.message : "That image couldn't be read.",
        error: true,
      })
    } finally {
      setWorking(false)
      // Cleared so choosing the same file again still fires a change event.
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <div className="group-field is-kinds">
        <div className="segmented is-inline">
          {kinds.map((kind) => (
            <button
              key={kind.id}
              className={`segment-button${settings.customKind === kind.id ? ' is-active' : ''}`}
              onClick={() => onChange({ ...settings, customKind: kind.id })}
              aria-pressed={settings.customKind === kind.id}
            >
              {kind.name}
            </button>
          ))}
        </div>
      </div>

      {settings.customKind === 'gradient' ? (
        <div className="group-field is-gradients">
          {gradients.map((gradient) => (
            <button
              key={gradient.id}
              className={`gradient-option${
                settings.customGradientId === gradient.id ? ' is-active' : ''
              }`}
              style={{ background: gradient.background }}
              onClick={() => onChange({ ...settings, customGradientId: gradient.id })}
              aria-pressed={settings.customGradientId === gradient.id}
              aria-label={gradient.name}
              title={gradient.name}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="group-field is-image">
            {image && (
              <span
                className="image-thumb"
                style={{ backgroundImage: `url(${image.dataUrl})` }}
                aria-hidden="true"
              />
            )}
            <button
              className="outline-button"
              onClick={() => fileRef.current?.click()}
              disabled={working}
            >
              <ImagePlus size={15} aria-hidden="true" />
              {working ? 'Working…' : image ? 'Replace' : 'Choose image'}
            </button>
            {image && (
              <button
                className="icon-button is-quiet"
                onClick={() => {
                  onImage(null)
                  setStatus(null)
                }}
                aria-label="Remove image"
              >
                <Trash2 size={16} />
              </button>
            )}
            <input
              ref={fileRef}
              className="visually-hidden"
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>

          {!image && !status && (
            <p className="settings-hint is-inset">
              Pictures stay on this device. A shared link carries the gradient instead.
            </p>
          )}
        </>
      )}

      {status && (
        <p className={`settings-hint is-inset${status.error ? ' is-error' : ''}`}>
          {status.text}
        </p>
      )}
    </>
  )
}
