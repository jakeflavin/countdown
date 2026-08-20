import { styled } from 'styled-components'

import { hitArea } from './buttons.styled'

export const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

export const ThemeOption = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  font: inherit;
  color: var(--text);
  text-align: left;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 12px;
  cursor: pointer;

  ${(props) => props.$active && 'outline: 2px solid var(--text); outline-offset: 1px;'}
`

/**
 * The scene's own first frame is the truest preview of it, and it is a file the app
 * already has to hand for the poster.
 */
export const ThemeSwatch = styled.span`
  display: grid;
  place-items: center;
  height: 62px;
  margin-bottom: 3px;
  overflow: hidden;
  background-position: center;
  background-size: cover;
  /* The swatch previews the theme's own border colour, not the active theme's. */
  border: 1px solid transparent;
  border-radius: 8px;
`

export const ThemePreview = styled.span`
  max-width: 100%;
  padding: 0 8px;
  font-size: 24px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ThemeName = styled.span`
  font-size: 13px;
`

export const ThemeDescription = styled.span`
  font-size: 11px;
  line-height: 1.3;
  color: var(--dim);
`

/**
 * Colour is the whole content of these, so they are swatches rather than labelled
 * buttons; the name is on the tooltip and the accessible label.
 */
export const GradientOption = styled.button<{ $active?: boolean }>`
  ${hitArea}
  flex: 1 1 0;
  min-width: 0;
  /* Six across a 360px drawer cannot each be 44px wide, so the height carries what the
     width cannot and the hit area makes up the rest. */
  height: 44px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;

  ${(props) => props.$active && 'outline: 2px solid var(--text); outline-offset: 1px;'}
`

export const ImageThumb = styled.span`
  flex: 0 0 auto;
  width: 44px;
  height: 34px;
  background-position: center;
  background-size: cover;
  border: 1px solid var(--line);
  border-radius: 8px;
`
