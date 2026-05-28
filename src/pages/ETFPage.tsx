import { useState, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import PageLayout from '../components/layout/PageLayout';

// ETF 시뮬레이터: 과일 바구니 나눠 담기
// 단일 종목 vs ETF 분산 투자의 충격 비교를 통해 분산 투자의 장점을 체험

const shake = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
`;

const wormCrawl = keyframes`
  0% { transform: scale(1) translateX(0); opacity: 1; }
  50% { transform: scale(1.1) translateX(40px); }
  100% { transform: scale(1) translateX(80px); opacity: 0; }
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TooltipWrap = styled.span`
  position: relative;
  display: inline-block;
`;

const TitleHighlight = styled.span`
  color: #005bbe;
  border-bottom: 2px dotted #005bbe;
  cursor: help;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 50;
  background: ${({ theme }) => theme.colors.surfaceContainerHighest};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  box-shadow: ${({ theme }) => theme.shadows.floating};
  border-radius: 9999px;
  padding: 10px 20px;
  width: 320px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};

  ${TooltipWrap}:hover & {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

const Subtitle = styled.p`
  font-size: 20px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const BasketsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: stretch;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const BasketCard = styled.div<{ $state: 'normal' | 'danger' | 'safe' }>`
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border: 2px solid ${({ $state, theme }) =>
    $state === 'danger' ? theme.colors.dangerRed :
    $state === 'safe' ? theme.colors.safeGreen :
    'transparent'};
  background: ${({ $state, theme }) =>
    $state === 'danger' ? '#fff5f5' : theme.colors.surfaceContainerLow};
  transition: all 0.4s;
`;

const BasketHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  h3 {
    font-size: 24px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.onSurface};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  p {
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
  }
`;

const FruitArea = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SingleFruit = styled.div<{ $shaking: boolean; $dead: boolean }>`
  font-size: 80px;
  animation: ${({ $shaking }) => $shaking ? css`${shake} 0.5s ease-in-out infinite` : 'none'};
  transition: all 0.5s;
  line-height: 1;
  ${({ $dead }) => $dead && 'opacity: 0.5; transform: scale(0.8);'}
`;

const FruitGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 40px;
  line-height: 1;
`;

const Worm = styled.div<{ $active: boolean }>`
  position: absolute;
  font-size: 40px;
  left: -50px;
  animation: ${({ $active }) => $active ? css`${wormCrawl} 1.5s forwards` : 'none'};
`;

const GaugeWrap = styled.div`
  width: 100%;
`;

const GaugeLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const GaugeTrack = styled.div`
  height: 16px;
  width: 100%;
  background: ${({ theme }) => theme.colors.surfaceContainerHighest};
  border-radius: 9999px;
  overflow: hidden;
`;

const GaugeFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  border-radius: 9999px;
  transition: width 0.5s ease-out;
`;

const ActionSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const ShockBtn = styled.button<{ $disabled: boolean }>`
  background: ${({ theme }) => theme.colors.dangerRed};
  color: ${({ theme }) => theme.colors.onError};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  border-radius: 9999px;
  font-size: 24px;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(186, 26, 26, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.15s, filter 0.15s;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};

  &:hover:not(:disabled) {
    transform: scale(1.05);
    filter: brightness(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  span.material-symbols-outlined {
    transition: transform 0.3s;
  }

  &:hover:not(:disabled) span.material-symbols-outlined {
    transform: rotate(12deg);
  }
`;

const ResultMessage = styled.div<{ $visible: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.5s;
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};

  p {
    font-size: 24px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.safeGreen};
  }
`;

const ResetBtn = styled.button<{ $visible: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  text-decoration: underline;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
`;

const InfoBanner = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xl};
  background: rgba(16, 113, 229, 0.06);
  border: 1px solid rgba(16, 113, 229, 0.12);
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InfoIcon = styled.div`
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.onPrimaryContainer};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 9999px;
  flex-shrink: 0;

  span.material-symbols-outlined {
    font-size: 24px;
    display: block;
  }
`;

export default function ETFPage() {
  const [shockApplied, setShockApplied] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [wormActive, setWormActive] = useState(false);
  const [singleFruit, setSingleFruit] = useState('🍎');
  const [etfFruits, setEtfFruits] = useState(['🍎', '🍌', '🍇', '🥝']);
  const [gaugeA, setGaugeA] = useState(100);
  const [gaugeB, setGaugeB] = useState(100);

  const triggerShock = useCallback(() => {
    if (shockApplied) return;
    setShaking(true);
    setWormActive(true);

    setTimeout(() => {
      setShaking(false);
      setSingleFruit('🪱');
      setGaugeA(0);
      setEtfFruits(['🪱', '🍌', '🍇', '🥝']);
      setGaugeB(75);
      setShockApplied(true);
    }, 1000);
  }, [shockApplied]);

  const reset = useCallback(() => {
    setShockApplied(false);
    setShaking(false);
    setWormActive(false);
    setSingleFruit('🍎');
    setEtfFruits(['🍎', '🍌', '🍇', '🥝']);
    setGaugeA(100);
    setGaugeB(100);
  }, []);

  return (
    <PageLayout>
      <HeroSection>
        <Title>
          위험을 쪼개서 투자하는{' '}
          <TooltipWrap>
            <TitleHighlight>ETF</TitleHighlight>
            <Tooltip>
              ETF(상장지수펀드): 매점의 '과일 종합 선물 세트'처럼, 여러 회사의 주식을 한 바구니에 모아놓아서 주식 시장에서 쉽게 살 수 있는 상품이에요!
            </Tooltip>
          </TooltipWrap>{' '}
          실험실
        </Title>
        <Subtitle>과일 바구니 나눠 담기로 분산 투자의 마법을 배워보아요!</Subtitle>
      </HeroSection>

      <BasketsGrid>
        {/* Basket A: Single */}
        <BasketCard $state={shockApplied ? 'danger' : 'normal'}>
          <BasketHeader>
            <h3>바구니 A</h3>
            <p>하나의 과일만 올인!</p>
          </BasketHeader>

          <FruitArea>
            <SingleFruit $shaking={shaking} $dead={gaugeA === 0}>
              {singleFruit}
            </SingleFruit>
            <Worm $active={wormActive}>🐛</Worm>
          </FruitArea>

          <GaugeWrap>
            <GaugeLabelRow>
              <span style={{ fontSize: 14, fontWeight: 600 }}>내 돈의 안전함</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: gaugeA === 0 ? '#ba1a1a' : '#0059b9' }}>
                {gaugeA}%
              </span>
            </GaugeLabelRow>
            <GaugeTrack>
              <GaugeFill $width={gaugeA} $color={gaugeA === 0 ? '#ba1a1a' : '#0059b9'} />
            </GaugeTrack>
          </GaugeWrap>
        </BasketCard>

        {/* Basket B: ETF */}
        <BasketCard $state={shockApplied ? 'safe' : 'normal'}>
          <BasketHeader>
            <h3>바구니 B</h3>
            <p>여러 과일 믹스 (ETF)</p>
          </BasketHeader>

          <FruitArea>
            <FruitGrid>
              {etfFruits.map((f, i) => <div key={i}>{f}</div>)}
            </FruitGrid>
            <Worm $active={false}>🐛</Worm>
          </FruitArea>

          <GaugeWrap>
            <GaugeLabelRow>
              <span style={{ fontSize: 14, fontWeight: 600 }}>내 돈의 안전함</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#006d37' }}>
                {gaugeB}%
              </span>
            </GaugeLabelRow>
            <GaugeTrack>
              <GaugeFill $width={gaugeB} $color="#006d37" />
            </GaugeTrack>
          </GaugeWrap>
        </BasketCard>
      </BasketsGrid>

      <ActionSection>
        <ShockBtn
          $disabled={shockApplied}
          disabled={shockApplied}
          onClick={triggerShock}
        >
          <span className="material-symbols-outlined">bug_report</span>
          돌발 악재 발생!
        </ShockBtn>

        <ResultMessage $visible={shockApplied}>
          <p>바구니 B는 분산 투자 덕분에 안전해요!</p>
        </ResultMessage>

        <ResetBtn $visible={shockApplied} onClick={reset}>
          다시 실험하기
        </ResetBtn>
      </ActionSection>

      <InfoBanner>
        <InfoIcon>
          <span className="material-symbols-outlined">lightbulb</span>
        </InfoIcon>
        <div>
          <h4 style={{ fontSize: 24, fontWeight: 700, color: '#0059b9', marginBottom: 8 }}>
            왜 ETF가 좋을까요?
          </h4>
          <p style={{ fontSize: 18, fontWeight: 500, color: '#414754', lineHeight: 1.6 }}>
            사과(한 회사 주식)가 벌레를 먹어서 못 쓰게 되어도, 바구니 B(ETF)에는 바나나, 포도, 키위가 남아있어요.
            이렇게 여러 회사를 모아두면 한 곳이 힘들어도 내 소중한 용돈을 지킬 수 있답니다!
          </p>
        </div>
      </InfoBanner>
    </PageLayout>
  );
}
