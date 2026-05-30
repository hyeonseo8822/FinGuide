import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

// 모바일 하단 고정 네비게이션 바 (Material Symbols 아이콘)
const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 16px 16px;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0px -8px 24px rgba(0, 0, 0, 0.04);
  border-radius: 16px 16px 0 0;

  @media (min-width: 768px) {
    display: none;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px;
  border-radius: 9999px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  font-size: 10px;
  font-weight: 700;
  transition: all 0.2s;
  text-decoration: none;

  &.active {
    background: ${({ theme }) => theme.colors.secondaryContainer};
    color: ${({ theme }) => theme.colors.onSecondaryContainer};
    padding-left: 24px;
    padding-right: 24px;
    transform: scale(1.1);
  }

`;

const NavIcon = styled.span`
  font-size: 22px;
  line-height: 1;
`;

export default function BottomNavBar() {
  return (
    <Nav>
      <NavItem to="/" end>
        <NavIcon>🎲</NavIcon>
        ELS 실험
      </NavItem>
      <NavItem to="/preference">
        <NavIcon>🧭</NavIcon>
        성향 찾기
      </NavItem>
      <NavItem to="/quiz">
        <NavIcon>📝</NavIcon>
        퀴즈
      </NavItem>
    </Nav>
  );
}
