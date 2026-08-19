import { useEffect, useRef, useState } from 'react'
import { Keys, Shortcuts } from './SessionDialog.styled'
import {
  ThemeDescription,
  ThemeGrid,
  ThemeName,
  ThemeOption,
  ThemePreview,
  ThemeSwatch,
} from './SettingsDialog.styled'
import {
  ButtonRow,
  Divider,
  Drawer,
  DrawerHeader,
  Group,
  GroupCard,
  GroupField,
  OutlineButton,
  SegmentButton,
  Segmented,
  Switch,
} from './drawer.styled'
import { IconButton } from './buttons.styled'
import { ChevronLeft, History, Keyboard, X } from 'lucide-react'
import type { Session } from '@/lib/session'
import { shortcuts } from '@/lib/shortcuts'
import { CUSTOM_THEME_ID, scenePoster, themes } from '@/lib/themes'
import { gradientById } from '@/lib/gradients'
import type { CustomImage } from '@/lib/customBackground'
import { modes, type Settings } from '@/hooks/useSettings'
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
    <DrawerHeader>
      {onBack && (
        <IconButton onClick={onBack} aria-label="Back to settings">
          <ChevronLeft size={18} />
        </IconButton>
      )}
      <h2>{title}</h2>
      <IconButton onClick={onClose} aria-label="Close settings">
        <X size={18} />
      </IconButton>
    </DrawerHeader>
  )

  return (
    <Drawer ref={ref} onClose={onClose} onClick={onDialogClick}>
      {page === 'shortcuts' ? (
        <>
          {header('Shortcuts', () => setPage('main'))}
          <Shortcuts>
            {shortcuts.map((shortcut) => (
              <li key={shortcut.label}>
                <span>{shortcut.label}</span>
                <Keys>
                  {shortcut.keys.map((key) => (
                    <kbd key={key}>{key}</kbd>
                  ))}
                </Keys>
              </li>
            ))}
          </Shortcuts>
        </>
      ) : (
        <>
          {header('Settings')}

          <Group>
            <legend>Counting</legend>
            {/* Two choices that swap the whole screen, so they are shown side by side
                rather than hidden in a dropdown one of them is always behind. */}
            <Segmented>
              {modes.map((mode) => (
                <SegmentButton
                  key={mode.id}
                  $active={mode.id === settings.mode}
                  onClick={() => onChange({ ...settings, mode: mode.id })}
                  aria-pressed={mode.id === settings.mode}
                >
                  {mode.name}
                  </SegmentButton>
              ))}
            </Segmented>

            {/* The card holds whatever the chosen mode needs, so the two modes' settings
                never read as one flat stack of unrelated controls. */}
            <GroupCard>
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
                  <GroupField>
                    <label>
                      Name
                      <input
                        type="text"
                        placeholder="Optional"
                        value={settings.eventName}
                        onChange={(e) => onChange({ ...settings, eventName: e.target.value })}
                      />
                    </label>
                  </GroupField>
                </>
              )}
            </GroupCard>
          </Group>

          {/* A row rather than a titled group: the label on the switch says the whole
              thing, so a heading above it would only repeat itself. */}
          <Group as="div" $row>
            <label htmlFor="sound">Chime at zero</label>
            <Switch
              id="sound"
              type="checkbox"
              role="switch"
              checked={settings.sound}
              onChange={(e) => onChange({ ...settings, sound: e.target.checked })}
            />
          </Group>

          {/* Everything above changes what is counted; everything below changes how it
              looks. The rule keeps the two from reading as one long list. */}
          <Divider />

          <Group>
            <legend>Theme</legend>
            <ThemeGrid>
              {themes.map((t) => (
                <ThemeOption
                  key={t.id}
                  $active={t.id === settings.themeId}
                  onClick={() => onChange({ ...settings, themeId: t.id })}
                  aria-pressed={t.id === settings.themeId}
                >
                  <ThemeSwatch
                    style={{
                      backgroundColor: t.base,
                      backgroundImage: `url(${scenePoster(t.id, 'landscape')})`,
                      borderColor: t.border,
                    }}
                  >
                    <ThemePreview
                      style={{
                        fontFamily: t.displayFont,
                        fontWeight: t.displayWeight,
                        letterSpacing: t.displayTracking,
                        color: t.text,
                      }}
                    >
                      {sample}
                    </ThemePreview>
                  </ThemeSwatch>
                  <ThemeName>{t.name}</ThemeName>
                  <ThemeDescription>{t.description}</ThemeDescription>
                </ThemeOption>
              ))}

              {/* The custom tile previews whatever it is currently set to, so the grid
                  shows eight backgrounds rather than seven and a placeholder. */}
              <ThemeOption
                $active={settings.themeId === CUSTOM_THEME_ID}
                onClick={() => onChange({ ...settings, themeId: CUSTOM_THEME_ID })}
                aria-pressed={settings.themeId === CUSTOM_THEME_ID}
              >
                <ThemeSwatch
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
                  <ThemePreview
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
                  </ThemePreview>
                </ThemeSwatch>
                <ThemeName>Custom</ThemeName>
                <ThemeDescription>Your own background.</ThemeDescription>
              </ThemeOption>
            </ThemeGrid>

            {settings.themeId === CUSTOM_THEME_ID && (
              <GroupCard>
                <CustomThemeControls
                  settings={settings}
                  onChange={onChange}
                  image={customImage}
                  onImage={onCustomImage}
                />
              </GroupCard>
            )}
          </Group>

          <Divider />

          <Group>
            <legend>History and backup</legend>
            <ButtonRow>
              <OutlineButton onClick={onOpenSession}>
                <History size={15} aria-hidden="true" />
                Past runs
              </OutlineButton>
              {/* A shortcut list is no use without a keyboard to press. */}
              {hasKeyboard && (
                <OutlineButton onClick={() => setPage('shortcuts')}>
                  <Keyboard size={15} aria-hidden="true" />
                  Shortcuts
                </OutlineButton>
              )}
            </ButtonRow>
            <BackupControls settings={settings} session={session} onRestore={onRestore} />
          </Group>
        </>
      )}
    </Drawer>
  )
}
