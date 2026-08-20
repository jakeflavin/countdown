import { useEffect, useState } from 'react'
import type { Orientation } from '@/lib/themes'

/**
 * Which way the screen is turned, so a phone held upright is served the scene framed for
 * it rather than the middle of a wide one blown up.
 *
 * Lives here rather than inside the backdrop because the settings drawer needs the same
 * answer: its theme swatches are the same posters, and asking for the landscape set on a
 * phone meant fetching seven files the device would never otherwise touch.
 */
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() =>
    typeof window === 'undefined' || window.innerWidth >= window.innerHeight
      ? 'landscape'
      : 'portrait',
  )

  useEffect(() => {
    const query = window.matchMedia('(orientation: portrait)')
    const apply = () => setOrientation(query.matches ? 'portrait' : 'landscape')
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  return orientation
}
