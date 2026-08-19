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
`

export const StageDisplay = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
  /* Makes the stage a query container, so the time can be sized against the height it
     actually has rather than against the viewport. Every cqh and cqw below resolves
     against this element. */
  container-type: size;
`

export const Clock = styled.p`
  margin: 0;
  font-size: clamp(3rem, min(22vw, 34cqh), 13rem);
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
  font-size: clamp(2rem, min(14vw, 24cqh), 7rem);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  user-select: none;
`

export const SegmentUnit = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: var(--dim);
  letter-spacing: 0.14em;
  text-transform: uppercase;
`
