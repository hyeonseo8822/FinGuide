import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import PageLayout from '../components/layout/PageLayout';
import { generateStockPath, extendStockPath, STOCK_EVAL_DAYS, StockPoint } from '../utils/priceGenerator';

// 주식 시뮬레이터: GBM 기반 전문가 수준 차트 + 호가 + 매수/매도 패널
// 실전 거래 화면을 단순화하여 초보자가 주식 용어를 체험하도록 설계

// ──────────────────── Styled Components ────────────────────

const pulseDot = keyframes`
  0%   { transform: scale(1);   opacity: 1; }
  50%  { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1);   opacity: 1; }
`;

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: start;
  @media (min-width: 1024px) { grid-template-columns: 8fr 4fr; }
`;

const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RightCol = styled.div`
  position: sticky;
  top: 88px;
`;

const SectionHeader = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
`;

const Title = styled.h1`
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  margin-bottom: 4px;
`;

const Desc = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const LiveBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.surfaceContainerHigh};
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.safeGreen};
  white-space: nowrap;
`;

const LiveDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.safeGreen};
  animation: ${pulseDot} 1.5s infinite;
`;

// ── Main Stock Card ──

const StockCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
`;

const StockMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  gap: 12px;
`;

const StockName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-bottom: 4px;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
`;

const BigPrice = styled.span`
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  color: ${({ theme }) => theme.colors.onSurface};
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

const PriceUnit = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const PriceChange = styled.span<{ $up: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${({ $up, theme }) => $up ? theme.colors.dangerRed : theme.colors.primary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 24px;
  text-align: right;
`;

const StatItem = styled.div`
  p:first-child { font-size: 11px; color: ${({ theme }) => theme.colors.outline}; }
  p:last-child  { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.onSurface}; }
`;

// ── Chart area ──

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const ChartTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const LegendRow = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div<{ $color: string; $dashed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};

  &::before {
    content: '';
    display: inline-block;
    width: 18px;
    height: 2px;
    background: ${({ $dashed, $color }) => $dashed ? 'none' : $color};
    border-top: ${({ $dashed, $color }) => $dashed ? `2px dashed ${$color}` : 'none'};
  }
`;

const LegendDot = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};

  &::before {
    content: '';
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    border: 2px solid white;
    box-shadow: 0 0 0 1px ${({ $color }) => $color};
    display: inline-block;
  }
`;

const ChartContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  height: 300px;
  width: 100%;
`;

// Period selector tabs
const PeriodRow = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 12px;
`;

const PeriodBtn = styled.button<{ $active: boolean }>`
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.surfaceContainerHigh};
  color: ${({ $active, theme }) => $active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant};
  transition: all 0.15s;
  &:hover { opacity: 0.85; }
`;

// ── Asset Info ──

const AssetsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr 1fr; }
`;

const AssetCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};

  label {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.outline};
    display: block;
    margin-bottom: 6px;
  }
`;

const AssetValue = styled.p`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
`;

// ── Order Book ──

const OrderBook = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const OrderBookTitle = styled.div`
  background: ${({ theme }) => theme.colors.surfaceContainerHigh};
  padding: 8px ${({ theme }) => theme.spacing.md};
  font-size: 14px;
  font-weight: 700;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
`;

const OrderRow = styled.div<{ $side: 'buy' | 'sell' }>`
  display: flex;
  justify-content: space-between;
  padding: 7px ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.white};
  cursor: pointer;
  background: ${({ $side }) => $side === 'sell' ? 'rgba(0,89,185,0.04)' : 'rgba(186,26,26,0.04)'};
  transition: background 0.12s;

  &:hover {
    background: ${({ $side }) => $side === 'sell' ? 'rgba(0,89,185,0.09)' : 'rgba(186,26,26,0.09)'};
  }

  span:first-child {
    font-size: 13px;
    color: ${({ $side, theme }) => $side === 'sell' ? theme.colors.primary : theme.colors.dangerRed};
    font-variant-numeric: tabular-nums;
  }
  span:last-child {
    font-size: 13px;
    font-family: monospace;
    color: ${({ theme }) => theme.colors.onSurface};
  }
`;

// ── Trading Panel ──

const TradingPanel = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
`;

const TabRow = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.outline};
  border-bottom: ${({ $active, theme }) => $active ? `2px solid ${theme.colors.primary}` : '2px solid transparent'};
  transition: color 0.15s;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormLabel = styled.label`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-bottom: 6px;
`;

