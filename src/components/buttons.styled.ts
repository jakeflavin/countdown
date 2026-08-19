import { css, styled } from 'styled-components'

/**
 * The two buttons that sit on the scene. Both are glass: the backdrop blur is what keeps
 * a label legible over a photograph without a solid plate behind it.
 */
const glass = css`
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
  backdrop-filter: blur(12px);
`

export const PrimaryButton = styled.button`
  ${glass}
  /* Sized to its label on a wide screen, where stretching it made a target the width of
     the window. It may still shrink, because in date mode the label is a written-out date
     rather than a word. */
  flex: 0 1 auto;
  min-width: 148px;
  padding: 15px 40px;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  /* The date button carries a written-out date, which will not always fit. */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    transform 120ms ease,
    opacity 120ms ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.97);
  }

  /* A phone has no width to spare, so the button takes the rest of the row rather than
     sitting in its own corner. It keeps its outline rather than becoming a filled one. */
  @media (max-width: 600px) {
    flex: 1;
  }

  /* Narrower still, where the tools and a padded label no longer both fit. */
  @media (max-width: 430px) {
    min-width: 0;
    padding: 15px 14px;
  }
`

/** Same surface, border and blur as the primary button, just round instead of a pill. */
export const IconButton = styled.button<{ $quiet?: boolean }>`
  ${glass}
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  transition: transform 120ms ease;

  /* Inside a drawer there is no photograph to sit on, so the glass comes off. */
  ${(props) =>
    props.$quiet &&
    css`
      width: 34px;
      height: 34px;
      color: var(--dim);
      background: transparent;
      backdrop-filter: none;

      &:hover {
        color: var(--text);
        background: color-mix(in srgb, var(--text) 10%, transparent);
      }
    `}

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.94);
  }
`

/**
 * Beside the start button the icon buttons are bigger, because that row is the one thing
 * a thumb reaches for. Exported so the stage can apply it without a descendant selector.
 */
export const stageIconSize = css`
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
`
