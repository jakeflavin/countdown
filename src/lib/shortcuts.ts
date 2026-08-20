export type Shortcut = {
  keys: string[]
  label: string
  /** Present when the key only does something in one mode. Starting, pausing and
   *  resetting all act on a run, and a date has no run to act on — the list said
   *  otherwise and left people pressing Space at a calendar. */
  mode?: 'duration'
}

export const shortcuts: Shortcut[] = [
  { keys: ['Space', 'Enter'], label: 'Start or pause', mode: 'duration' },
  { keys: ['R'], label: 'Reset', mode: 'duration' },
  { keys: ['M'], label: 'Switch mode' },
  { keys: ['S'], label: 'Open settings' },
  { keys: ['H'], label: 'Open history' },
  { keys: ['?'], label: 'Show these shortcuts' },
  { keys: ['Esc'], label: 'Close a drawer' },
]

/** Narrows an event target to an element; keydown can also target window or document,
 *  which have none of the element methods a guard would want to call. */
export function targetElement(target: EventTarget | null) {
  return target instanceof HTMLElement ? target : null
}

/** True while the keystroke belongs to something the user is typing into. */
export function isTypingTarget(target: EventTarget | null) {
  const el = targetElement(target)
  if (!el) return false
  return (
    el.isContentEditable ||
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT'
  )
}

/** A modal drawer takes over the keyboard; shortcuts behind it would act unseen. */
export function isDrawerOpen() {
  return document.querySelector('dialog[open]') !== null
}