const PriceInput = styled.div`
  position: relative;
  input {
    width: 100%;
    background: ${({ theme }) => theme.colors.surfaceContainerLow};
    border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
    border-radius: ${({ theme }) => theme.rounded.DEFAULT};
    padding: 11px 12px;
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.onSurface};
    font-variant-numeric: tabular-nums;
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
    }
  }
  span {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: ${({ theme }) => theme.colors.outline};
  }
`;

const QtyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  button {
    width: 40px;
    height: 40px;
    border-radius: ${({ theme }) => theme.rounded.DEFAULT};
    background: ${({ theme }) => theme.colors.surfaceContainerHigh};
    font-size: 20px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.12s;
    &:hover { background: ${({ theme }) => theme.colors.surfaceContainerHighest}; }
  }
  input {
    flex: 1;
    background: ${({ theme }) => theme.colors.surfaceContainerLow};
    border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
    border-radius: ${({ theme }) => theme.rounded.DEFAULT};
    padding: 11px;
    font-size: 16px;
    font-weight: 700;
    text-align: center;
    color: ${({ theme }) => theme.colors.onSurface};
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const Summary = styled.div`
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  > div {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    &:last-child {
      font-size: 15px;
      font-weight: 700;
      border-top: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
      padding-top: 8px;
      margin-top: 8px;
    }
  }
`;

const TradeBtn = styled.button<{ $type: 'buy' | 'sell' }>`
  width: 100%;
  background: ${({ $type, theme }) => $type === 'buy' ? theme.colors.primary : theme.colors.dangerRed};
  color: white;
  padding: 15px;
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 0.15s, transform 0.15s;
  box-shadow: ${({ $type }) => $type === 'buy'
    ? '0 8px 24px rgba(0,89,185,0.2)'
    : '0 8px 24px rgba(186,26,26,0.2)'};
  &:hover  { filter: brightness(1.08); }
  &:active { transform: scale(0.96); }
`;

const LearningGrid = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xl};
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  @media (min-width: 768px) { grid-template-columns: repeat(3, 1fr); }
`;

const LearningCard = styled.div`
  background: rgba(224, 226, 236, 0.3);
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
  h3 { font-size: 15px; font-weight: 700; color: ${({ theme }) => theme.colors.onSurface}; margin: 6px 0; }
  p  { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.onSurfaceVariant}; line-height: 1.5; }
`;

const IconCircle = styled.div<{ $color: string }>`
  width: 40px; height: 40px;
  background: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-bottom: 6px;
  span.material-symbols-outlined { font-size: 20px; color: ${({ $color }) => $color}; }
`;

// ──────────────────── Period config ────────────────────
// 거래일 기준: 1년 ≈ 252 거래일, 6개월 ≈ 126 거래일

const PERIODS: { label: string; days: number }[] = [
  { label: '6M', days: 126 },
  { label: '1Y', days: 252 },
  { label: '2Y', days: 504 },
  { label: '3Y', days: 756 },
];

// 6개월(126 거래일) 단위 평가 노드 (priceGenerator.STOCK_EVAL_DAYS와 동기화)
const EVAL_DAYS = [...STOCK_EVAL_DAYS];

// ELS 임계값
const REDEMPTION_LINE = 0.85;  // 조기상환 85%
const KNOCKIN_LINE    = 0.50;  // 녹인 50%

const BASE_PRICE = 50000;

// 각 기간별 애니메이션 파라미터
// 목표: 모든 기간이 약 8~10초 안에 완료되도록 스트라이드(건너뛰기) 조정
const REVEAL_TARGET_MS = 9000; // 총 애니메이션 목표 시간 (ms)
const TICK_INTERVAL_MS = 32;   // requestAnimationFrame에 맞춘 최소 간격 (ms)

// ──────────────────── Custom Recharts components ────────────────────

interface EvalDotProps {
  cx?: number;
  cy?: number;
  payload?: StockPoint;
}

function EvalDot({ cx = 0, cy = 0, payload }: EvalDotProps) {
  if (!payload?.isEvalNode || payload.index === 0) return null;
  const aboveRedemption = payload.price >= REDEMPTION_LINE;
  const belowKnockIn    = payload.price < KNOCKIN_LINE;
  const color = belowKnockIn ? '#ba1a1a' : aboveRedemption ? '#006d37' : '#0059b9';

  return (
    <g key={`eval-${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={6}  fill={color} stroke="white" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={11} fill={color} opacity={0.15} />
    </g>
  );
}

