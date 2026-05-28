import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import PageLayout from '../components/layout/PageLayout';
import {
  generateGBMPath, findKnockInIndex, findEarlyRedemptionIndex,
  EVAL_INDICES, REDEMPTION_THRESHOLDS, PricePoint,
} from '../utils/priceGenerator';

// ELS 시뮬레이터: 전문가 수준 주가 차트 + GBM 기반 현실적 가격 경로
// 녹인 배리어(빨강)와 조기상환선(초록)을 차트에 직접 표시하여
// 학생이 ELS의 구조적 위험을 시각적으로 이해할 수 있도록 설계

// ──────────────────── Styled Components ────────────────────

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

const TooltipTrigger = styled.span`
  position: relative;
  display: inline-block;
`;

const TermHighlight = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 2px dotted ${({ theme }) => theme.colors.primary};
  cursor: help;
`;

const XylitolTooltip = styled.div`
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 50;
  background: ${({ theme }) => theme.colors.surfaceContainerHighest};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  box-shadow: ${({ theme }) => theme.shadows.floating};
  border-radius: 9999px;
  padding: 10px 20px;
  width: 320px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  white-space: normal;
  line-height: 1.5;

  ${TooltipTrigger}:hover & {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
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

const ChartPanel = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
`;

const ChartHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  gap: 8px;
`;

const ChartTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const PriceBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const PriceBadge = styled.div<{ $color: string; $bg: string }>`
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-size: 14px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LegendRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const LegendItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};

  &::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 2px;
    background: ${({ $color }) => $color};
    border-top: 2px dashed ${({ $color }) => $color};
  }
`;

const LegendDot = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};

  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    border: 2px solid white;
    box-shadow: 0 0 0 1px ${({ $color }) => $color};
  }
`;

const ChartPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 320px;
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.outline};
  font-weight: 600;
  gap: 8px;
`;

const StatusBanner = styled.div<{ $status: 'idle' | 'running' | 'knocked-in' | 'redeemed' | 'matured-loss' | 'matured-gain' }>`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s, color 0.3s;
  background: ${({ $status }) => {
    switch ($status) {
      case 'knocked-in': return '#fff0f0';
      case 'redeemed': case 'matured-gain': return '#e8f5e9';
      case 'matured-loss': return '#ffdad6';
      default: return '#ecedf7';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'knocked-in': return '#ba1a1a';
      case 'redeemed': case 'matured-gain': return '#006d37';
      case 'matured-loss': return '#93000a';
      default: return '#414754';
    }
  }};
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
  font-size: 20px;
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
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const SliderValue = styled.span`
  font-size: 22px;
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
    background: ${({ theme }) => theme.colors.dangerRed};
    border-radius: 50%;
    cursor: pointer;
    border: 4px solid white;
    box-shadow: 0 4px 12px rgba(186,26,26,0.25);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SliderHint = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const InfoBanner = styled.div`
  background: rgba(0, 109, 55, 0.08);
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.onSecondaryContainer};
  margin-top: 16px;
`;

const StartBtn = styled.button<{ $disabled: boolean }>`
  width: 100%;
  background: ${({ theme, $disabled }) => $disabled ? theme.colors.outline : theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: ${({ $disabled, theme }) => $disabled ? 'none' : theme.shadows.card};
  transition: transform 0.15s, filter 0.15s;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  margin-top: 20px;

  &:hover:not(:disabled) { transform: scale(1.02); filter: brightness(1.05); }
  &:active:not(:disabled) { transform: scale(0.98); }
`;

