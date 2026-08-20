import { styled } from 'styled-components'

export const Shell = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;

  /* A page is not a screen: nothing to fill and nothing to centre against, so the
     column stops stretching and the time simply sits at the top of the sheet. */
  @media print {
    display: block;
    height: auto;
    padding: 48px 24px;
  }
`

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media print {
    display: none;
  }
`

export const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
`

export const Main = styled.main`
  display: flex;
  flex: 1;
  min-height: 0;

  @media print {
    display: block;
  }
`