interface TooltipPayload {
  payload?: StockPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function ChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  if (!pt) return null;
  const pct = (pt.price * 100).toFixed(1);
  const aboveRedemption = pt.price >= REDEMPTION_LINE;
  const belowKnockIn    = pt.price < KNOCKIN_LINE;
  const textColor = belowKnockIn ? '#ba1a1a' : aboveRedemption ? '#006d37' : '#0059b9';

  return (
    <div style={{
      background: 'white',
      border: '1px solid #c1c6d6',
      borderRadius: 12,
      padding: '8px 14px',
      fontSize: 12,
      fontWeight: 600,
      boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
      minWidth: 130,
    }}>
      <p style={{ color: '#727785', marginBottom: 3 }}>
        {Math.round(pt.index / 21)}개월차
      </p>
      <p style={{ color: textColor, fontSize: 15, marginBottom: 2 }}>
        {pt.krwPrice.toLocaleString()}원
      </p>
      <p style={{ color: '#727785', fontSize: 11 }}>{pct}% (시작가 대비)</p>
      {pt.isEvalNode && pt.index > 0 && (
        <p style={{ color: '#006d37', fontSize: 10, marginTop: 4 }}>
          📍 {Math.round(pt.index / 21)}개월 평가일
        </p>
      )}
    </div>
  );
}

// ──────────────────── Reference line labels ────────────────────

interface RefLabelProps {
  viewBox?: { x?: number; y?: number; width?: number };
  label: string;
  color: string;
  above?: boolean;
}

function RefLabel({ viewBox, label, color, above = true }: RefLabelProps) {
  if (!viewBox) return null;
  const { x = 0, y = 0, width = 0 } = viewBox;
  return (
    <text
      x={x + width - 4}
      y={above ? y - 5 : y + 13}
      textAnchor="end"
      fontSize={10}
      fontWeight={700}
      fill={color}
    >
      {label}
    </text>
  );
}

// ──────────────────── Main component ────────────────────

