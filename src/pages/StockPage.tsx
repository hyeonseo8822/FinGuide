import { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import PageLayout from '../components/layout/PageLayout';

// 주식 시뮬레이터: 실시간 차트 + 호가 정보 + 매수/매도 패널
// 실전 거래 화면을 단순화하여 초보자가 주식 용어를 체험하도록 설계

const pulseDot = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
`;

// Layout
const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: start;

  @media (min-width: 1024px) {
    grid-template-columns: 8fr 4fr;
  }
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

// Header
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

// Stock Card
const StockCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
`;

const StockMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
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
`;

const BigPrice = styled.span`
  font-size: 48px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.onSurface};
  line-height: 1;
`;

const PriceUnit = styled.span`
  font-size: 24px;
  font-weight: 700;
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
  p:first-child {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.outline};
  }
  p:last-child {
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.onSurface};
  }
`;

// Chart
const ChartWrap = styled.div`
  height: 300px;
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
  overflow: hidden;
  position: relative;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

// Asset Info
const AssetsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const AssetCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};

  label {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.outline};
    display: block;
    margin-bottom: 8px;
  }
`;

const AssetValue = styled.p`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
`;

// Order Book
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
  font-size: 16px;
  font-weight: 700;
  border-bottom: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
`;

const OrderRow = styled.div<{ $side: 'buy' | 'sell' }>`
  display: flex;
  justify-content: space-between;
  padding: 8px ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid white;
  cursor: pointer;
  background: ${({ $side }) => $side === 'sell' ? 'rgba(0,89,185,0.04)' : 'rgba(186,26,26,0.04)'};
  transition: background 0.15s;

  &:hover {
    background: ${({ $side }) => $side === 'sell' ? 'rgba(0,89,185,0.08)' : 'rgba(186,26,26,0.08)'};
  }

  span:first-child {
    font-size: 13px;
    color: ${({ $side, theme }) => $side === 'sell' ? theme.colors.primary : theme.colors.dangerRed};
  }

  span:last-child {
    font-size: 13px;
    font-family: monospace;
    color: ${({ theme }) => theme.colors.onSurface};
  }
`;

// Trading Panel
const TradingPanel = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.rounded.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
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
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-bottom: 8px;
`;

const PriceInput = styled.div`
  position: relative;

  input {
    width: 100%;
    background: ${({ theme }) => theme.colors.surfaceContainerLow};
    border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
    border-radius: ${({ theme }) => theme.rounded.DEFAULT};
    padding: 12px;
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.onSurface};

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
    transition: background 0.15s;

    &:hover { background: ${({ theme }) => theme.colors.surfaceContainerHighest}; }
  }

  input {
    flex: 1;
    background: ${({ theme }) => theme.colors.surfaceContainerLow};
    border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};
    border-radius: ${({ theme }) => theme.rounded.DEFAULT};
    padding: 12px;
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
      font-size: 16px;
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
  padding: 16px;
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

  &:hover { filter: brightness(1.1); }
  &:active { transform: scale(0.95); }
`;

const LearningGrid = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xl};
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const LearningCard = styled.div`
  background: rgba(224, 226, 236, 0.3);
  border-radius: ${({ theme }) => theme.rounded.DEFAULT};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.surfaceContainer};

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.onSurface};
    margin: ${({ theme }) => theme.spacing.xs} 0;
  }

  p {
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.onSurfaceVariant};
    line-height: 1.5;
  }
`;

const IconCircle = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-bottom: 8px;

  span.material-symbols-outlined {
    font-size: 20px;
    color: ${({ $color }) => $color};
  }
`;

// --- Chart SVG helper ---
function buildPath(points: number[]): string {
  if (points.length < 2) return '';
  const w = 800;
  const h = 300;
  const step = w / (points.length - 1);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => [
    i * step,
    h - ((p - min) / range) * (h - 40) - 20,
  ]);

  let d = `M${coords[0][0]},${coords[0][1]}`;
  for (let i = 1; i < coords.length; i++) {
    d += ` T${coords[i][0]},${coords[i][1]}`;
  }
  return d;
}

export default function StockPage() {
  const [price, setPrice] = useState(50441);
  const [wallet, setWallet] = useState(1000000);
  const [stocks, setStocks] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [chartPoints, setChartPoints] = useState([210, 190, 170, 180, 160, 150, 160, 170]);
  const [notification, setNotification] = useState<string | null>(null);
  const BASE_PRICE = 47600;

  const priceRef = useRef(price);
  priceRef.current = price;

  // 3초마다 가격 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor((Math.random() - 0.48) * 800);
      const next = Math.max(10000, priceRef.current + change);
      setPrice(next);
      setChartPoints(prev => {
        const newPts = [...prev.slice(1), 300 - ((next - 30000) / 30000) * 280];
        return newPts;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      } else {
        notify('잔액이 부족합니다.');
      }
    } else {
      if (stocks >= qty) {
        setWallet(w => w + price * qty);
        setStocks(s => s - qty);
        notify('매도 완료!');
      } else {
        notify('보유 수량이 부족합니다.');
      }
    }
  }, [price, qty, wallet, stocks, notify]);

  const pnlValue = stocks > 0 ? (price - avgPrice) * stocks : 0;
  const pnlPct = stocks > 0 && avgPrice > 0 ? ((pnlValue / (avgPrice * stocks)) * 100).toFixed(2) : '0.00';
  const diff = price - BASE_PRICE;
  const diffPct = ((diff / BASE_PRICE) * 100).toFixed(1);
  const pathD = buildPath(chartPoints);

  return (
    <PageLayout>
      {/* Notification toast */}
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
          {/* Stock Card */}
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

            <ChartWrap>
              <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#005bbe" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#005bbe" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {pathD && (
                  <>
                    <path d={`${pathD} L800,300 L0,300 Z`} fill="url(#chartGrad)" />
                    <path d={pathD} fill="none" stroke="#005bbe" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="800" cy={chartPoints[chartPoints.length - 1]} r="5" fill="#005bbe" />
                  </>
                )}
              </svg>
            </ChartWrap>
          </StockCard>

          {/* Assets */}
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
              <span style={{ fontSize: 13, color: pnlValue >= 0 ? '#ba1a1a' : '#0059b9' }}>
                {pnlValue >= 0 ? '+' : ''}{pnlPct}%
              </span>
            </AssetCard>
            <AssetCard>
              <label>보유 수량</label>
              <AssetValue>{stocks}주</AssetValue>
            </AssetCard>
          </AssetsGrid>

          {/* Order Book */}
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

        {/* Trading Panel */}
        <RightCol>
          <TradingPanel>
            <TabRow>
              <Tab $active={tab === 'buy'} onClick={() => setTab('buy')}>매수</Tab>
              <Tab $active={tab === 'sell'} onClick={() => setTab('sell')}>매도</Tab>
            </TabRow>

            <FormGroup>
              <FormLabel>
                <span>지정가격</span>
                <span style={{ fontSize: 12, color: '#727785' }}>시장가 가능</span>
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

            <TradeBtn $type="buy" onClick={() => trade('buy')}>
              매수하기
            </TradeBtn>
            <TradeBtn $type="sell" onClick={() => trade('sell')}>
              매도하기
            </TradeBtn>
          </TradingPanel>
        </RightCol>
      </PageGrid>

      {/* Learning Cards */}
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
