import { useState, useRef, useCallback, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import PageLayout from '../components/layout/PageLayout';

// ELS 시뮬레이터: 선물 상자 지키기
// 녹인 배리어를 직접 설정하고 시뮬레이션을 통해 원금 손실 위험을 체험

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
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

const TitleHighlight = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 2px dotted ${({ theme }) => theme.colors.primary};
  cursor: help;
  position: relative;
`;

const Subtitle = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 1024px) {
    grid-template-columns: 7fr 5fr;
  }
`;

const VisualPanel = styled.div`
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  min-height: 500px;
`;

const TimerBadge = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  padding: 4px 16px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s;
`;

const GiftContainer = styled.div<{ $animated: boolean }>`
  position: relative;
  z-index: 10;
  font-size: 160px;
  animation: ${({ $animated }) => $animated ? css`${float} 3s ease-in-out infinite` : 'none'};
  transition: transform 0.5s;
  line-height: 1;
`;

const GaugeSection = styled.div`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const GaugeLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const GaugeLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const PriceLabel = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const GaugeTrack = styled.div`
  position: relative;
  height: 48px;
  width: 100%;
  border-radius: 9999px;
  overflow: hidden;
  display: flex;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.06);
`;

const DangerZone = styled.div<{ $width: number }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: rgba(186, 26, 26, 0.12);
  border-right: 4px solid rgba(186, 26, 26, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s;

  span {
    font-size: 12px;
    font-weight: 700;
    color: rgba(186, 26, 26, 0.5);
  }
`;

const SafeZone = styled.div`
  flex: 1;
  height: 100%;
  background: rgba(0, 109, 55, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    font-size: 12px;
    font-weight: 700;
    color: rgba(0, 109, 55, 0.5);
  }
`;

const PriceMarker = styled.div<{ $left: number; $color: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background: ${({ $color }) => $color};
  left: ${({ $left }) => $left}%;
  transition: left 0.3s;
  box-shadow: 0 0 12px ${({ $color }) => $color}80;
  z-index: 20;

  &::after {
    content: '주가';
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    background: ${({ $color }) => $color};
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }
`;

const GaugeAxisRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.outline};
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainerHigh};
`;

const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SliderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SliderLabel = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  border-bottom: 2px dotted ${({ theme }) => theme.colors.primary};
  cursor: help;
`;

const SliderValue = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.dangerRed};
`;

const StyledSlider = styled.input`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.surfaceContainerHigh};
  border-radius: 9999px;
  appearance: none;
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
    border: 4px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const SliderHint = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const InfoBanner = styled.div`
  background: rgba(0, 109, 55, 0.08);
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSecondaryContainer};
`;

const StartBtn = styled.button<{ $disabled: boolean }>`
  width: 100%;
  background: ${({ theme, $disabled }) => $disabled ? theme.colors.outline : theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: transform 0.15s, filter 0.15s;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};

  &:hover:not(:disabled) {
    transform: scale(1.02);
    filter: brightness(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const TipCard = styled.div`
  background: #ffdcc5;
  color: #301400;
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};

  h3 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    font-size: 18px;
    font-weight: 500;
    line-height: 1.6;
  }
`;

// Overlay
const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
`;

const OverlayCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  max-width: 440px;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.rounded.lg};
  text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);

  h2 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: 18px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
    line-height: 1.6;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

const OverlayIcon = styled.div<{ $color: string }>`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  span.material-symbols-outlined {
    font-size: 64px;
    color: ${({ $color }) => $color};
    font-variation-settings: 'FILL' 0, 'wght' 700;
  }
`;

const OverlayBtn = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  font-size: 24px;
  font-weight: 700;
  transition: filter 0.15s;

  &:hover { filter: brightness(1.1); }
