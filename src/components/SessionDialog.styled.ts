import { styled } from 'styled-components'

import { RuledList } from './drawer.styled'

export const DayGroup = styled.section`
  margin-bottom: var(--gap-block);
`

export const DayLabel = styled.h3`
  margin: 0 0 var(--gap-row) 1px;
  font-size: 13px;
  font-weight: 500;
  color: var(--dim);
`

export const Runs = styled(RuledList)`
  li {
    align-items: baseline;
    justify-content: space-between;
    padding: 10px 2px;
  }
`

export const RunValue = styled.span`
  font-size: 15px;
`

export const RunMeta = styled.span`
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
  font-size: 12px;
  color: var(--dim);
`

export const Shortcuts = styled(RuledList)`
  li {
    align-items: center;
    justify-content: space-between;
    padding: 11px 2px;
    font-size: 14px;
  }
`

export const Keys = styled.span`
  display: flex;
  flex: 0 0 auto;
  gap: 6px;

  kbd {
    padding: 3px 8px;
    font-family: inherit;
    font-size: 12px;
    color: var(--dim);
    border: 1px solid var(--line);
    border-radius: 6px;
  }
`
