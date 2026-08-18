/**
 * The chime is synthesised rather than shipped as an audio file: three notes need no
 * asset, no decode, and no network, and a timer's alarm must never depend on any of
 * those to arrive on time.
 */
let context: AudioContext | null = null

function audio(): AudioContext | null {
  if (context) return context
  try {
    context = new AudioContext()
    return context
  } catch {
    // No Web Audio, so the finish is silent and shown rather than heard.
    return null
  }
}

/**
 * Browsers only allow audio a user asked for, and a timer's end is minutes away from
 * the click that set it going. Opening the context during that click leaves it running
 * and ready, so the chime is not refused when it is finally due.
 */
export function primeAlarm() {
  void audio()?.resume()
}

/** An ascending three-note figure: over in half a second, and clearly an ending. */
export function playChime() {
  const ctx = audio()
  if (!ctx) return
  // A context suspended by a background tab plays nothing at all, so it is woken first.
  void ctx.resume()

  const start = ctx.currentTime + 0.02
  const notes = [880, 1108.73, 1318.51]

  notes.forEach((frequency, i) => {
    const at = start + i * 0.16
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = frequency
    // Shaped rather than switched: a gain that jumps to full clicks audibly.
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(0.22, at + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.45)

    osc.connect(gain).connect(ctx.destination)
    osc.start(at)
    osc.stop(at + 0.5)
  })
}
