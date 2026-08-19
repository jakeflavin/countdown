import { styled } from 'styled-components'

import { IconButton, stageIconSize } from './buttons.styled'

export const StageActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  /* Beside the start button these are the row a thumb reaches for, so they are larger
     than the same button is anywhere else. Interpolated rather than written as
     ".stage-actions .icon-button", which stops matching the moment the class goes. */
  ${IconButton} {
    ${stageIconSize}
  }

  /* Narrower still, where the tools and a padded label no longer both fit. */
  @media (max-width: 430px) {
    gap: 10px;
  }
`

export const StageTools = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 430px) {
    gap: 8px;
  }
`

/** The run's own controls, kept together in the opposite corner. */
export const StagePrimary = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  /* The group takes the rest of the row, and the button takes the rest of the group — so
     reset keeps its size and only the labelled button stretches. */
  @media (max-width: 600px) {
    flex: 1;
  }
`
