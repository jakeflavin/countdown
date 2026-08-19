import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShareButton } from './ShareButton'

const URL = 'https://example.test/countdown/?d=300000'

describe('ShareButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // jsdom has neither, and the component branches on both
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
  })

  afterEach(() => vi.useRealTimers())

  it('prefers the platform share sheet when there is one', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })

    render(<ShareButton url={URL} />)
    await userEvent.click(screen.getByRole('button', { name: /share/i }))

    expect(share).toHaveBeenCalledWith({ title: 'Countdown', url: URL })
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
  })

  it('falls back to the clipboard, and says so', async () => {
    render(<ShareButton url={URL} />)
    await userEvent.click(screen.getByRole('button', { name: /share/i }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(URL)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Link copied' })).toBeVisible())
  })

  it('stays quiet when the clipboard is refused', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    })

    render(<ShareButton url={URL} />)
    await userEvent.click(screen.getByRole('button', { name: /share/i }))

    // no confirmation, because nothing was copied
    expect(screen.getByRole('button', { name: 'Share this countdown' })).toBeVisible()
  })

  it('does not report success when the share sheet is dismissed', async () => {
    Object.defineProperty(navigator, 'share', {
      value: vi.fn().mockRejectedValue(new Error('AbortError')),
      configurable: true,
    })

    render(<ShareButton url={URL} />)
    await userEvent.click(screen.getByRole('button', { name: /share/i }))

    expect(screen.getByRole('button', { name: 'Share this countdown' })).toBeVisible()
  })
})
