import styled from 'styled-components';
import { Link } from 'react-router-dom';

// 사이트 상단 고정 헤더: 브랜드 + 섹션 앵커 링크
const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Inner = styled.div`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.containerPadding};
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Logo = styled(Link)`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: -0.02em;
`;

const Links = styled.ul`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 600px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function Header() {
  return (
    <Nav>
      <Inner>
        <Logo to="/">FinGuide</Logo>
        <Links>
          <li><NavLink to="/">ELS 실험</NavLink></li>
          <li><NavLink to="/preference">나의 투자 성향</NavLink></li>
          <li><NavLink to="/quiz">퀴즈</NavLink></li>
        </Links>
      </Inner>
    </Nav>
  );
}
