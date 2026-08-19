import { styled } from 'styled-components'

/**
 * The shell both drawers wear — settings and history — and the spacing scale they lay
 * their contents out on.
 *
 * A sheet pinned to the right, inset equally from the top, right and bottom so it matches
 * the app's own padding. The blur is what keeps it reading as glass over the scene.
 */
export const Drawer = styled.dialog`
  --gap-row: 10px;
  --gap-block: 24px;

  position: fixed;
  inset: 12px 12px 12px auto;
  margin: 0;
  width: min(360px, calc(100vw - 24px));
  /* The dialog UA stylesheet sets height: fit-content, which would ignore the bottom
     inset — auto lets the top/bottom insets size the drawer instead. */
  height: auto;
  max-width: none;
  max-height: none;
  padding: 24px;
  overflow-y: auto;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  backdrop-filter: blur(20px);

  &[open] {
    animation: drawer-in 260ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  @keyframes drawer-in {
    from {
      transform: translateX(24px);
      opacity: 0;
    }
  }

  &::backdrop {
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(3px);
    animation: backdrop-in 260ms ease;
  }

  @keyframes backdrop-in {
    from {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &[open],
    &::backdrop {
      animation: none;
    }
  }
`

export const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--gap-block);

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
`

/**
 * One spacing scale for both drawers, rather than a margin invented per element:
 * --gap-row between stacked controls, --gap-block between groups and around a rule.
 *
 * `$row` lays the group out horizontally instead, for a label beside a switch.
 */
export const Group = styled.fieldset<{ $row?: boolean }>`
  margin: 0 0 var(--gap-block);
  padding: 0;
  border: 0;

  /* Every stacked child is spaced by the same rule, so nothing depends on a margin
     declared somewhere else. */
  ${(props) => !props.$row && '& > * + * { margin-top: var(--gap-row); }'}

  &:last-child {
    margin-bottom: 0;
  }

  /* The controls below each title sit inside a 1px border, so the title needs the same
     inset to line up with their contents rather than with their outer edge. */
  legend {
    padding: 0 0 0 1px;
    font-size: 13px;
    color: var(--dim);
  }

  /*
   * A switch row aligns its label with the group titles rather than with a card's
   * contents, and stands as tall as the controls it sits among instead of collapsing to
   * the height of the switch.
   */
  ${(props) =>
    props.$row &&
    `
    min-height: 40px;

    & > label {
      padding-left: 1px;
      cursor: pointer;
    }
  `}
`

/** Two modes, side by side, so the one that is not chosen is still visible. */
export const Segmented = styled.div<{ $inline?: boolean }>`
  display: flex;
  gap: 4px;
  padding: ${(props) => (props.$inline ? '3px' : '4px')};
  border: 1px solid var(--line);
  border-radius: 12px;
  ${(props) => props.$inline && 'flex: 1;'}
`

export const SegmentButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 9px 12px;
  font: inherit;
  font-size: 14px;
  color: ${(props) => (props.$active ? 'var(--text)' : 'var(--dim)')};
  background: ${(props) =>
    props.$active ? 'color-mix(in srgb, var(--text) 12%, transparent)' : 'transparent'};
  border: 0;
  border-radius: 8px;
  cursor: pointer;
`

/** A card: the mode above names it, the rows within configure it. */
export const GroupCard = styled.div`
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 12px;
`

/** A row of the card's own settings, separated from the row above by a hairline. */
export const GroupField = styled.div<{ $wrap?: boolean; $between?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(props) => (props.$wrap ? '8px' : '12px')};
  padding: 10px 12px;
  border-top: 1px solid var(--line);
  ${(props) => props.$wrap && 'flex-wrap: wrap;'}
  ${(props) => props.$between && 'justify-content: space-between;'}

  /* The first row sits directly under the card's edge, which is a border already. */
  &:first-child {
    border-top: 0;
  }

  label {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    gap: 5px;
    font-size: 12px;
    color: var(--dim);
  }

  input {
    width: 100%;
    min-width: 0;
    padding: 7px 10px;
    font: inherit;
    font-size: 14px;
    color: var(--text);
    background: transparent;
    border: 1px solid var(--line);
    border-radius: 8px;
  }

  input:focus-visible {
    outline: 2px solid var(--text);
    outline-offset: 1px;
  }

  input::placeholder {
    color: var(--dim);
  }
`
