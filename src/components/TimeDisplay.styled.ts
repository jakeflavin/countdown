import { styled } from 'styled-components'

/**
 * The countdown owns the whole area below the header: the time centres in the space that
 * is left, and the buttons sit on the bottom edge at the header's width.
 */
export const Stage = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  width: 100%;

  @media print {
    display: block;
  }
`

export const StageDisplay = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
  width: 100%;

  /* A size container with no height to measure resolves every cqh to zero, which on
     paper left the clock at its floor and half off the top edge. */
  @media print {
    display: block;
    container-type: normal;
  }
  /* Makes the stage a query container, so the time can be sized against the height it
     actually has rather than against the viewport. Every cqh and cqw below resolves
     against this element. */
  container-type: size;
`

export const Clock = styled.p`
  margin: 0;
  /* Sized against the container rather than the window. 22vw ignored the shell's own
     padding, so "99:59:59" — the longest duration the app will hold — was laid out
     391px wide inside a 390px phone and had its outer strokes clipped away. Tuned against
     the widest case the app can produce: "99:59:59" in Rain's monospace face. */
  font-size: clamp(3rem, min(20cqw, 34cqh), 13rem);
  line-height: 1;
  /* Digits of unequal width make a running clock jitter. */
  font-variant-numeric: tabular-nums;
  text-align: center;
  user-select: none;
`

export const Display = styled.div<{ $done?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Gaps give way before the type does. */
  gap: clamp(8px, 4cqh, 28px);
  max-width: 100%;

  ${(props) =>
    props.$done &&
    `
    ${Clock} {
      animation: zero-pulse 1.6s ease-in-out infinite;
    }
  `}

  @keyframes zero-pulse {
    50% {
      opacity: 0.45;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    ${Clock} {
      animation: none;
    }
  }

  /* On paper the ink is black, whatever the scene it was chosen against, and the type
     is set in points rather than in a share of a window that is not there. */
  @media print {
    color: #000;

    ${Clock} {
      font-size: 96pt;
      animation: none;
    }
  }
`

export const Label = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--dim);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-align: center;
  /* A long event name belongs on one line with an end, not wrapped over the digits. */
  max-width: 90cqw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

/** Date mode with no target. Set in the theme's own display face so the screen still
 *  reads as this app's, but quiet, and nowhere near the size a real count would be —
 *  it is a state, not a value. */
export const Prompt = styled.p`
  margin: 0;
  font-size: clamp(1.5rem, min(7cqw, 12cqh), 3.25rem);
  line-height: 1.1;
  color: var(--dim);
  text-align: center;
  user-select: none;
`

export const Segments = styled.div`
  display: flex;
  align-items: flex-start;
  gap: clamp(14px, 6cqw, 48px);
`

export const Segment = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(4px, 1.5cqh, 10px);
`

export const SegmentValue = styled.span`
  /* Container-relative for the same reason as the clock: a days segment can put four
     numbers and three gaps on one line. */
  font-size: clamp(2rem, min(8.5cqw, 24cqh), 7rem);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  user-select: none;

  @media print {
    font-size: 56pt;
  }
`

export const SegmentUnit = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: var(--dim);
  letter-spacing: 0.14em;
  text-transform: uppercase;
`
