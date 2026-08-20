import { styled } from 'styled-components'

/** Fixed behind everything, so the app scrolls over a still scene rather than with it. */
export const Scene = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: var(--bg);

  /* A photograph is the one thing a printed countdown should not spend a page on. */
  @media print {
    display: none;
  }
`

/*
 * Cover, so the clip fills whatever shape the window is; the framing is chosen per
 * orientation, so what cover trims is only ever the margin.
 */
const fill = `
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-position: center;
  background-size: cover;
`

export const SceneVideo = styled.video`
  ${fill}
`

export const SceneStill = styled.div`
  ${fill}
`

/** The wash that keeps the clock readable over whatever the scene is doing. */
export const SceneScrim = styled.div`
  position: absolute;
  inset: 0;
`
