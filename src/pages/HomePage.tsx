import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';

// 홈 페이지: 실험 카드 2개 + 최근 학습 타일 + 팁 배너
// 어린 학생들이 "어디로 가야 하는지" 한눈에 파악하도록 큰 카드 UI

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const HeroTitle = styled.h1`
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  max-width: 600px;
  line-height: 1.35;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const BentoCard = styled.div<{ $accent: string }>`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
  border: 2px solid transparent;
  transition: box-shadow 0.3s, border-color 0.3s, transform 0.2s;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.floating};
    border-color: ${({ $accent }) => $accent}22;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.96);
  }

  &::after {
    content: '';
    position: absolute;
    right: -32px;
    top: -32px;
    width: 128px;
    height: 128px;
    background: ${({ $accent }) => $accent}0d;
    border-radius: 50%;
    filter: blur(32px);
    transition: background 0.3s;
  }

  &:hover::after {
    background: ${({ $accent }) => $accent}1a;
  }
`;

const IconBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 9999px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: fit-content;
`;

const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CardDesc = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const ArrowBtn = styled.div<{ $bg: string }>`
  width: 48px;
  height: 48px;
  background: ${({ $bg }) => $bg};
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-left: auto;
  margin-top: ${({ theme }) => theme.spacing.xl};
  transition: transform 0.2s;

  ${BentoCard}:hover & {
    transform: translateX(4px);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const ViewAll = styled.button`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  transition: text-decoration 0.15s;

  &:hover { text-decoration: underline; }
`;

const TileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const Tile = styled.div`
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceContainerHigh};
  }

  span.material-symbols-outlined {
    font-size: 32px;
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
  }

  p {
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.onSurface};
  }
`;

const TipBanner = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xl};
  background: rgba(16, 113, 229, 0.08);
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const TipBadge = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.onPrimaryContainer};
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 9999px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TipTitle = styled.h4`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TipDesc = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const TipImage = styled.div`
  width: 100%;
  max-width: 192px;
  height: 192px;
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => theme.rounded.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
`;

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      {/* Hero */}
      <Section>
        <HeroTitle>안녕? FinGuide에 온 걸 환영해! 어떤 실험을 해볼까?</HeroTitle>
      </Section>

      {/* Experiment Cards */}
      <CardGrid>
        <BentoCard $accent="#0059b9" onClick={() => navigate('/els')}>
          <div>
            <IconBadge>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#005bbe' }}>card_giftcard</span>
            </IconBadge>
            <CardTitle>선물 상자 지키기 실험</CardTitle>
            <CardDesc>주가가 떨어지지만 않으면 보너스 선물!</CardDesc>
          </div>
          <ArrowBtn $bg="#0059b9">
            <span className="material-symbols-outlined">arrow_forward</span>
          </ArrowBtn>
        </BentoCard>

        <BentoCard $accent="#006d37" onClick={() => navigate('/etf')}>
          <div>
            <IconBadge>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#006d37' }}>shopping_basket</span>
            </IconBadge>
            <CardTitle>과일 바구니 나눠 담기 실험</CardTitle>
            <CardDesc>여러 주식을 바구니에 골고루!</CardDesc>
          </div>
          <ArrowBtn $bg="#006d37">
            <span className="material-symbols-outlined">arrow_forward</span>
          </ArrowBtn>
        </BentoCard>
      </CardGrid>

      {/* Learning Tiles */}
      <section style={{ marginTop: '64px' }}>
        <SectionHeader>
          <SectionTitle>최근 배운 내용</SectionTitle>
          <ViewAll>전체보기</ViewAll>
        </SectionHeader>
        <TileGrid>
          <Tile>
            <span className="material-symbols-outlined">savings</span>
            <p>저축이란?</p>
          </Tile>
          <Tile>
            <span className="material-symbols-outlined">currency_exchange</span>
            <p>환율 공부</p>
          </Tile>
          <Tile>
            <span className="material-symbols-outlined">trending_up</span>
            <p>주식 기본</p>
          </Tile>
          <Tile>
            <span className="material-symbols-outlined">account_balance</span>
            <p>은행의 역할</p>
          </Tile>
        </TileGrid>
      </section>

      {/* Tip Banner */}
      <TipBanner>
        <div style={{ flex: 1 }}>
          <TipBadge>실험실 팁</TipBadge>
          <TipTitle>투자는 게임처럼 즐겁게!</TipTitle>
          <TipDesc>
            FinGuide에서는 가짜 돈으로 안전하게 연습할 수 있어요.
            잃어도 괜찮아요, 우리는 배우는 중이니까요!
          </TipDesc>
        </div>
        <TipImage>🧪</TipImage>
      </TipBanner>
    </PageLayout>
  );
}
