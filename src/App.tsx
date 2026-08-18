import { useCallback, useEffect, useRef, useState } from 'react'
import { History, Settings as SettingsIcon } from 'lucide-react'
import { playChime, primeAlarm } from './alarm'
import { Countdown } from './components/Countdown'
import { Backdrop } from './components/Backdrop'
import { SessionDialog } from './components/SessionDialog'
import { SettingsDialog } from './components/SettingsDialog'
import { ShareButton } from './components/ShareButton'
import { formatClock, formatSpan, formatTarget } from './duration'
import { buildShareUrl, settingsToParams } from './shareUrl'
import { isDrawerOpen, isTypingTarget } from './shortcuts'
import { gradientById } from './gradients'
import { loadCustomImage, saveCustomImage, type CustomImage } from './customBackground'
import { resolveTheme } from './themes'
import type { TimerRun } from './timer'
import { useNow } from './useNow'
import { useSession } from './useSession'
import { useSettings } from './useSettings'
import { useTimer } from './useTimer'

export default function App() {
  const [settings, setSettings] = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsPage, setSettingsPage] = useState<'main' | 'shortcuts'>('main')
  const [sessionOpen, setSessionOpen] = useState(false)
  const { session, record, clear, replace } = useSession()

  // The picture lives beside the settings rather than inside them: it is megabytes of
  // data URL, and everything in the settings is written to the address bar.
  const [customImage, setCustomImage] = useState<CustomImage | null>(loadCustomImage)
  useEffect(() => {
    saveCustomImage(customImage)
  }, [customImage])

  const { theme, backdrop } = resolveTheme(
    settings.themeId,
    {
      kind: settings.customKind,
      gradientId: settings.customGradientId,
      image: customImage,
    },
    gradientById(settings.customGradientId),
  )

  const { mode, targetAt, eventName, sound } = settings
  const soundRef = useRef(sound)
  soundRef.current = sound

  const onDone = useCallback(
    (run: TimerRun) => {
      record({
        kind: 'duration',
        label: formatSpan(run.durationMs),
        ms: run.durationMs,
        completed: true,
        at: Date.now(),
      })
      if (soundRef.current) playChime()
    },
    [record],
  )

  const onAbandon = useCallback(
    (run: TimerRun, elapsedMs: number) => {
      record({
        // The row is named for the timer that was set, and says separately how far it
        // actually got.
        kind: 'duration',
        label: formatSpan(run.durationMs),
        ms: elapsedMs,
        completed: false,
        at: Date.now(),
      })
    },
    [record],
  )

  const { run, toggle, reset, remaining: remainingAt } = useTimer({
    durationMs: settings.durationMs,
    onDone,
    onAbandon,
  })

  // The clock only runs when something on screen depends on it: a paused timer and an
  // unset target both hold still.
  const counting = run.status === 'running' || (mode === 'date' && targetAt !== null)
  const now = useNow(counting)

  const remaining = remainingAt(now)
  const past = mode === 'date' && targetAt !== null && now >= targetAt
  const dateMs = targetAt === null ? 0 : Math.abs(targetAt - now)
  const shownMs = mode === 'duration' ? remaining : dateMs

  // A target is reached once. Whether it was reached while watching is a separate
  // question from whether it has been recorded, and only the first deserves a chime.
  const wasPending = useRef(false)
  useEffect(() => {
    if (mode !== 'date' || targetAt === null || past) return
    wasPending.current = true
  }, [mode, targetAt, past])

  useEffect(() => {
    if (!past || targetAt === null) return
    record({
      kind: 'date',
      label: eventName || formatTarget(targetAt),
      ms: 0,
      completed: true,
      at: targetAt,
      // Recording is idempotent on this key, so arriving, reloading, and coming back
      // days later all leave the same single row.
      key: `date:${targetAt}`,
    })
    if (wasPending.current) {
      wasPending.current = false
      if (soundRef.current) playChime()
    }
  }, [past, targetAt, eventName, record])

  // Reading the tab strip should be enough to know where a running timer has got to.
  const clock = formatClock(remaining)
  useEffect(() => {
    document.title =
      mode === 'duration' && run.status === 'running'
        ? `${clock} · Countdown`
        : 'Countdown'
  }, [mode, run.status, clock])

  // Shortcuts for the app's own chrome. Starting and pausing is handled by the
  // countdown, which owns those actions; these only open things.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target) || isDrawerOpen()) return

      if (e.key === '?') {
        e.preventDefault()
        setSettingsPage('shortcuts')
        setSettingsOpen(true)
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault()
        setSettingsPage('main')
        setSettingsOpen(true)
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault()
        setSessionOpen(true)
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault()
        setSettings((current) => ({
          ...current,
          mode: current.mode === 'duration' ? 'date' : 'duration',
        }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSettings])

  // Keeping the address bar in step means the URL is always shareable as it stands,
  // survives a refresh, and never describes state the app has moved on from.
  useEffect(() => {
    const params = settingsToParams(settings)
    window.history.replaceState(null, '', `${window.location.pathname}?${params}`)
  }, [settings])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--base', theme.base)
    root.style.setProperty('--text', theme.text)
    root.style.setProperty('--muted', theme.muted)
    root.style.setProperty('--surface', theme.surface)
    root.style.setProperty('--border', theme.border)
  }, [theme])

  const onToggle = useCallback(() => {
    // The chime is minutes away from this click, and browsers only grant audio to a
    // gesture. Opening the output now is what lets it be heard then.
    primeAlarm()
    toggle()
  }, [toggle])

  // The name belongs to the target, so it has nothing to say about a duration.
  const displayLabel = mode === 'date' ? eventName || undefined : undefined

  // The theme swatches are 60 pixels of preview, so a date span is cut to its two
  // largest units rather than shown in full and ellipsized to "136d 4…".
  const sample =
    mode === 'duration' ? clock : formatSpan(shownMs).split(' ').slice(0, 2).join(' ')

  const openSettings = useCallback(() => {
    setSettingsPage('main')
    setSettingsOpen(true)
  }, [])

  return (
    <>
      <Backdrop backdrop={backdrop} theme={theme} />

      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Countdown</h1>
          <button className="icon-button" onClick={openSettings} aria-label="Open settings">
            <SettingsIcon size={20} />
          </button>
        </header>

        <main className="app-main">
          <Countdown
            mode={mode}
            ms={shownMs}
            past={past}
            label={displayLabel}
            done={run.status === 'done'}
            theme={theme}
            status={run.status}
            onToggle={onToggle}
            onReset={reset}
            targetLabel={targetAt === null ? 'Set a date' : formatTarget(targetAt)}
            onEditTarget={openSettings}
            tools={
              <>
                <ShareButton url={buildShareUrl(settings)} />
                <button
                  className="icon-button"
                  onClick={() => setSessionOpen(true)}
                  aria-label="View past runs"
                >
                  <History size={18} />
                </button>
              </>
            }
          />
        </main>

        <SessionDialog
          open={sessionOpen}
          onClose={() => setSessionOpen(false)}
          session={session}
          onClear={clear}
        />

        <SettingsDialog
          open={settingsOpen}
          openTo={settingsPage}
          onClose={() => setSettingsOpen(false)}
          settings={settings}
          onChange={setSettings}
          session={session}
          onRestore={(nextSettings, nextSession) => {
            replace(nextSession)
            setSettings(nextSettings)
          }}
          onOpenSession={() => {
            setSettingsOpen(false)
            setSessionOpen(true)
          }}
          sample={sample}
          customImage={customImage}
          onCustomImage={setCustomImage}
        />
      </div>
    </>
  )
}
