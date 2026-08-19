import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, History, Keyboard, X } from 'lucide-react'
import type { Session } from '../lib/session'
import { shortcuts } from '../lib/shortcuts'
import { CUSTOM_THEME_ID, scenePoster, themes } from '../lib/themes'
import { gradientById } from '../lib/gradients'
import type { CustomImage } from '../lib/customBackground'
import { modes, type Settings } from '../hooks/useSettings'
import { BackupControls } from './BackupControls'
import { DurationField } from './DurationField'
import { TargetPicker } from './TargetPicker'
import { CustomThemeControls } from './CustomThemeControls'

type SettingsDialogProps = {
  open: boolean
  /** Which page to land on when opened; the shortcut for help jumps straight in. */
  openTo?: 'main' | 'shortcuts'
  onClose: () => void
  settings: Settings
  onChange: (next: Settings) => void
  session: Session
  onRestore: (settings: Settings, session: Session) => void
  onOpenSession: () => void
  /** The time on screen, previewed in the theme swatches. */
  sample: string
  /** The custom theme's picture, held by the app because it is far too large for the
   *  settings it belongs to. */
  customImage: CustomImage | null
  onCustomImage: (image: CustomImage | null) => void
}

export function SettingsDialog({
  open,
  openTo = 'main',
  onClose,
  settings,
  onChange,
  session,
  onRestore,
  onOpenSession,
  sample,
  customImage,
  onCustomImage,
}: SettingsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [page, setPage] = useState<'main' | 'shortcuts'>('main')
  // Touch devices get no shortcut list; there is nothing to press.
  const hasKeyboard = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
    // Reopening should land where the caller asked, never on whatever page was last seen.
    if (open) setPage(openTo)
  }, [open, openTo])

  // Backdrop clicks are dispatched on the dialog itself, so a hit test against its box
  // is what separates "clicked the backdrop" from "clicked inside the drawer".
  const onDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target !== ref.current) return
    const { top, right, bottom, left } = ref.current.getBoundingClientRect()
    const outside = e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom
    if (outside) onClose()
  }

  const header = (title: string, onBack?: () => void) => (
    <div className="settings-header">
      {onBack && (
        <button className="icon-button" onClick={onBack} aria-label="Back to settings">
          <ChevronLeft size={18} />
        </button>
      )}
      <h2>{title}</h2>
      <button className="icon-button" onClick={onClose} aria-label="Close settings">
        <X size={18} />
      </button>
    </div>
  )

  return (
    <dialog ref={ref} className="drawer drawer-settings" onClose={onClose} onClick={onDialogClick}>
      {page === 'shortcuts' ? (
        <>
          {header('Shortcuts', () => setPage('main'))}
          <ul className="shortcut-list">
            {shortcuts.map((shortcut) => (
              <li key={shortcut.label}>
                <span>{shortcut.label}</span>
                <span className="shortcut-keys">
                  {shortcut.keys.map((key) => (
                    <kbd key={key}>{key}</kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {header('Settings')}

          <fieldset className="settings-group">
            <legend>Counting</legend>
            {/* Two choices that swap the whole screen, so they are shown side by side
                rather than hidden in a dropdown one of them is always behind. */}
            <div className="segmented">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  className={`segment-button${mode.id === settings.mode ? ' is-active' : ''}`}
                  onClick={() => onChange({ ...settings, mode: mode.id })}
                  aria-pressed={mode.id === settings.mode}
                >
                  {mode.name}
                </button>
              ))}
            </div>

            {/* The card holds whatever the chosen mode needs, so the two modes' settings
                never read as one flat stack of unrelated controls. */}
            <div className="group-card">
              {settings.mode === 'duration' ? (
                <DurationField
                  ms={settings.durationMs}
                  onChange={(durationMs) => onChange({ ...settings, durationMs })}
                />
              ) : (
                <>
                  <TargetPicker
                    value={settings.targetAt}
                    onChange={(targetAt) => onChange({ ...settings, targetAt })}
                  />
                  <div className="group-field">
                    <label>
                      Name
                      <input
                        type="text"
                        placeholder="Optional"
                        value={settings.eventName}
                        onChange={(e) => onChange({ ...settings, eventName: e.target.value })}
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          </fieldset>

          {/* A row rather than a titled group: the label on the switch says the whole
              thing, so a heading above it would only repeat itself. */}
          <div className="settings-group switch-row">
            <label htmlFor="sound">Chime at zero</label>
            <input
              id="sound"
              type="checkbox"
              role="switch"
              checked={settings.sound}
              onChange={(e) => onChange({ ...settings, sound: e.target.checked })}
            />
          </div>

          {/* Everything above changes what is counted; everything below changes how it
              looks. The rule keeps the two from reading as one long list. */}
          <hr className="settings-divider" />

          <fieldset className="settings-group">
            <legend>Theme</legend>
            <div className="theme-grid">
              {themes.map((t) => (
                <button
                  key={t.id}
                  className={`theme-option${t.id === settings.themeId ? ' is-active' : ''}`}
                  onClick={() => onChange({ ...settings, themeId: t.id })}
                  aria-pressed={t.id === settings.themeId}
                >
                  <span
                    className="theme-swatch"
                    style={{
                      backgroundColor: t.base,
                      backgroundImage: `url(${scenePoster(t.id, 'landscape')})`,
                      borderColor: t.border,
                    }}
                  >
                    <span
                      className="theme-preview"
                      style={{
                        fontFamily: t.displayFont,
                        fontWeight: t.displayWeight,
                        letterSpacing: t.displayTracking,
                        color: t.text,
                      }}
                    >
                      {sample}
                    </span>
                  </span>
                  <span className="theme-name">{t.name}</span>
                  <span className="theme-description">{t.description}</span>
                </button>
              ))}

              {/* The custom tile previews whatever it is currently set to, so the grid
                  shows eight backgrounds rather than seven and a placeholder. */}
              <button
                className={`theme-option${
                  settings.themeId === CUSTOM_THEME_ID ? ' is-active' : ''
                }`}
                onClick={() => onChange({ ...settings, themeId: CUSTOM_THEME_ID })}
                aria-pressed={settings.themeId === CUSTOM_THEME_ID}
              >
                <span
                  className="theme-swatch"
                  style={
                    settings.customKind === 'image' && customImage
                      ? {
                          backgroundColor: customImage.base,
                          backgroundImage: `url(${customImage.dataUrl})`,
                          borderColor: 'transparent',
                        }
                      : {
                          background: gradientById(settings.customGradientId).background,
                          borderColor: gradientById(settings.customGradientId).border,
                        }
                  }
                >
                  <span
                    className="theme-preview"
                    style={{
                      fontFamily: gradientById(settings.customGradientId).displayFont,
                      fontWeight: gradientById(settings.customGradientId).displayWeight,
                      color:
                        settings.customKind === 'image' && customImage
                          ? customImage.dark
                            ? '#f4f6fa'
                            : '#1c2126'
                          : gradientById(settings.customGradientId).text,
                    }}
                  >
                    {sample}
                  </span>
                </span>
                <span className="theme-name">Custom</span>
                <span className="theme-description">Your own background.</span>
              </button>
            </div>

            {settings.themeId === CUSTOM_THEME_ID && (
              <div className="group-card">
                <CustomThemeControls
                  settings={settings}
                  onChange={onChange}
                  image={customImage}
                  onImage={onCustomImage}
                />
              </div>
            )}
          </fieldset>

          <hr className="settings-divider" />

          <fieldset className="settings-group">
            <legend>History and backup</legend>
            <div className="button-grid">
              <button className="outline-button" onClick={onOpenSession}>
                <History size={15} aria-hidden="true" />
                Past runs
              </button>
              {/* A shortcut list is no use without a keyboard to press. */}
              {hasKeyboard && (
                <button className="outline-button" onClick={() => setPage('shortcuts')}>
                  <Keyboard size={15} aria-hidden="true" />
                  Shortcuts
                </button>
              )}
            </div>
            <BackupControls settings={settings} session={session} onRestore={onRestore} />
          </fieldset>
        </>
      )}
    </dialog>
  )
}