`;

export default function ELSPage() {
  const [barrier, setBarrier] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(100);
  const [monthsLeft, setMonthsLeft] = useState(6);
  const [showOverlay, setShowOverlay] = useState(false);
  const [success, setSuccess] = useState(false);
  const [giftEmoji, setGiftEmoji] = useState('🎁');

  const priceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const monthsRef = useRef(6);
  const runningRef = useRef(false);

  const endGame = useCallback((won: boolean) => {
    if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRunning(false);
    runningRef.current = false;
    setSuccess(won);
    if (won) setGiftEmoji('🎊');
    else setGiftEmoji('💥');
    setTimeout(() => setShowOverlay(true), 800);
  }, []);

  const startSimulation = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    runningRef.current = true;
    setCurrentPrice(100);
    setMonthsLeft(6);
    monthsRef.current = 6;
    setGiftEmoji('🎁');

    let price = 100;

    priceIntervalRef.current = setInterval(() => {
      const change = (Math.random() - 0.55) * 15;
      price = Math.max(20, Math.min(130, price + change));
      setCurrentPrice(Math.round(price));

      if (price <= barrier) {
        endGame(false);
      } else if (monthsRef.current <= 0) {
        endGame(true);
      }
    }, 800);

    timerIntervalRef.current = setInterval(() => {
      monthsRef.current -= 1;
      setMonthsLeft(m => {
        const next = m - 1;
        return next;
      });
    }, 1000);
  }, [isRunning, barrier, endGame]);

  const resetGame = useCallback(() => {
    if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRunning(false);
    runningRef.current = false;
    setCurrentPrice(100);
    setMonthsLeft(6);
    setShowOverlay(false);
    setGiftEmoji('🎁');
  }, []);

  useEffect(() => () => {
    if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, []);

  const priceMarkerPos = Math.min(100, Math.max(0, currentPrice));
  const markerColor = currentPrice <= barrier ? '#ba1a1a' : '#0059b9';

  return (
    <PageLayout>
      <HeroSection>
        <Title>
          지금 가입하는 상품은{' '}
          <TitleHighlight title="ELS(주가연계증권): 주가가 약속한 선 밑으로 떨어지지 않으면 보너스 돈을 주는 금융 상품이에요!">
            ELS
          </TitleHighlight>
          에요.
        </Title>
        <Subtitle>선물 상자를 무사히 지키면 보너스를 받을 수 있어요!</Subtitle>
      </HeroSection>

      <Grid>
        {/* Visual Panel */}
        <VisualPanel>
          <TimerBadge $visible={isRunning}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>schedule</span>
            남은 기간: <strong>{monthsLeft}</strong>개월
          </TimerBadge>

          <GiftContainer $animated={!isRunning && !showOverlay}>
            {giftEmoji}
          </GiftContainer>

          <GaugeSection>
            <GaugeLabelRow>
              <GaugeLabel>현재 주가</GaugeLabel>
              <PriceLabel style={{ color: markerColor }}>{currentPrice}%</PriceLabel>
            </GaugeLabelRow>
            <GaugeTrack>
              <DangerZone $width={barrier}>
                <span>DANGER</span>
              </DangerZone>
              <SafeZone><span>SAFE ZONE</span></SafeZone>
              <PriceMarker $left={priceMarkerPos} $color={markerColor} />
            </GaugeTrack>
            <GaugeAxisRow>
              <span>0% (폭락)</span>
              <span>100% (시작)</span>
            </GaugeAxisRow>
          </GaugeSection>
        </VisualPanel>

        {/* Control Panel */}
        <ControlPanel>
          <Card>
            <CardTitle>
              <span className="material-symbols-outlined" style={{ color: '#0059b9' }}>tune</span>
              상품 설정하기
            </CardTitle>

            <SliderRow>
              <SliderLabel title="낙인(Knock-In) 배리어: 선물 상자가 터져서 돈을 잃게 되는 위험 커트라인이에요!">
                낙인 배리어
              </SliderLabel>
              <SliderValue>{barrier}%</SliderValue>
            </SliderRow>

            <StyledSlider
              type="range"
              min={30}
              max={80}
              step={5}
              value={barrier}
              onChange={e => setBarrier(Number(e.target.value))}
              disabled={isRunning}
            />

            <SliderHint>
              <span>위험함 (낮은 배리어)</span>
              <span>안전함 (높은 배리어)</span>
            </SliderHint>

            <InfoBanner style={{ marginTop: 16 }}>
              <span className="material-symbols-outlined" style={{ color: '#006d37', flexShrink: 0 }}>info</span>
              낙인 배리어가 낮을수록(왼쪽) 보너스 수익이 커지지만, 상자가 터질 위험도 커져요!
            </InfoBanner>

            <StartBtn
              $disabled={isRunning}
              onClick={startSimulation}
              disabled={isRunning}
              style={{ marginTop: 24 }}
            >
              <span className="material-symbols-outlined">play_arrow</span>
              {isRunning ? '시뮬레이션 중...' : '실험 시작'}
            </StartBtn>
          </Card>

          <TipCard>
            <h3>
              <span className="material-symbols-outlined">lightbulb</span>
              알고 있나요?
            </h3>
            <p>
              ELS는 주가가 조금 떨어져도 약속한 '커트라인(낙인)'만 넘지 않으면
              예금보다 높은 이자를 주는 똑똑한 상품이에요.
            </p>
          </TipCard>
        </ControlPanel>
      </Grid>

      {/* Result Overlay */}
      <Overlay $visible={showOverlay}>
        <OverlayCard>
          <OverlayIcon $color={success ? '#006d37' : '#ba1a1a'}>
            <span className="material-symbols-outlined">
              {success ? 'celebration' : 'warning'}
            </span>
          </OverlayIcon>
          <h2 style={{ color: success ? '#006d37' : '#ba1a1a' }}>
            {success ? '실험 성공! 보너스 획득!' : '앗! 상자가 터졌어요!'}
          </h2>
          <p>
            {success
              ? `축하해요! 주가가 한 번도 ${barrier}% 아래로 떨어지지 않아서 약속한 보너스를 받았어요!`
              : `주가가 커트라인인 ${barrier}% 아래로 떨어져서 원금 손실 위험이 생겼어요! 다음엔 조금 더 안전하게 설정해볼까요?`}
          </p>
          <OverlayBtn onClick={resetGame}>다시 도전하기</OverlayBtn>
        </OverlayCard>
      </Overlay>
    </PageLayout>
  );
}
