import styled from 'styled-components';
import { Link, NavLink } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';

// 모든 페이지에서 공유하는 레이아웃: 헤더 + 메인 + 하단 네비게이션
interface Props {
  children: React.ReactNode;
}

const Wrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  background: ${({ theme }) => theme.colors.surface};
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
`;

const HeaderInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.containerPadding}`};
`;

const Logo = styled(Link)`
  font-size: 28px;
  font-weight: 800;
  color: #005bbe;
  letter-spacing: -0.02em;
  text-decoration: none;
`;

const DesktopNav = styled.div`
  display: none;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const DesktopNavLink = styled(NavLink)`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  text-decoration: none;
  transition: transform 0.2s;

  &:hover { transform: scale(1.05); }
  &.active { color: ${({ theme }) => theme.colors.primary}; }
`;

const Main = styled.main`
  max-width: 1040px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.containerPadding} ${theme.spacing.xl}`};
  padding-bottom: 100px; /* space for mobile bottom nav */
`;

export default function PageLayout({ children }: Props) {
  return (
    <Wrapper>
      <Header>
        <HeaderInner>
          <Logo to="/">FinGuide</Logo>
          <DesktopNav>
            <DesktopNavLink to="/" end>Home</DesktopNavLink>
            <DesktopNavLink to="/els">ELS 실험</DesktopNavLink>
            <DesktopNavLink to="/etf">ETF 실험</DesktopNavLink>
            <DesktopNavLink to="/quiz">Quiz</DesktopNavLink>
            <DesktopNavLink to="/stock">주식 시뮬</DesktopNavLink>
          </DesktopNav>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#0059b9', cursor: 'pointer' }}>account_circle</span>
        </HeaderInner>
      </Header>
      <Main>{children}</Main>
      <BottomNavBar />
    </Wrapper>
  );
}
