import { useEffect, useState } from 'react'
import { Scene as SceneLayer, SceneScrim, SceneStill, SceneVideo } from './Backdrop.styled'
import {
  scenePoster,
  sceneVideo,
  type Backdrop as BackdropChoice,
  type Theme,
} from '@/lib/themes'
import { useOrientation } from '@/hooks/useOrientation'

/** Motion behind a timer is exactly what this asks to be spared, so the scene holds on
 *  its own first frame instead. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(query.matches)
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  return reduced
}

type BackdropProps = {
  backdrop: BackdropChoice
  theme: Theme
}

function Scene({ id }: { id: string }) {
  const orientation = useOrientation()
  const reducedMotion = useReducedMotion()
  const poster = scenePoster(id, orientation)

  if (reducedMotion) {
    return <SceneStill style={{ backgroundImage: `url(${poster})` }} />
  }

  return (
    // Keyed so that changing scene or orientation mounts a new element rather than
    // swapping the source under a playing video, which leaves the old frame up.
    <SceneVideo
      key={`${id}-${orientation}`}
      src={sceneVideo(id, orientation)}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />
  )
}

export function Backdrop({ backdrop, theme }: BackdropProps) {
  return (
    <SceneLayer aria-hidden="true">
      {backdrop.kind === 'scene' ? (
        <Scene id={backdrop.id} />
      ) : backdrop.kind === 'image' ? (
        <SceneStill style={{ backgroundImage: `url(${backdrop.url})` }} />
      ) : (
        <SceneStill style={{ background: backdrop.css }} />
      )}

      {/* A gradient was designed to be looked at directly, so it asks for no wash; a
          scene or a photograph does. */}
      {theme.scrim !== 'none' && (
        <SceneScrim style={{ background: theme.scrim }} />
      )}
    </SceneLayer>
  )
}
