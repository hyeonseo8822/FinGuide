// GBM(기하 브라운 운동) 기반 주가 경로 생성기
// S(t+Δt) = S(t) × exp((μ - σ²/2)Δt + σ√Δt × Z)
// 매주 한 틱 → 36개월 = 156주 (6개월 = 26주)

const ANNUAL_VOL = 0.18;   // 연간 변동성 18% (코스피200 근사)
const DRIFT = 0.0;          // 무편향 드리프트 (공정한 시뮬레이션)
const DT = 1 / 52;          // 주간 스텝 (1/52년)

// 정규분포 난수 — Box-Muller 변환
function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// 6개월(26주) 단위 평가 노드 인덱스
export const EVAL_INDICES = [0, 26, 52, 78, 104, 130, 156] as const;

// 각 평가 시점의 조기상환 기준 (실제 한국 ELS 구조 근사)
export const REDEMPTION_THRESHOLDS: Record<number, number> = {
  26: 0.85,   // 6개월
  52: 0.85,   // 12개월
  78: 0.80,   // 18개월
  104: 0.80,  // 24개월
  130: 0.75,  // 30개월
  156: 0.70,  // 36개월 (만기)
};

export interface PricePoint {
  week: number;     // 0~156
  price: number;    // 정규화 가격 (1.0 = 시작가 100%)
  month: number;    // 근사 개월 수
  isEvalNode: boolean;
}

/**
 * GBM 기반 주간 가격 경로 생성
 * @param weeks 생성할 주 수 (기본 156 = 36개월)
 * @returns PricePoint 배열
 */
export function generateGBMPath(weeks: number = 156): PricePoint[] {
  const path: PricePoint[] = [];
  let s = 1.0;

  for (let w = 0; w <= weeks; w++) {
    path.push({
      week: w,
      price: parseFloat(s.toFixed(4)),
      month: Math.round((w / 52) * 12),
      isEvalNode: (EVAL_INDICES as readonly number[]).includes(w),
    });

    if (w < weeks) {
      const z = gaussianRandom();
      const logReturn = (DRIFT - 0.5 * ANNUAL_VOL ** 2) * DT + ANNUAL_VOL * Math.sqrt(DT) * z;
      s = s * Math.exp(logReturn);
      // 현실적 범위 클램핑 [0.15, 2.00]
      s = Math.max(0.15, Math.min(2.0, s));
    }
  }

  return path;
}

/**
 * 경로에서 최초 녹인 인덱스 찾기
 * @returns 녹인 발생 인덱스, 없으면 -1
 */
export function findKnockInIndex(path: PricePoint[], barrierRatio: number): number {
  for (let i = 1; i < path.length; i++) {
    if (path[i].price < barrierRatio) return i;
  }
  return -1;
}

// ─── Stock chart GBM (StockPage 전용) ───────────────────────────────────────
// 일간 틱(1/252년 스텝)을 사용해 실제 KOSPI200/S&P500 차트와 유사한
// 연속적이고 자연스러운 가격 경로를 생성합니다.

export interface StockPoint {
  /** 틱 인덱스 (0~N, 거래일 단위) */
  index: number;
  /** 정규화 가격 (1.0 = 시작가 100%) */
  price: number;
  /** 6개월(126 거래일) 단위 평가 노드 여부 */
  isEvalNode: boolean;
  /** 실제 원화 가격 (basePrice × price) */
  krwPrice: number;
}

// 6개월 = 126 거래일 단위 평가 노드
export const STOCK_EVAL_DAYS = [0, 126, 252, 378, 504, 630, 756] as const;

/**
 * 일간 GBM 기반 주식 경로 생성
 *
 * 설계 원칙:
 *  - Δt = 1/252 (거래일 기준)  → 일별 σ ≈ 1.26%, 주별처럼 보이는 큰 점프 없음
 *  - 트렌드 교체: 40~80 거래일마다 모멘텀 방향이 서서히 반전
 *  - 충격 이벤트: 최대 2회, −8%~−18% 즉각 하락 후 평균 회귀 바이어스 추가
 *  - 클램프: [0.25, 2.80]
 *
 * @param tradingDays 생성할 거래일 수 (기본 756 = 3년)
 * @param basePrice   시작 원화 가격 (기본 50000)
 */
