import { styled } from 'styled-components'

import { hitArea } from './buttons.styled'

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

  @media print {
    display: none;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 40px;
    font-size: 14px;

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
  min-height: 44px;
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
    /* 44px tall, and never below 16px: iOS zooms the viewport on focus for anything
       smaller, and a fixed single-screen layout gives you no way to scroll back out. */
    min-height: 44px;
    padding: 7px 10px;
    font: inherit;
    font-size: 16px;
    color: var(--text);
    background: transparent;
    border: 1px solid var(--line);
    border-radius: 8px;
  }

  input::placeholder {
    color: var(--dim);
  }
`

export const Divider = styled.hr`
  height: 0;
  /* Matches the group spacing it collapses against, so the gaps above and below it stay
     equal. */
  margin: var(--gap-block) 0;
  border: 0;
  border-top: 1px solid var(--line);
`

/**
 * The preset durations. A grid rather than a wrapping row: five even columns make the
 * scale readable as a scale, and they give every chip the same width — which is also how
 * the shortest of them ("1h", "2h") clear a thumb without being padded out of line with
 * the rest.
 */
export const Presets = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
`

/** A pill for a preset value: a duration, a scene. */
export const Chip = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  /* A preset is a one-tap control and the row is the fastest way to set a timer, so it
     is sized for a thumb rather than for the text inside it. */
  justify-content: center;
  min-height: 44px;
  padding: 7px 4px;
  font: inherit;
  font-size: 13px;
  color: ${(props) => (props.$active ? 'var(--text)' : 'var(--dim)')};
  background: ${(props) =>
    props.$active ? 'color-mix(in srgb, var(--text) 12%, transparent)' : 'transparent'};
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;

  &:hover {
    color: var(--text);
  }
`

/** The switch itself, drawn from a checkbox so it keeps the control's own behaviour. */
export const Switch = styled.input`
  position: relative;
  width: 44px;
  height: 26px;
  margin: 0;
  appearance: none;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
  transition: background 150ms ease;

  /* 26px tall is the switch; 44px is the thumb. ::after is the knob, so the hit area
     goes on ::before. */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 44px;
    transform: translate(-50%, -50%);
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 3px;
    width: 18px;
    height: 18px;
    background: var(--text);
    border-radius: 50%;
    opacity: 0.55;
    transform: translateY(-50%);
    transition:
      left 150ms ease,
      opacity 150ms ease;
  }

  &:checked {
    background: color-mix(in srgb, var(--text) 20%, transparent);
  }

  &:checked::after {
    left: 21px;
    opacity: 1;
  }
`

export const ButtonRow = styled.div`
  display: flex;
  gap: var(--gap-row);
`

export const OutlineButton = styled.button`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 7px;
  /* Actions were 16px-tall links, well under a comfortable touch target. */
  min-height: 44px;
  padding: 11px 12px;
  font: inherit;
  font-size: 14px;
  color: var(--text);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: color-mix(in srgb, var(--text) 8%, transparent);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

export const LinkButton = styled.button<{ $danger?: boolean }>`
  ${hitArea}
  padding: 0 0 0 1px;
  font: inherit;
  font-size: 13px;
  color: var(--dim);
  text-decoration: underline;
  text-underline-offset: 3px;
  background: none;
  border: 0;
  cursor: pointer;

  &:hover {
    color: var(--text);
  }

  ${(props) =>
    props.$danger &&
    `
    display: block;
    margin: var(--gap-block) auto 0;
    text-align: center;
  `}
`

/**
 * The second step of clearing the history. It replaces the link in place rather than
 * opening a dialog over it: the question is about the list directly behind it, and that
 * list is worth being able to see while answering.
 */
export const ConfirmRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: var(--gap-block);
  font-size: 13px;
  color: var(--dim);
`

/** The one destructive control in the app, so it is the one thing wearing the warning. */
export const Confirm = styled.button`
  ${hitArea}
  padding: 7px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--bg);
  background: var(--text);
  border: 0;
  border-radius: 999px;
  cursor: pointer;

  &:active {
    transform: scale(0.97);
  }
`

/** `$inset` lines the hint up with a card's own padding rather than the drawer's. */
export const Hint = styled.p<{ $error?: boolean; $inset?: boolean }>`
  margin: 0;
  padding-left: 1px;
  font-size: 12px;
  line-height: 1.4;
  color: ${(props) => (props.$error ? 'var(--text)' : 'var(--dim)')};
  ${(props) => props.$inset && 'padding: 0 12px 10px;'}
`

export const OptionsCount = styled.p`
  margin: 0 0 var(--gap-row);
  padding-left: 1px;
  font-size: 13px;
  color: var(--dim);
`

/** A list of rows separated by hairlines, closed off at the bottom. */
export const RuledList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    gap: 12px;
    border-top: 1px solid var(--line);
  }

  li:last-child {
    border-bottom: 1px solid var(--line);
  }
`

/** Present to a screen reader, absent to everyone else — file inputs, mostly. */
export const VisuallyHidden = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`