const TipCard = styled.div`
  background: #ffdcc5;
  color: #301400;
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};

  h3 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p { font-size: 15px; font-weight: 500; line-height: 1.6; }
`;

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
  max-width: 480px;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.rounded.lg};
  text-align: center;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2);

  h2 { font-size: 28px; font-weight: 700; margin-bottom: 12px; }
  p {
    font-size: 16px; font-weight: 500;
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
    line-height: 1.7;
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`;

const OverlayIcon = styled.div<{ $color: string }>`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  span.material-symbols-outlined {
    font-size: 64px;
    color: ${({ $color }) => $color};
    font-variation-settings: 'FILL' 0, 'wght' 700;
  }
`;

const OverlayStatRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const OverlayStat = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color}15;
  border-radius: 16px;
  padding: 12px 20px;
  text-align: center;

  p:first-child { font-size: 12px; font-weight: 600; color: #727785; margin-bottom: 4px; }
  p:last-child { font-size: 20px; font-weight: 800; color: ${({ $color }) => $color}; }
`;

const OverlayBtn = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  font-size: 18px;
  font-weight: 700;
  transition: filter 0.15s;
  &:hover { filter: brightness(1.1); }
`;

// ──────────────────── Custom Recharts Dot ────────────────────

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: PricePoint;
  barrierRatio?: number;
  hasKnockedIn?: boolean;
}

function EvalDot({ cx = 0, cy = 0, payload, barrierRatio = 0.5, hasKnockedIn = false }: CustomDotProps) {
  if (!payload?.isEvalNode || payload.week === 0) return null;
  const threshold = REDEMPTION_THRESHOLDS[payload.week] ?? 0.85;
  const aboveThreshold = payload.price >= threshold && !hasKnockedIn;
  const belowBarrier = payload.price < barrierRatio;
  const color = belowBarrier ? '#ba1a1a' : aboveThreshold ? '#006d37' : '#0059b9';

  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={color} stroke="white" strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={12} fill={color} opacity={0.15} />
    </g>
  );
}

// ──────────────────── Status helpers ────────────────────

type SimStatus = 'idle' | 'running' | 'knocked-in' | 'redeemed' | 'matured-loss' | 'matured-gain';

const STATUS_LABEL: Record<SimStatus, string> = {
  idle: '⏸ 시뮬레이션 대기 중',
  running: '📈 시뮬레이션 진행 중...',
  'knocked-in': '🚨 녹인 발생! 위험 구간 진입',
  redeemed: '✅ 조기 상환 성공!',
  'matured-loss': '📉 만기 — 원금 손실 발생',
  'matured-gain': '🎊 만기 — 수익 실현!',
};

// ──────────────────── Main Component ────────────────────

export default function ELSPage() {
  const [barrier, setBarrier] = useState(50); // percent (30–80)
  const [status, setStatus] = useState<SimStatus>('idle');
  const [revealedCount, setRevealedCount] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [hasKnockedIn, setHasKnockedIn] = useState(false);
  const [redeemedAtMonth, setRedeemedAtMonth] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  const fullPathRef = useRef<PricePoint[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isRunning = status === 'running' || status === 'knocked-in';
  const barrierRatio = barrier / 100;

  // 현재 표시 중인 데이터 슬라이스
  const visibleData = useMemo(
    () => fullPathRef.current.slice(0, revealedCount),
    [revealedCount]
  );

  // 현재 가격 (마지막 공개 포인트)
  const currentPrice = visibleData.length > 0
    ? visibleData[visibleData.length - 1].price
    : 1.0;

  // 차트 선 색상
  const lineColor = hasKnockedIn ? '#ba1a1a' : '#0059b9';

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const endGame = useCallback((finalStatus: SimStatus, finalPt?: PricePoint) => {
    stopSimulation();
    setStatus(finalStatus);
    if (finalPt) setFinalPrice(parseFloat((finalPt.price * 100).toFixed(1)));
    setTimeout(() => setShowOverlay(true), 600);
  }, [stopSimulation]);

  const startSimulation = useCallback(() => {
    if (isRunning) return;

    // 새 GBM 경로 생성
    const path = generateGBMPath(156);
    fullPathRef.current = path;
    const kiIdx = findKnockInIndex(path, barrierRatio);
    const erIdx = findEarlyRedemptionIndex(path, barrierRatio);

    setRevealedCount(1);
    setStatus('running');
    setHasKnockedIn(false);
    setShowOverlay(false);
    setRedeemedAtMonth(null);
    setFinalPrice(null);

    let knocked = false;
    let count = 1;

    intervalRef.current = setInterval(() => {
      count += 1;
      setRevealedCount(count);

      const pt = path[count - 1];

      // 녹인 감지
      if (!knocked && kiIdx !== -1 && count - 1 >= kiIdx) {
        knocked = true;
        setHasKnockedIn(true);
        setStatus('knocked-in');
      }

      // 조기상환 감지 (녹인 없을 때만)
      if (!knocked && erIdx !== -1 && count - 1 >= erIdx) {
        const redemptionMonth = Math.round((erIdx / 52) * 12);
        setRedeemedAtMonth(redemptionMonth);
        endGame('redeemed', pt);
        return;
      }

      // 만기 도달
      if (count >= path.length) {
        const lastPt = path[path.length - 1];
        if (knocked && lastPt.price < 1.0) {
          endGame('matured-loss', lastPt);
        } else {
          endGame('matured-gain', lastPt);
        }
      }
    }, 60); // 60ms/틱 × 156틱 ≈ 9.4초
  }, [isRunning, barrierRatio, endGame]);

  const resetGame = useCallback(() => {
    stopSimulation();
    fullPathRef.current = [];
    setRevealedCount(0);
    setStatus('idle');
    setHasKnockedIn(false);
    setShowOverlay(false);
    setRedeemedAtMonth(null);
    setFinalPrice(null);
  }, [stopSimulation]);

  useEffect(() => () => stopSimulation(), [stopSimulation]);

  // X축 라벨: 6개월 노드에만 월 표시
  const xAxisFormatter = (week: number) => {
    if (EVAL_INDICES.includes(week as typeof EVAL_INDICES[number])) {
      return `${Math.round((week / 52) * 12)}M`;
    }
    return '';
  };

  // Y축 퍼센트 포맷
  const yAxisFormatter = (v: number) => `${(v * 100).toFixed(0)}%`;

  // 차트 툴팁
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: PricePoint }> }) => {
    if (!active || !payload?.length) return null;
    const pt = payload[0].payload;
    const pct = (pt.price * 100).toFixed(1);
    return (
      <div style={{
        background: 'white', border: '1px solid #c1c6d6', borderRadius: 12,
        padding: '8px 14px', fontSize: 13, fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      }}>
        <p style={{ color: '#727785', marginBottom: 2 }}>{pt.month}개월차</p>
        <p style={{ color: pt.price < barrierRatio ? '#ba1a1a' : '#0059b9', fontSize: 16 }}>
          {pct}%
        </p>
        {pt.isEvalNode && pt.week > 0 && (
          <p style={{ color: '#006d37', fontSize: 11, marginTop: 2 }}>
            📍 {Math.round((pt.week / 52) * 12)}개월 평가일
          </p>
        )}
      </div>
    );
  };

  // 조기상환선 라벨
  const RedemptionLabel = ({ viewBox }: { viewBox?: { x?: number; y?: number; width?: number } }) => {
    if (!viewBox) return null;
    const { x = 0, y = 0, width = 0 } = viewBox;
    return (
      <text x={x + width - 4} y={y - 6} textAnchor="end" fontSize={11} fontWeight={700} fill="#006d37">
        조기상환 85%
      </text>
    );
  };

  // 녹인선 라벨
  const KnockInLabel = ({ viewBox }: { viewBox?: { x?: number; y?: number; width?: number } }) => {
    if (!viewBox) return null;
    const { x = 0, y = 0, width = 0 } = viewBox;
    return (
      <text x={x + width - 4} y={y + 14} textAnchor="end" fontSize={11} fontWeight={700} fill="#ba1a1a">
        녹인 {barrier}%
      </text>
    );
  };

  return (
    <PageLayout>
      {/* Hero */}
      <HeroSection>
        <Title>
          지금 가입하는 상품은{' '}
          <TooltipTrigger>
            <TermHighlight>ELS</TermHighlight>
            <XylitolTooltip>
              ELS(주가연계증권): 주가가 약속한 선 밑으로 떨어지지 않으면 보너스 수익을 주는 금융 상품이에요. 마치 시험에서 낙제만 하지 않으면 장학금을 받는 것과 같아요!
            </XylitolTooltip>
          </TooltipTrigger>
          에요.
        </Title>
        <Subtitle>GBM 기반 현실적 주가 경로로 36개월 시뮬레이션을 체험해보세요.</Subtitle>
      </HeroSection>

      <Grid>
        {/* ── Chart Panel ── */}
        <ChartPanel>
          <ChartHeaderRow>
            <div>
              <ChartTitle>기초자산 가격 시뮬레이터</ChartTitle>
              <div style={{ fontSize: 12, color: '#727785', marginTop: 2 }}>
                시작가 100% 기준 · GBM (연간 변동성 18%)
              </div>
            </div>
            <PriceBadgeRow>
              {status !== 'idle' && (
                <PriceBadge
                  $color={currentPrice < barrierRatio ? '#ba1a1a' : '#0059b9'}
                  $bg={currentPrice < barrierRatio ? '#fff0f0' : '#e8f0fe'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>show_chart</span>
                  현재 {(currentPrice * 100).toFixed(1)}%
                </PriceBadge>
              )}
              <PriceBadge $color="#ba1a1a" $bg="#fff0f0">
                <span style={{ fontSize: 11 }}>▼</span>
                녹인 {barrier}%
              </PriceBadge>
              <PriceBadge $color="#006d37" $bg="#e8f5e9">
                <span style={{ fontSize: 11 }}>▲</span>
                상환 85%
              </PriceBadge>
            </PriceBadgeRow>
          </ChartHeaderRow>

          {/* Legend */}
          <LegendRow>
            <LegendItem $color="#006d37">조기상환 기준선 (85%)</LegendItem>
            <LegendItem $color="#ba1a1a">녹인 배리어 ({barrier}%)</LegendItem>
            <LegendDot $color="#0059b9">6개월 평가일</LegendDot>
            <LegendDot $color="#006d37">상환 조건 충족</LegendDot>
          </LegendRow>

          {/* Chart or placeholder */}
          {visibleData.length < 2 ? (
            <ChartPlaceholder>
              <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.4 }}>show_chart</span>
              시뮬레이션을 시작하면 주가 경로가 여기에 그려져요
            </ChartPlaceholder>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={visibleData} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0059b9" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#0059b9" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="priceGradRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0.01} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="4 4" stroke="#e6e8f2" vertical={false} />

                <XAxis
                  dataKey="week"
                  tickFormatter={xAxisFormatter}
                  ticks={EVAL_INDICES as unknown as number[]}
                  tick={{ fontSize: 11, fill: '#727785', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#c1c6d6' }}
                />

                <YAxis
                  tickFormatter={yAxisFormatter}
                  domain={[0.1, 1.6]}
                  ticks={[0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4]}
                  tick={{ fontSize: 11, fill: '#727785' }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />

                <RechartsTooltip content={<CustomTooltip />} />

                {/* 조기상환 기준선 (초록 점선) */}
                <ReferenceLine
                  y={0.85}
                  stroke="#006d37"
                  strokeDasharray="6 3"
                  strokeWidth={1.5}
                  label={<RedemptionLabel />}
                />

                {/* 녹인 배리어 (빨강 점선) — 슬라이더 연동 */}
                <ReferenceLine
                  y={barrierRatio}
                  stroke="#ba1a1a"
                  strokeDasharray="6 3"
                  strokeWidth={1.5}
                  label={<KnockInLabel />}
                />

                {/* 가격 경로 */}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={lineColor}
                  strokeWidth={2.5}
                  fill={`url(#${hasKnockedIn ? 'priceGradRed' : 'priceGradBlue'})`}
                  dot={(props) => (
                    <EvalDot
                      key={`dot-${props.cx}-${props.cy}`}
                      cx={props.cx}
                      cy={props.cy}
                      payload={props.payload as PricePoint}
                      barrierRatio={barrierRatio}
                      hasKnockedIn={hasKnockedIn}
                    />
                  )}
                  activeDot={{ r: 5, fill: lineColor, stroke: 'white', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Status Banner */}
          <StatusBanner $status={status}>
            {STATUS_LABEL[status]}
          </StatusBanner>
        </ChartPanel>

        {/* ── Control Panel ── */}
        <ControlPanel>
          <Card>
            <CardTitle>
              <span className="material-symbols-outlined" style={{ color: '#0059b9' }}>tune</span>
              상품 설정하기
            </CardTitle>

            <SliderRow>
              <TooltipTrigger>
                <SliderLabel>
                  <TermHighlight>녹인 배리어</TermHighlight>
                </SliderLabel>
                <XylitolTooltip>
                  낙인(Knock-In) 배리어: 이 선 아래로 주가가 떨어지면 원금 손실 위험이 생겨요. 시험의 과락 기준선과 같아요!
                </XylitolTooltip>
              </TooltipTrigger>
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
              <span>30% (공격적)</span>
              <span>80% (보수적)</span>
            </SliderHint>

            {/* 배리어별 리스크 가이드 */}
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: barrier <= 45 ? '#fff0f0' : barrier <= 60 ? '#fff3e0' : '#e8f5e9',
              borderRadius: 12, fontSize: 12, fontWeight: 600,
              color: barrier <= 45 ? '#ba1a1a' : barrier <= 60 ? '#904800' : '#006d37',
            }}>
              {barrier <= 45 && '⚠️ 낮은 배리어 — 녹인 가능성 높음, 수익 높음'}
              {barrier > 45 && barrier <= 60 && '⚖️ 중간 배리어 — 균형 잡힌 위험/수익'}
              {barrier > 60 && '🛡️ 높은 배리어 — 안전하지만 수익 제한적'}
            </div>

            <InfoBanner>
              <span className="material-symbols-outlined" style={{ color: '#006d37', flexShrink: 0, fontSize: 18 }}>info</span>
              배리어가 낮을수록 수익률이 높아지지만 녹인 확률도 올라가요. 배리어를 조정하며 여러 시나리오를 체험해보세요!
            </InfoBanner>

            <StartBtn
              $disabled={isRunning}
              onClick={isRunning ? undefined : startSimulation}
              disabled={isRunning}
            >
              <span className="material-symbols-outlined">
                {isRunning ? 'hourglass_top' : 'play_arrow'}
              </span>
              {isRunning ? '시뮬레이션 중...' : '시뮬레이션 시작'}
            </StartBtn>
          </Card>

          <TipCard>
            <h3>
              <span className="material-symbols-outlined">lightbulb</span>
              알고 있나요?
            </h3>
            <p>
              ELS는 매 6개월마다 주가를 평가해요. 기준 이상이면 조기에 수익을 받고 종료되고,
              기준 미달이면 계속 유지돼요. 하지만 한 번이라도 녹인이 발생하면
              만기 때 주가에 따라 원금 손실이 생길 수 있어요.
            </p>
          </TipCard>
        </ControlPanel>
      </Grid>

      {/* ── Result Overlay ── */}
      <Overlay $visible={showOverlay}>
        <OverlayCard>
          <OverlayIcon $color={
            status === 'redeemed' || status === 'matured-gain' ? '#006d37' : '#ba1a1a'
          }>
            <span className="material-symbols-outlined">
              {status === 'redeemed' || status === 'matured-gain' ? 'celebration' : 'warning'}
            </span>
          </OverlayIcon>

          <h2 style={{
            color: status === 'redeemed' || status === 'matured-gain' ? '#006d37' : '#ba1a1a'
          }}>
            {status === 'redeemed' && '조기 상환 성공! 🎉'}
            {status === 'matured-gain' && '만기 수익 실현! 🎊'}
            {status === 'matured-loss' && '만기 — 원금 손실 발생 📉'}
            {status === 'knocked-in' && '녹인 발생! 위험 상황 🚨'}
          </h2>

          <OverlayStatRow>
            <OverlayStat $color={finalPrice && finalPrice >= 100 ? '#006d37' : '#ba1a1a'}>
              <p>최종 가격</p>
              <p>{finalPrice !== null ? `${finalPrice}%` : '—'}</p>
            </OverlayStat>
            {redeemedAtMonth !== null && (
              <OverlayStat $color="#006d37">
                <p>상환 시점</p>
                <p>{redeemedAtMonth}개월</p>
              </OverlayStat>
            )}
            <OverlayStat $color="#727785">
              <p>녹인 배리어</p>
              <p>{barrier}%</p>
            </OverlayStat>
          </OverlayStatRow>

          <p>
            {status === 'redeemed' &&
              `${redeemedAtMonth}개월차 평가에서 주가가 상환 기준을 넘어 조기 상환됐어요! 배리어를 높여 다시 시도해보세요.`}
            {status === 'matured-gain' &&
              `36개월 만기까지 녹인 없이 버텼어요! 최종 주가 ${finalPrice}%로 약정 수익률과 함께 원금이 반환됩니다.`}
            {status === 'matured-loss' &&
              `녹인이 발생했고 만기 주가가 ${finalPrice}%로 시작가 100% 미만이에요. 녹인 배리어를 낮추면 안전성이 높아집니다.`}
            {status === 'knocked-in' &&
              `주가가 녹인 배리어 ${barrier}%를 돌파했어요. 만기까지 주가가 회복되지 않으면 원금 손실이 발생합니다.`}
          </p>

          <OverlayBtn onClick={resetGame}>다시 시뮬레이션하기</OverlayBtn>
        </OverlayCard>
      </Overlay>
    </PageLayout>
  );
}