export function generateStockPath(tradingDays = 756, basePrice = 50000): StockPoint[] {
  const VOL = 0.18;          // 연간 변동성 18%
  const BASE_MU = 0.04;      // 기본 연간 드리프트 4%
  const DT = 1 / 252;        // 일간 스텝
  const MEAN_REVERT = 0.015; // 충격 후 평균 회귀 속도

  // ── 충격 이벤트: 최대 2개, 최소 간격 40 거래일 ──
  const shockCount = Math.random() < 0.7 ? Math.floor(Math.random() * 2) + 1 : 0;
  const shockDays = new Set<number>();
  for (let i = 0; i < shockCount; i++) {
    let attempts = 0;
    while (attempts++ < 40) {
      const d = Math.floor(Math.random() * (tradingDays - 20)) + 10;
      if (![...shockDays].some(sd => Math.abs(sd - d) < 40)) {
        shockDays.add(d);
        break;
      }
    }
  }

  // ── 트렌드 교체: 랜덤 길이 구간마다 모멘텀 부호 교체 ──
  let trendMu = BASE_MU;
  let trendRemaining = Math.floor(40 + Math.random() * 40);
  let postShockRecovery = 0; // 충격 직후 회귀 바이어스 기간

  const path: StockPoint[] = [];
  let s = 1.0;

  for (let d = 0; d <= tradingDays; d++) {
    path.push({
      index: d,
      price: parseFloat(s.toFixed(4)),
      isEvalNode: (STOCK_EVAL_DAYS as readonly number[]).includes(d),
      krwPrice: Math.round(s * basePrice),
    });

    if (d >= tradingDays) break;

    // 트렌드 교체 타이머
    trendRemaining--;
    if (trendRemaining <= 0) {
      // 새 구간: 방향 ±, 크기 0~BASE_MU*2
      trendMu = (Math.random() < 0.55 ? 1 : -1) * Math.random() * BASE_MU * 1.8;
      trendRemaining = Math.floor(40 + Math.random() * 40);
    }

    // 충격 후 회귀 기간이면 상승 바이어스 추가
    const recoveryMu = postShockRecovery > 0 ? MEAN_REVERT : 0;
    if (postShockRecovery > 0) postShockRecovery--;

    const z = gaussianRandom();
    const mu = trendMu + recoveryMu;
    let logReturn = (mu - 0.5 * VOL ** 2) * DT + VOL * Math.sqrt(DT) * z;

    // 충격 이벤트 (해당 거래일에 즉각 적용)
    if (shockDays.has(d + 1)) {
      logReturn += -(0.08 + Math.random() * 0.10); // −8% ~ −18%
      postShockRecovery = Math.floor(20 + Math.random() * 30); // 회귀 기간 20~50일
    }

    s = Math.max(0.25, Math.min(2.80, s * Math.exp(logReturn)));
  }

  return path;
}

/**
 * 경로 마지막 지점에서 GBM 한 틱 연장 (라이브 티커용)
 * 별도 랜덤 노이즈 대신 동일 GBM 모델로 연속성 유지
 */
export function extendStockPath(last: StockPoint, basePrice: number, dayIndex: number): StockPoint {
  const VOL = 0.18;
  const MU  = 0.04;
  const DT  = 1 / 252;
  const z   = gaussianRandom();
  const logReturn = (MU - 0.5 * VOL ** 2) * DT + VOL * Math.sqrt(DT) * z;
  const nextPrice = Math.max(0.25, Math.min(2.80, last.price * Math.exp(logReturn)));
  return {
    index: dayIndex,
    price: parseFloat(nextPrice.toFixed(4)),
    isEvalNode: (STOCK_EVAL_DAYS as readonly number[]).includes(dayIndex),
    krwPrice: Math.round(nextPrice * basePrice),
  };
}

/**
 * 경로에서 조기상환 발생 여부 확인 (6개월 평가 노드 기준)
 * @returns 조기상환 발생 주 인덱스, 없으면 -1
 */
export function findEarlyRedemptionIndex(path: PricePoint[], barrierRatio: number): number {
  const evalNodes = EVAL_INDICES.slice(1, -1); // 0, 156(만기) 제외 — 만기는 조기상환 아님
  for (const nodeIdx of evalNodes) {
    if (nodeIdx >= path.length) break;
    const pt = path[nodeIdx];
    const threshold = REDEMPTION_THRESHOLDS[nodeIdx] ?? 0.85;
    // 녹인 없이 기준 이상이면 조기상환
    const hadKnockIn = path.slice(0, nodeIdx + 1).some(p => p.price < barrierRatio);
    if (!hadKnockIn && pt.price >= threshold) {
      return nodeIdx;
    }
  }
  return -1;
}
