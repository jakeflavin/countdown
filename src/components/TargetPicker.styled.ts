import { styled } from 'styled-components'

export const Calendar = styled.div`
  padding: 10px 12px 12px;
`

export const CalendarHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`

export const Month = styled.span`
  font-size: 14px;
  font-weight: 500;
`

/**
 * Round and hairline-bordered, like the app's other icon buttons — but transparent rather
 * than carrying a surface of its own, since it already sits on the card.
 */
export const CalendarNav = styled.button`
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  color: var(--dim);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
  transition:
    transform 120ms ease,
    color 120ms ease,
    background 120ms ease;

  &:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--text) 8%, transparent);
  }

  &:active {
    transform: scale(0.94);
  }

  &:focus-visible {
    outline: 2px solid var(--text);
    outline-offset: 1px;
  }
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
`

export const Weekday = styled.span`
  padding-bottom: 4px;
  font-size: 11px;
  color: var(--dim);
  text-align: center;
  /* Three-letter names in some locales, two in others; the column sets the width. */
  overflow: hidden;
`

export const Day = styled.button<{ $today?: boolean; $selected?: boolean }>`
  aspect-ratio: 1;
  /* Comfortably tappable at the drawer's width without the grid outgrowing it. */
  min-height: 34px;
  padding: 0;
  font: inherit;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--text);
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: color-mix(in srgb, var(--text) 10%, transparent);
  }

  /* Today is a fact about the calendar; the selection is a choice. They have to be
     distinguishable when they are the same square, so one is a ring and one is a fill. */
  ${(props) => props.$today && 'box-shadow: inset 0 0 0 1px var(--line);'}

  /* The number reads against the fill because it is painted in the scene's own base
     colour, which is opaque. The surface is translucent by design — over a light fill it
     let the scene through and left the date washed out and hard to read. */
  ${(props) =>
    props.$selected &&
    `
    color: var(--bg);
    font-weight: 600;
    background: var(--text);

    &:hover {
      background: var(--text);
    }
  `}
`

export const TimeRow = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
`

export const TimeSelect = styled.select`
  padding: 6px 4px 6px 8px;
  font: inherit;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--text);
  appearance: none;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--text);
    outline-offset: 1px;
  }

  /* The popup list is drawn by the OS, so its options need a readable background of
     their own rather than the drawer's translucent surface. */
  option {
    color: #1c1c1e;
    background: #fff;
  }
`

export const Colon = styled.span`
  color: var(--dim);
`
