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

export interface StockPoint {
  /** 틱 인덱스 (0~N) */
  index: number;
  /** 정규화 가격 (1.0 = 100%) */
  price: number;
  /** 6개월 평가 노드 여부 */
  isEvalNode: boolean;
  /** 실제 원화 가격 (basePrice × price) */
  krwPrice: number;
}

// 6개월 평가 노드 (StockPage 동일 주기 사용)
const STOCK_EVAL_WEEKS = [0, 26, 52, 78, 104, 130, 156];

/**
 * 주식 차트용 GBM 경로 생성
 * - 연간 변동성 20%, 약한 양의 드리프트(μ=0.04)
 * - 랜덤 충격 이벤트 최대 3회 (−10% ~ −25% 즉시 하락)
 * - 충격 후 완만한 회복 경향 포함
 * @param weeks 총 주 수 (기본 156 = 36개월)
 * @param basePrice 시작 원화 가격 (기본 50000)
 */
export function generateStockPath(weeks = 156, basePrice = 50000): StockPoint[] {
  const VOL = 0.20;
  const MU = 0.04;
  const dt = 1 / 52;

  // 충격 이벤트 위치: 최대 3개, 최소 간격 10주
  const shockCount = Math.floor(Math.random() * 3);
  const shockWeeks = new Set<number>();
  for (let i = 0; i < shockCount; i++) {
    let attempts = 0;
    while (attempts++ < 30) {
      const w = Math.floor(Math.random() * (weeks - 10)) + 5;
      const tooClose = [...shockWeeks].some(sw => Math.abs(sw - w) < 10);
      if (!tooClose) { shockWeeks.add(w); break; }
    }
  }

  const path: StockPoint[] = [];
  let s = 1.0;

  for (let w = 0; w <= weeks; w++) {
    path.push({
      index: w,
      price: parseFloat(s.toFixed(4)),
      isEvalNode: STOCK_EVAL_WEEKS.includes(w),
      krwPrice: Math.round(s * basePrice),
    });

    if (w >= weeks) break;

    const z = gaussianRandom();
    let logReturn = (MU - 0.5 * VOL ** 2) * dt + VOL * Math.sqrt(dt) * z;

    // 충격 이벤트 적용 (즉각 낙폭)
    if (shockWeeks.has(w + 1)) {
      const shock = -(0.10 + Math.random() * 0.15); // −10% ~ −25%
      logReturn += shock;
    }

    s = Math.max(0.20, Math.min(3.0, s * Math.exp(logReturn)));
  }

  return path;
}

/**
 * 경로에서 조기상환 발생 여부 확인 (6개월 평가 노드 기준)
 * @returns 조기상환 발생 주 인덱스, 없으면 -1
 */
export function findEarlyRedemptionIndex(path: PricePoint[], barrierRatio: number): number {
  const evalNodes = EVAL_INDICES.slice(1); // 0 제외
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
