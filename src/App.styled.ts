import { styled } from 'styled-components'

export const Shell = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
`

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
`
