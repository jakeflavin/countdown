import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { BackupError, buildBackup, downloadBackup, parseBackup } from '../lib/backup'
import type { Session } from '../lib/session'
import type { Settings } from '../hooks/useSettings'

type BackupControlsProps = {
  settings: Settings
  session: Session
  onRestore: (settings: Settings, session: Session) => void
}

export function BackupControls({ settings, session, onRestore }: BackupControlsProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null)

  const onExport = () => {
    downloadBackup(buildBackup(settings, session))
    setStatus({ text: 'Exported.', error: false })
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const parsed = parseBackup(await file.text(), settings)
      onRestore(parsed.settings, parsed.session)
      const runs = parsed.session.entries.length
      setStatus({
        text: `Imported settings and ${runs} ${runs === 1 ? 'run' : 'runs'}.`,
        error: false,
      })
    } catch (error) {
      setStatus({
        text: error instanceof BackupError ? error.message : "That file couldn't be read.",
        error: true,
      })
    } finally {
      // Cleared so choosing the same file again still fires a change event.
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <div className="backup-row">
        <button className="outline-button" onClick={onExport}>
          <Download size={15} aria-hidden="true" />
          Export
        </button>
        <button className="outline-button" onClick={() => fileRef.current?.click()}>
          <Upload size={15} aria-hidden="true" />
          Import
        </button>
        <input
          ref={fileRef}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      {/* Only speaks when there is something to report. */}
      {status && (
        <p className={`settings-hint${status.error ? ' is-error' : ''}`}>{status.text}</p>
      )}
    </>
  )
}