export default function StockPage() {
  // ── Chart state ──
  const [visibleData, setVisibleData]       = useState<StockPoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(3); // 기본 3Y

  // ── Live price shown in the ticker header ──
  const [price, setPrice] = useState(BASE_PRICE);

  // ── Trading state ──
  const [wallet, setWallet]     = useState(1_000_000);
  const [stocks, setStocks]     = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [qty, setQty]           = useState(1);
  const [tab, setTab]           = useState<'buy' | 'sell'>('buy');
  const [notification, setNotification] = useState<string | null>(null);

  const animRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullPathRef = useRef<StockPoint[]>([]);
  const BASE = 47600;

  const stopAll = useCallback(() => {
    if (animRef.current)  { clearInterval(animRef.current);  animRef.current  = null; }
    if (liveRef.current)  { clearInterval(liveRef.current);  liveRef.current  = null; }
  }, []);

  // ── Build and start a new path ──
  const startPath = useCallback((periodIdx: number) => {
    stopAll();
    const days = PERIODS[periodIdx].days;
    const path = generateStockPath(days, BASE_PRICE);
    fullPathRef.current = path;

    // 애니메이션 스트라이드: 목표 시간 안에 완료되도록 한 번에 몇 틱씩 추가할지 결정
    // stride=1이면 매 tick마다 1포인트, stride>1이면 건너뛰기
    const totalTicks = Math.ceil(REVEAL_TARGET_MS / TICK_INTERVAL_MS); // ≈ 281
    const stride = Math.max(1, Math.ceil(days / totalTicks));

    let cursor = 0;
    setVisibleData([path[0]]);
    setPrice(path[0].krwPrice);

    animRef.current = setInterval(() => {
      cursor = Math.min(cursor + stride, path.length - 1);
      setVisibleData(prev => {
        const lastIdx = prev[prev.length - 1]?.index ?? -1;
        if (path[cursor].index <= lastIdx) return prev;
        const toAdd = path.slice(lastIdx + 1, cursor + 1);
        return [...prev, ...toAdd];
      });
      setPrice(path[cursor].krwPrice);

      if (cursor >= path.length - 1) {
        clearInterval(animRef.current!);
        animRef.current = null;
        // 라이브 GBM 연장 시작
        startLiveTicker(path[path.length - 1], path.length);
      }
    }, TICK_INTERVAL_MS);
  }, [stopAll]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 라이브 GBM 티커: 같은 모델로 자연스럽게 연장 ──
  // 2초마다 1 거래일 연장 → 실제 시장처럼 느린 업데이트
  const startLiveTicker = useCallback((lastPt: StockPoint, nextIdx: number) => {
    let cur = lastPt;
    let idx = nextIdx;
    liveRef.current = setInterval(() => {
      const next = extendStockPath(cur, BASE_PRICE, idx);
      cur = next;
      idx++;
      setPrice(next.krwPrice);
      setVisibleData(prev => {
        // 차트에는 마지막 N개만 유지해 메모리 폭증 방지 (최대 원래 경로 길이만큼)
        const maxLen = fullPathRef.current.length;
        const trimmed = prev.length >= maxLen ? prev.slice(1) : prev;
        return [...trimmed, next];
      });
    }, 2000); // 2초 = 실제 거래일 1일 경과 느낌
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  // ── 기간 변경 → 새 경로 재생성 ──
  useEffect(() => {
    startPath(selectedPeriod);
  }, [selectedPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 파생 값 ──
  const latestPt   = visibleData[visibleData.length - 1];
  const isPositive = latestPt ? latestPt.price >= 1.0 : true;
  const lineColor  = isPositive ? '#0059b9' : '#ba1a1a';
  const gradId     = isPositive ? 'stockGradBlue' : 'stockGradRed';

  // Y 도메인: 보이는 범위의 15% 패딩 (단, 좌우 이동 시 축이 너무 많이 뛰지 않도록 소수점 1자리로 반올림)
  const yDomain = useMemo((): [number, number] => {
    if (visibleData.length === 0) return [0.6, 1.4];
    const prices = visibleData.map(p => p.price);
    const mn  = Math.min(...prices);
    const mx  = Math.max(...prices);
    const pad = Math.max((mx - mn) * 0.12, 0.06);
    // 1자리 반올림 → 축이 조금씩만 움직임
    return [
      Math.floor((mn - pad) * 10) / 10,
      Math.ceil((mx  + pad) * 10) / 10,
    ];
  }, [visibleData]);

  // X 틱: 보이는 범위 내 평가 노드만
  const lastVisibleIdx = visibleData[visibleData.length - 1]?.index ?? 0;
  const xTicks = useMemo(
    () => EVAL_DAYS.filter(d => d <= lastVisibleIdx),
    [lastVisibleIdx]
  );

  // ── 거래 ──
  const notify = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  const trade = useCallback((type: 'buy' | 'sell') => {
    const total = price * qty;
    if (type === 'buy') {
      if (wallet >= total) {
        setWallet(w => w - total);
        setAvgPrice(ap => stocks === 0 ? price : Math.round((ap * stocks + total) / (stocks + qty)));
        setStocks(s => s + qty);
        notify('매수 완료!');
      } else notify('잔액이 부족합니다.');
    } else {
      if (stocks >= qty) {
        setWallet(w => w + price * qty);
        setStocks(s => s - qty);
        notify('매도 완료!');
      } else notify('보유 수량이 부족합니다.');
    }
  }, [price, qty, wallet, stocks, notify]);

  const pnlValue = stocks > 0 ? (price - avgPrice) * stocks : 0;
  const pnlPct   = stocks > 0 && avgPrice > 0
    ? ((pnlValue / (avgPrice * stocks)) * 100).toFixed(2)
    : '0.00';
  const diff    = price - BASE;
  const diffPct = ((diff / BASE) * 100).toFixed(1);

  // ↺ 재생성 버튼
  const replay = useCallback(() => startPath(selectedPeriod), [selectedPeriod, startPath]);

  return (
    <PageLayout>
      {/* Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#0059b9', color: 'white', padding: '10px 24px',
          borderRadius: 9999, fontWeight: 700, fontSize: 15, zIndex: 999,
          boxShadow: '0 8px 24px rgba(0,89,185,0.3)',
        }}>
          {notification}
        </div>
      )}

      <SectionHeader>
        <HeaderRow>
          <div>
            <Title>나도 주식 투자자! 실전 시뮬레이션</Title>
            <Desc>어려운 금융 용어를 쉽고 재미있게 배워보세요.</Desc>
          </div>
          <LiveBadge>
            <LiveDot />
            시장 열림 (Live)
          </LiveBadge>
        </HeaderRow>
      </SectionHeader>

      <PageGrid>
        <LeftCol>
          {/* ── Stock Card + Chart ── */}
          <StockCard>
            <StockMeta>
              <div>
                <StockName>꿈틀꿈틀 로봇 (005930)</StockName>
                <PriceRow>
                  <BigPrice>{price.toLocaleString()}</BigPrice>
                  <PriceUnit>원</PriceUnit>
                  <PriceChange $up={diff >= 0}>
                    {diff >= 0 ? '▲' : '▼'} {Math.abs(diff).toLocaleString()} ({diffPct}%)
                  </PriceChange>
                </PriceRow>
              </div>
              <StatsGrid>
                <StatItem><p>고가</p><p style={{ color: '#ba1a1a' }}>52,300</p></StatItem>
                <StatItem><p>거래량</p><p>1,240,123</p></StatItem>
                <StatItem><p>저가</p><p style={{ color: '#0059b9' }}>48,100</p></StatItem>
                <StatItem><p>시총</p><p>450조</p></StatItem>
              </StatsGrid>
            </StockMeta>

            {/* Chart header */}
            <ChartHeader>
              <ChartTitle>GBM 기반 시뮬레이션 (KOSPI 200 근사)</ChartTitle>
              <LegendRow>
                <LegendItem $color="#006d37" $dashed>조기상환 85%</LegendItem>
                <LegendItem $color="#ba1a1a" $dashed>녹인 50%</LegendItem>
                <LegendDot $color="#0059b9">6개월 평가일</LegendDot>
              </LegendRow>
            </ChartHeader>

            {/* Recharts AreaChart */}
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={visibleData}
                  margin={{ top: 16, right: 8, left: -4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="stockGradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0059b9" stopOpacity={0.20} />
                      <stop offset="95%" stopColor="#0059b9" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="stockGradRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ba1a1a" stopOpacity={0.16} />
                      <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e6e8f2"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="index"
                    ticks={xTicks}
                    tickFormatter={w => `${Math.round(w / 21)}M`}
                    tick={{ fontSize: 10, fill: '#727785', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: '#c1c6d6' }}
                  />

                  <YAxis
                    domain={yDomain}
                    tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                    tick={{ fontSize: 10, fill: '#727785' }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />

                  <RechartsTooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: '#c1c6d6', strokeWidth: 1, strokeDasharray: '4 2' }}
                  />

                  {/* 조기상환 기준선 — 초록 점선 */}
                  <ReferenceLine
                    y={REDEMPTION_LINE}
                    stroke="#006d37"
                    strokeDasharray="5 3"
                    strokeWidth={1.5}
                    label={
                      <RefLabel
                        label="조기상환 85%"
                        color="#006d37"
                        above
                      />
                    }
                  />

                  {/* 녹인 배리어 — 빨강 점선 */}
                  <ReferenceLine
                    y={KNOCKIN_LINE}
                    stroke="#ba1a1a"
                    strokeDasharray="5 3"
                    strokeWidth={1.5}
                    label={
                      <RefLabel
                        label="녹인 50%"
                        color="#ba1a1a"
                        above={false}
                      />
                    }
                  />

                  {/* 가격 경로 */}
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={lineColor}
                    strokeWidth={2}
                    fill={`url(#${gradId})`}
                    dot={(props) => (
                      <EvalDot
                        key={`dot-${props.index}`}
                        cx={props.cx}
                        cy={props.cy}
                        payload={props.payload as StockPoint}
                      />
                    )}
                    activeDot={{
                      r: 5,
                      fill: lineColor,
                      stroke: 'white',
                      strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Period selector + replay */}
            <PeriodRow>
              {PERIODS.map((p, i) => (
                <PeriodBtn
                  key={p.label}
                  $active={selectedPeriod === i}
                  onClick={() => setSelectedPeriod(i)}
                >
                  {p.label}
                </PeriodBtn>
              ))}
              <PeriodBtn
                $active={false}
                onClick={replay}
                style={{ marginLeft: 'auto' }}
              >
                ↺ 재생성
              </PeriodBtn>
            </PeriodRow>
          </StockCard>

          {/* ── Asset Summary ── */}
          <AssetsGrid>
            <AssetCard>
              <label>예수금 (가용 잔액)</label>
              <AssetValue>{wallet.toLocaleString()}원</AssetValue>
            </AssetCard>
            <AssetCard>
              <label>평가 손익</label>
              <AssetValue style={{ color: pnlValue >= 0 ? '#ba1a1a' : '#0059b9' }}>
                {pnlValue >= 0 ? '+' : ''}{pnlValue.toLocaleString()}원
              </AssetValue>
              <span style={{ fontSize: 12, color: pnlValue >= 0 ? '#ba1a1a' : '#0059b9' }}>
                {pnlValue >= 0 ? '+' : ''}{pnlPct}%
              </span>
            </AssetCard>
            <AssetCard>
              <label>보유 수량</label>
              <AssetValue>{stocks}주</AssetValue>
            </AssetCard>
          </AssetsGrid>

          {/* ── Order Book ── */}
          <OrderBook>
            <OrderBookTitle>호가 정보</OrderBookTitle>
            <OrderRow $side="sell"><span>{(price + 300).toLocaleString()}</span><span>1,245</span></OrderRow>
            <OrderRow $side="sell"><span>{(price + 200).toLocaleString()}</span><span>4,520</span></OrderRow>
            <OrderRow $side="sell"><span><strong>{(price + 100).toLocaleString()}</strong></span><span>8,102</span></OrderRow>
            <OrderRow $side="buy"><span><strong>{(price - 100).toLocaleString()}</strong></span><span>12,400</span></OrderRow>
            <OrderRow $side="buy"><span>{(price - 200).toLocaleString()}</span><span>5,123</span></OrderRow>
            <OrderRow $side="buy"><span>{(price - 300).toLocaleString()}</span><span>2,300</span></OrderRow>
          </OrderBook>
        </LeftCol>

        {/* ── Trading Panel ── */}
        <RightCol>
          <TradingPanel>
            <TabRow>
              <Tab $active={tab === 'buy'}  onClick={() => setTab('buy')}>매수</Tab>
              <Tab $active={tab === 'sell'} onClick={() => setTab('sell')}>매도</Tab>
            </TabRow>

            <FormGroup>
              <FormLabel>
                <span>지정가격</span>
                <span style={{ fontSize: 11, color: '#727785' }}>시장가 가능</span>
              </FormLabel>
              <PriceInput>
                <input type="text" readOnly value={price.toLocaleString()} />
                <span>원</span>
              </PriceInput>
            </FormGroup>

            <FormGroup>
              <FormLabel>주문수량</FormLabel>
              <QtyRow>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </QtyRow>
            </FormGroup>

            <Summary>
              <div>
                <span style={{ color: '#727785' }}>주문가능</span>
                <span>{wallet.toLocaleString()}원</span>
              </div>
              <div>
                <span>총 주문금액</span>
                <span style={{ color: '#0059b9' }}>{(price * qty).toLocaleString()}원</span>
              </div>
            </Summary>

            <TradeBtn $type="buy"  onClick={() => trade('buy')}>매수하기</TradeBtn>
            <TradeBtn $type="sell" onClick={() => trade('sell')}>매도하기</TradeBtn>
          </TradingPanel>
        </RightCol>
      </PageGrid>

      {/* ── Learning Cards ── */}
      <LearningGrid>
        <LearningCard>
          <IconCircle $color="#0059b9">
            <span className="material-symbols-outlined">account_balance</span>
          </IconCircle>
          <h3>원금 보장 주의</h3>
          <p>투자는 이익을 볼 수도 있지만, 원금보다 줄어들 수도 있다는 점을 꼭 기억하세요!</p>
        </LearningCard>
        <LearningCard>
          <IconCircle $color="#006d37">
            <span className="material-symbols-outlined">security</span>
          </IconCircle>
          <h3>분산 투자의 법칙</h3>
          <p>"계란을 한 바구니에 담지 마라"는 말처럼, 여러 곳에 나누어 투자하면 위험을 줄일 수 있어요.</p>
        </LearningCard>
        <LearningCard>
          <IconCircle $color="#904800">
            <span className="material-symbols-outlined">insights</span>
          </IconCircle>
          <h3>기업 분석하기</h3>
          <p>단순한 가격 변화보다는 그 회사가 어떤 물건을 만들고 얼마나 잘 팔고 있는지 살펴보는 것이 중요해요.</p>
        </LearningCard>
      </LearningGrid>
    </PageLayout>
  );
}
